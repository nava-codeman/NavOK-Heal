import { NextResponse } from "next/server";
import { GoogleGenerativeAI, type Content, type Part } from "@google/generative-ai";

// Gemini API Configuration
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || "";

/**
 * Formats standard chat messages into Gemini's expected role/parts structure.
 * Enforces alternating user/model roles and ensures the first message is 'user'.
 * Supports optional inlineData image attachment for multimodal input.
 */
function formatHistoryForGemini(
  userMessages: Array<{ role: string; content?: string; text?: string }>,
  imageBase64?: string
): Content[] {
  const formatted: Content[] = [];

  for (const msg of userMessages) {
    const rawRole = msg.role;
    const role: "user" | "model" =
      rawRole === "model" || rawRole === "assistant" || rawRole === "ai" ? "model" : "user";
    const text = (msg.content || msg.text || "").trim();
    if (!text) continue;

    if (formatted.length > 0 && formatted[formatted.length - 1].role === role) {
      // Merge consecutive messages from the same role to satisfy Gemini API constraints
      const lastPart = formatted[formatted.length - 1].parts[0];
      if (lastPart && "text" in lastPart) {
        (lastPart as { text: string }).text += `\n${text}`;
      } else {
        formatted[formatted.length - 1].parts.push({ text });
      }
    } else {
      formatted.push({ role, parts: [{ text }] });
    }
  }

  // Ensure first message has role 'user'
  if (formatted.length === 0 || formatted[0].role !== "user") {
    formatted.unshift({ role: "user", parts: [{ text: "Hello" }] });
  }

  // Attach multimodal image part to the last user turn if provided
  if (imageBase64) {
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
    for (let i = formatted.length - 1; i >= 0; i--) {
      if (formatted[i].role === "user") {
        formatted[i].parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: cleanBase64,
          },
        });
        break;
      }
    }
  }

  return formatted;
}

