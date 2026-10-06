import { NextResponse } from "next/server";
import { db } from "@/lib/firebase/config";
import { doc, getDoc, updateDoc, arrayUnion, addDoc, collection, serverTimestamp } from "firebase/firestore";

const EMERGENCY_PATTERNS = [
  /chest\s*(pain|hurts|ache|tightness)/i,
  /heart\s*attack/i,
  /(can't|cannot|hard to)\s*breathe/i,
  /shortness\s*of\s*breath/i,
  /suicid(e|al)/i,
  /kill\s*myself/i,
  /end\s*my\s*life/i,
  /heavy\s*bleeding/i,
  /won't\s*stop\s*bleeding/i,
  /stroke/i,
  /face\s*droop(ing|s)/i,
  /arm\s*weakness/i,
  /slurred\s*speech/i,
  /unconscious/i
];

export async function POST(req: Request) {
  try {
    const { sessionId, text, attachments = [], history = [], emergencyNumber = "112", turnCount = 1, forceSummary = false, isElderlyMode = false } = await req.json();

    if (!text && attachments.length === 0) {
      return NextResponse.json({ error: "Text or attachment is required" }, { status: 400 });
    }

    const userText = text || "Attached document/report for analysis.";


    // 1. Deterministic Emergency Layer Check
    const isEmergency = EMERGENCY_PATTERNS.some((pattern) => pattern.test(userText));

    if (isEmergency) {
      const emergencyMessage = `MEDICAL EMERGENCY DETECTED: Symptoms suggest an urgent emergency. Please dial emergency services (${emergencyNumber}) immediately or proceed to the nearest hospital.`;
      
      // Update Firestore if available
      try {
        if (db && sessionId) {
          const docRef = doc(db, "consultations", sessionId);
          await updateDoc(docRef, {
            status: "emergency_escalated",
            emergencyFlag: true,
            severity: "emergency",
            riskLevel: "red",
            transcript: arrayUnion(
              { role: "patient", text: userText, timestamp: Date.now() },
              { role: "ai", text: emergencyMessage, timestamp: Date.now() }
            ),
            updatedAt: serverTimestamp(),
          });

          // Audit log write
          await addDoc(collection(db, "ai_logs"), {
            sessionId,
            inputHash: btoa(userText.substring(0, 50)),
            type: "emergency_trigger",
            flagged: true,
            timestamp: serverTimestamp(),
          });
        }
      } catch (fsErr: any) {
        console.warn("[/api/consultation/process-turn] Emergency Firestore update failed:", fsErr.message);
      }

      return NextResponse.json({
        type: "emergency",
        message: emergencyMessage,
        structured: {
          emergencyFlag: true,
          riskLevel: "red",
          severity: "emergency",
          emergencyNumber
        }
      });
    }

    // 2. Structured Summary Generation Condition (e.g. Turn >= 12 or explicitly requested)
    const shouldSummarize = forceSummary || turnCount >= 12;

    if (shouldSummarize) {
      const chatApiUrl = new URL("/api/chat", req.url).toString();
      const summaryRes = await fetch(chatApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: userText,
          history: [...history, { role: "user", content: userText }],
          format: "structured_summary",
          isElderlyMode
        })
      });

      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();

        // Update Firestore with final summary
        try {
          if (db && sessionId) {
            const docRef = doc(db, "consultations", sessionId);
            await updateDoc(docRef, {
              status: "completed",
              endedAt: serverTimestamp(),
              aiSummary: summaryData.message || summaryData.structured?.aiSummary,
              symptoms: summaryData.structured?.symptoms || [],
              possibleConditions: summaryData.structured?.possibleConditions || [],
              severity: summaryData.structured?.severity || "moderate",
              suggestedMedicineCategories: summaryData.structured?.suggestedMedicineCategories || [],
              suggestedSpecialists: summaryData.structured?.suggestedSpecialists || [],
              riskLevel: summaryData.structured?.riskLevel || "yellow",
              emergencyFlag: summaryData.structured?.emergencyFlag || false,
              transcript: arrayUnion(
                { role: "patient", text: userText, timestamp: Date.now() },
                { role: "ai", text: summaryData.message, timestamp: Date.now() }
              ),
              updatedAt: serverTimestamp(),
            });
          }
        } catch (fsErr: any) {
          console.warn("[/api/consultation/process-turn] Summary Firestore update failed:", fsErr.message);
        }

        return NextResponse.json(summaryData);
      }
    }

    // 3. Normal Conversational Turn (Delegate to /api/chat streaming endpoint)
    // Audit log entry
    try {
      if (db && sessionId) {
        await addDoc(collection(db, "ai_logs"), {
          sessionId,
          type: "turn_process",
          promptLength: userText.length,
          turnCount,
          timestamp: serverTimestamp(),
        });
      }
    } catch (e) {}

    return NextResponse.json({
      type: "question",
      message: "Processing turn...",
    });

  } catch (error: any) {
    console.error("[/api/consultation/process-turn] Error processing turn:", error);
    return NextResponse.json({ error: "Failed to process turn" }, { status: 500 });
  }
}