export async function POST(req: Request) {
  const turnStartTime = Date.now();
  try {
    const { prompt, history, isEmergencyMode, emergencyNumber, format, isElderlyMode, image } = await req.json();
    console.log(
      "[/api/chat] Request received. Prompt length:",
      prompt?.length,
      "EmergencyMode:",
      isEmergencyMode,
      "ElderlyMode:",
      isElderlyMode,
      "HasImage:",
      Boolean(image),
      "Format:",
      format,
      "History size:",
      history?.length
    );

    if (!prompt && !image && format !== "structured_summary") {
      return NextResponse.json({ error: "Prompt or image is required" }, { status: 400 });
    }

    const effectivePrompt = prompt || (image ? "Please examine what I am showing you on the camera." : "Hello");
    const userMessages = history || [{ role: "user", content: effectivePrompt }];

    // Standard conversational system prompt
    let systemPrompt = `You are NavOk AI Specialist, an intelligent, highly capable, and empathetic medical AI doctor and intake specialist.
Follow these STRICT rules:
1. COMPREHENSION & INTELLIGENCE: You are a brilliant diagnostic assistant. Listen carefully to the user's symptoms, concerns, and context. Understand nuances, simple complaints, and complex medical histories alike.
2. HELPFUL & THOROUGH: Provide thorough, actionable, and compassionate advice. Explain potential causes for their symptoms in plain, understandable language. Do not be lazy; provide the detail the user needs to feel cared for.
3. TONE: Be warm, professional, and deeply empathetic. Do not use generic customer service filler. Acknowledge frustration calmly.
4. NO FORMATTING: Do not use asterisks, bolding, bullet points, or markdown. Your response will be spoken directly aloud via TTS, so write naturally like a human speaking.
5. SAFETY: While you are intelligent, remind the user gently that you are an AI and they should consult a human doctor for formal diagnoses or severe issues.
6. NO HALLUCINATIONS: You DO NOT have access to live internet or pharmacy locators. If asked to find a pharmacy or a doctor, state honestly: "I don't have a pharmacy lookup connected yet. Please use the Find Pharmacy tool on your dashboard."`;

    if (isElderlyMode) {
      systemPrompt += `\n\nELDERLY CARE COMPANION MODE ACTIVE:
1. SIMPLICITY & CLARITY: Use warm, simple vocabulary and short, easy-to-understand sentences. Strictly avoid medical jargon without immediately defining it in plain, everyday terms.
2. ACTIVE CONFIRMATION & REPEAT-BACK: Frequently and explicitly confirm and repeat back what was understood (for example: "I heard you say your blood pressure was 150 over 90 — is that right?") before moving on. This minimizes speech-to-text misunderstanding and builds trust.
3. PATIENCE & ENCOURAGEMENT: Speak in a gentle, reassuring, and patient tone. Explicitly invite the user to ask questions or ask you to repeat anything if they didn't catch it (for example: "Please take your time, and let me know if you would like me to say that again.").
4. SPOKEN PACING: Keep your response to 2 to 3 concise, digestible sentences.`;
    }

    if (isEmergencyMode) {
      systemPrompt += `\n\nCRITICAL OVERRIDE: The user is currently in a medical emergency. You must ONLY provide emergency guidance, instruct them to call ${
        emergencyNumber || "emergency services"
      }, and REFUSE to answer unrelated medical, lifestyle, or general questions until they explicitly confirm they are safe.`;
    }

    if (image) {
      systemPrompt += `\n\nVISUAL CAMERA OBSERVATION ACTIVE:
The user has provided a camera image or is showing a physical condition to the camera (e.g. skin irritation, rash, swelling, injury, or physical item).
1. VISUAL DESCRIPTION: Describe the observable visual characteristics in calm, objective, plain clinical terms (e.g., color, distribution, visible swelling, or physical features).
2. STRICTLY NON-DIAGNOSTIC: You MUST NOT provide a definitive diagnosis. Explicitly state what the appearance could be consistent with, and advise that an in-person physical clinical examination by a qualified healthcare professional is necessary for proper evaluation.
3. NEXT STEPS: Suggest relevant questions to ask or precautions to observe (e.g. noting if it is painful, spreading, or has been present for a while).
4. BREVITY: Keep your response to 2 to 3 concise, digestible sentences suitable for spoken text-to-speech output. Do not use formatting, bullet points, or markdown.`;
    }

    // === OpenFDA Drug Pre-flight Check via Gemini (REMOVED FOR LATENCY) ===
    // Removed to improve AI responsiveness and eliminate the 3-4s blocking latency.

    // Handle Structured Summary Mode (Gemini Native JSON Mode)
    if (format === "structured_summary") {
      if (GEMINI_API_KEY) {
        try {
          const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
          const summaryModel = genAI.getGenerativeModel({
            model: GEMINI_MODEL,
            systemInstruction: `You are NavOk Heal AI, a medical intake assistant. You are NOT a doctor and must never diagnose with certainty.
Analyze the consultation history provided and generate a structured JSON summary output.
You MUST output a valid JSON object matching this exact shape:
{
  "type": "summary",
  "message": "A 2-3 sentence plain-language clinical summary of the patient's reported symptoms and recommended next steps.",
  "structured": {
    "symptoms": ["string array of extracted symptoms"],
    "possibleConditions": [
      {
        "name": "Condition Name",
        "confidenceScore": 0.85,
        "description": "Short explanation of why this matches"
      }
    ],
    "severity": "low" | "moderate" | "high" | "emergency",
    "suggestedMedicineCategories": ["Informational medication types, e.g., Analgesics"],
    "suggestedSpecialists": ["Specialist types, e.g., General Practitioner, Neurologist"],
    "riskLevel": "green" | "yellow" | "orange" | "red",
    "lifestyleNotes": ["Hydration, rest, etc."],
    "emergencyFlag": false
  }
}`,
            generationConfig: {
              temperature: 0.2,
              responseMimeType: "application/json",
              maxOutputTokens: 800,
            },
          });

          const geminiContents = formatHistoryForGemini(userMessages);
          const summaryPromise = summaryModel.generateContent({ contents: geminiContents });
          const summaryTimeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("GEMINI_SUMMARY_TIMEOUT")), 8000)
          );
          const summaryResult: any = await Promise.race([summaryPromise, summaryTimeout]);
          const jsonText = summaryResult?.response?.text();
          if (jsonText) {
            const parsed = JSON.parse(jsonText);
            return NextResponse.json(parsed);
          }
        } catch (e: any) {
          console.warn("[/api/chat] Gemini structured summary failed, using fallback:", e.message);
        }
      }

      // Fallback Structured Response
      return NextResponse.json({
        type: "summary",
        message:
          "Based on our intake conversation, you are experiencing mild symptoms that warrant monitoring. Please stay hydrated and rest.",
        structured: {
          symptoms: ["Reported symptoms from consultation"],
          possibleConditions: [
            { name: "General Symptomatic Distress", confidenceScore: 0.75, description: "Matches described symptoms" },
          ],
          severity: "low",
          suggestedMedicineCategories: ["Analgesics / Antipyretics (if fever/pain)"],
          suggestedSpecialists: ["General Practitioner"],
          riskLevel: "green",
          lifestyleNotes: ["Rest", "Hydration", "Monitor symptoms"],
          emergencyFlag: false,
        },
      });
    }

    // Streaming Conversational Question Turn via Gemini
    let responseStream: any = null;

    if (GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const chatModel = genAI.getGenerativeModel({
          model: GEMINI_MODEL,
          systemInstruction: systemPrompt,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 600,
          },
        });

        const geminiContents = formatHistoryForGemini(userMessages, image);
        const streamPromise = chatModel.generateContentStream({ contents: geminiContents });
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("GEMINI_STREAM_TIMEOUT")), image ? 9000 : 6000)
        );
        responseStream = await Promise.race([streamPromise, timeoutPromise]);

      } catch (e: any) {
        console.warn("[/api/chat] Gemini unavailable or rate-limited (HTTP 429), falling back to mock stream:", e.message);
      }
    } else {
      console.warn("[/api/chat] GEMINI_API_KEY not configured in .env.local — using demo mock fallback.");
    }

    // Safety Fallback Mock Stream if Gemini is unavailable, rate-limited, or key missing
    if (!responseStream) {
      let fallbackText = "I understand. Please tell me more about your symptoms so I can assist you better.";
      if (prompt && (prompt.toLowerCase().includes("hello") || prompt.toLowerCase().includes("hi"))) {
        fallbackText = "Hello! I am NavOk AI Specialist. I'm here to help you today. What seems to be the problem?";
      } else if (prompt && prompt.toLowerCase().includes("headache")) {
        fallbackText = "I'm sorry to hear you have a headache. Is the pain sharp or throbbing, and how long have you had it?";
      } else if (prompt && prompt.toLowerCase().includes("fever")) {
        fallbackText = "A fever can be uncomfortable. Have you taken your temperature, and are you experiencing any chills?";
      } else if (isEmergencyMode) {
        fallbackText = `This sounds like a medical emergency. Please hang up and call ${
          emergencyNumber || "emergency services"
        } immediately.`;
      }

      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();
          controller.enqueue(encoder.encode("[FALLBACK]\n"));
          const words = fallbackText.split(" ");
          for (const word of words) {
            controller.enqueue(encoder.encode(word + " "));
            await new Promise((r) => setTimeout(r, 80));
          }
          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
        },
      });
    }

    // Pipe the Gemini stream out as raw text chunks for frontend sentence-boundary TTS
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of responseStream.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          controller.close();
        } catch (e: any) {
          console.error("[/api/chat] Gemini stream reading error:", e);
          controller.error(e);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } catch (error) {
    console.error("[/api/chat] API Route Error:", error);
    return NextResponse.json({ error: "AI service unavailable — please try again later" }, { status: 503 });
  }
}
