"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  MessageSquare, 
  Settings, 
  Maximize, 
  Activity,
  ChevronLeft,
  Send,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  VolumeX,
  Camera,
  Eye
} from "lucide-react";
import { useChatStore, Message } from "@/store/chatStore";
import { toast } from "sonner";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { getEmergencyNumber } from "@/lib/emergencyNumbers";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import DoctorAvatar, { DoctorAvatarState } from "@/components/consultation/DoctorAvatar";
import EmergencyAlert from "@/components/consultation/EmergencyAlert";
import SummaryReport, { ConsultationSummaryData } from "@/components/consultation/SummaryReport";
import { startConsultation, processTurn, endConsultation } from "@/lib/consultationApi";

// Speech Recognition Types
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function VideoConsultationPage() {
  const router = useRouter();
  const [sessionStarted, setSessionStarted] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Session State
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [turnCount, setTurnCount] = useState(0);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [summaryData, setSummaryData] = useState<ConsultationSummaryData | null>(null);

  // Video / Audio references
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  
  // Chat store integration
  const { createSession, addMessage, sessions, updateSessionTitle, setEmergencyMode } = useChatStore();
  const [storeSessionId, setStoreSessionId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Location & User Profile
  const [userProfile, setUserProfile] = useState<any>(null);
  const [countryCode, setCountryCode] = useState<string | null>(null);
  const [emergencyNumber, setEmergencyNumber] = useState<string>("112");
  const [userLanguage, setUserLanguage] = useState<string>("en-US");
  
  const hasStartedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastProcessedTextRef = useRef<{ text: string; time: number }>({ text: "", time: 0 });
  const isTTSActiveRef = useRef<boolean>(false);
  const isSessionEndedRef = useRef<boolean>(false);
  const speechDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedFinalRef = useRef<string>("");
  
  const [isAITyping, setIsAITyping] = useState(false);
  const [isAISpeaking, setIsAISpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [currentStreamingText, setCurrentStreamingText] = useState("");
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  
  // Multimodal Visual Input States
  const [isCapturingVisual, setIsCapturingVisual] = useState(false);
  const [showShutterFlash, setShowShutterFlash] = useState(false);
  
  // Speech Recognition Ref
  const recognitionRef = useRef<any>(null);
  const isProcessingRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const activeUtterancesCountRef = useRef<number>(0);

  // Fetch User Profile & Language
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const data = userDoc.data();
            setUserProfile(data);
            const cc = data.medicalProfile?.countryCode;
            const lang = data.language || "en-US";
            setCountryCode(cc);
            setUserLanguage(lang);
            setEmergencyNumber(getEmergencyNumber(cc));
          }
        } catch (e: any) {
          console.warn("User profile notice (optional for anonymous/new users):", e?.message || e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Request media devices with explicit Echo Cancellation enabled
  const initMedia = async () => {
    try {
      setPermissionDenied(false);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      setMediaStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error("Error accessing camera/microphone", err);
      setPermissionDenied(true);
      setIsVideoOn(false);
      setIsMicOn(false);
      toast.error("Camera/Microphone permission denied. Please allow access in browser settings.");
    }
  };

  useEffect(() => {
    initMedia();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Active Session & Message scroll
  const activeSession = sessions.find(s => s.id === (storeSessionId || sessionId)) || sessions[0];
  const messages = activeSession?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamingText, isAITyping, isChatOpen]);

  // Session Duration Timer
  useEffect(() => {
    if (!sessionStarted || summaryData || isEmergencyActive) return;
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [sessionStarted, summaryData, isEmergencyActive]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Safe STT Restarter
  const restartSpeechRecognition = () => {
    if (recognitionRef.current && isMicOn && sessionStarted && !summaryData && !isEmergencyActive && !isTTSActiveRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Recognition may already be running or starting
      }
    }
  };

  // Safe STT Pauser
  const pauseSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
  };

  // Interrupt AI Speech & Processing (Barge-In / Mute button)
  const interruptAISpeech = () => {
    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    isTTSActiveRef.current = false;
    activeUtterancesCountRef.current = 0;
    isSpeakingRef.current = false;
    isProcessingRef.current = false;
    setIsAISpeaking(false);
    setIsAITyping(false);
    setCurrentStreamingText("");
    
    // Immediately restart STT so user can talk
    setTimeout(() => {
      restartSpeechRecognition();
    }, 100);
  };

  // End Session Cleanup
  const handleEndCall = async () => {
    isSessionEndedRef.current = true;
    setSessionStarted(false);
    interruptAISpeech();
    if (sessionId) {
      endConsultation(sessionId, summaryData).catch(e => console.warn(e));
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach(track => track.stop());
    }
    if (recognitionRef.current) {
      try { recognitionRef.current.abort(); } catch(e){}
    }
    router.push("/dashboard/patient");
  };

  // Setup Web Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = userLanguage;

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          let interim = "";
          let final = "";
          
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          
          const activeText = (final || interim).trim();

          // BARGE-IN INTERRUPTION DETECTED: User spoke while AI was speaking or generating
          if (activeText.length > 0 && (isSpeakingRef.current || isProcessingRef.current)) {
            interruptAISpeech();
          }

          setInterimTranscript(interim);
          
          if (final.trim()) {
            accumulatedFinalRef.current += " " + final.trim();
            if (speechDebounceRef.current) clearTimeout(speechDebounceRef.current);
            
            speechDebounceRef.current = setTimeout(() => {
              const fullText = accumulatedFinalRef.current.trim();
              accumulatedFinalRef.current = "";
              if (!fullText) return;

              const now = Date.now();
              if (
                lastProcessedTextRef.current.text === fullText &&
                now - lastProcessedTextRef.current.time < 1500
              ) {
                return;
              }
              lastProcessedTextRef.current = { text: fullText, time: now };
              handleUserQuery(fullText);
            }, 800);
          }
        };

        recognition.onerror = (event: any) => {
          if (event.error === 'not-allowed') {
            setIsMicOn(false);
            toast.error("Microphone permission denied.");
          }
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript("");
          // Auto-restart recognition unless AI is actively speaking (TTS) or session ended
          if (sessionStarted && !isSessionEndedRef.current && isMicOn && !summaryData && !isEmergencyActive && !isTTSActiveRef.current) {
            setTimeout(() => {
              restartSpeechRecognition();
            }, 150);
          }
        };

        recognitionRef.current = recognition;

        if (sessionStarted && isMicOn && !isTTSActiveRef.current) {
          try { recognition.start(); } catch(e){}
        }
      }
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch(e){}
      }
    };
  }, [sessionStarted, userLanguage, summaryData, isEmergencyActive, isMicOn]);

  // Handle Mic Toggle Button
  useEffect(() => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach(track => {
        track.enabled = isMicOn;
      });
    }

    if (!sessionStarted) return;

    if (isMicOn) {
      restartSpeechRecognition();
    } else {
      pauseSpeechRecognition();
      setInterimTranscript("");
    }
  }, [isMicOn, mediaStream, sessionStarted]);

  // Handle Video Toggle Button
  useEffect(() => {
    if (mediaStream) {
      mediaStream.getVideoTracks().forEach(track => {
        track.enabled = isVideoOn;
      });
    }
  }, [isVideoOn, mediaStream]);

  // TTS Speech Output
  const speakText = (text: string) => {
    if (isSessionEndedRef.current) return;
    if ('speechSynthesis' in window) {
      // Clean text for speech
      const spokenText = text
        .replace(/NavOk AI/gi, 'Navok A.I.')
        .replace(/NavOk/gi, 'Navok')
        .replace(/[*_#`]/g, '');

      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.lang = userLanguage;
      utterance.pitch = 1.05;
      utterance.rate = 1.0;
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith(userLanguage.substring(0, 2)) || v.name.includes("Samantha") || v.name.includes("Google"));
      if (preferredVoice) utterance.voice = preferredVoice;

      utterance.onstart = () => {
        setIsAISpeaking(true);
        isSpeakingRef.current = true;
        isTTSActiveRef.current = true;
        // Pause STT during TTS speech so speaker output doesn't feed back into mic
        pauseSpeechRecognition();
      };
      
      utterance.onend = () => {
        activeUtterancesCountRef.current = Math.max(0, activeUtterancesCountRef.current - 1);
        if (activeUtterancesCountRef.current === 0) {
          setIsAISpeaking(false);
          isSpeakingRef.current = false;
          isTTSActiveRef.current = false;
          // Restart STT once AI finishes speaking
          restartSpeechRecognition();
        }
      };

      utterance.onerror = () => {
        activeUtterancesCountRef.current = Math.max(0, activeUtterancesCountRef.current - 1);
        if (activeUtterancesCountRef.current === 0) {
          setIsAISpeaking(false);
          isSpeakingRef.current = false;
          isTTSActiveRef.current = false;
          restartSpeechRecognition();
        }
      };

      activeUtterancesCountRef.current += 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Multimodal visual input helper (draws camera stream frame to 720px max JPEG)
  const captureCameraFrame = (): string | null => {
    if (!videoRef.current || !isVideoOn) {
      toast.error("Please turn on your camera to show something to the AI.", { id: "camera-off-toast" });
      return null;
    }
    const video = videoRef.current;
    if (video.readyState < 2) {
      toast.error("Camera is still warming up. Please try again in a moment.", { id: "camera-warmup" });
      return null;
    }

    try {
      const canvas = document.createElement("canvas");
      const maxDim = 720;
      let w = video.videoWidth || 640;
      let h = video.videoHeight || 480;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;
      ctx.drawImage(video, 0, 0, w, h);
      const base64Data = canvas.toDataURL("image/jpeg", 0.85);

      // Shutter flash effect and notification banner
      setShowShutterFlash(true);
      setIsCapturingVisual(true);
      setTimeout(() => setShowShutterFlash(false), 280);
      setTimeout(() => setIsCapturingVisual(false), 3200);

      return base64Data;
    } catch (err) {
      console.warn("Failed to capture video frame:", err);
      return null;
    }
  };

  const isVisualTrigger = (transcript: string): boolean => {
    const TRIGGER_PATTERNS = [
      /look\s+at\s+this/i,
      /can\s+you\s+see\s+this/i,
      /look\s+at\s+my/i,
      /see\s+this/i,
      /want\s+to\s+show\s+you/i,
      /take\s+a\s+look/i,
      /check\s+this\s+out/i,
      /check\s+this/i,
      /what\s+is\s+this/i,
      /look\s+here/i
    ];
    return TRIGGER_PATTERNS.some((pattern) => pattern.test(transcript));
  };

  const handleShowAIClick = () => {
    if (isAITyping || isCapturingVisual) return;
    const capturedImage = captureCameraFrame();
    if (capturedImage) {
      handleUserQuery("Please examine what I am showing you on the camera.", capturedImage);
    }
  };

  // Start Consultation Session
  const handleStartSession = async () => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;
    
    // Call backend startConsultation
    const response = await startConsultation({
      patientId: auth.currentUser?.uid || "guest",
      type: "video",
      language: userLanguage,
    });

    const newSessionId = response.sessionId;
    setSessionId(newSessionId);
    setSessionStarted(true);

    const activeStoreId = createSession("Video Consultation Notes");
    setStoreSessionId(activeStoreId);
    updateSessionTitle(activeStoreId, "Video Consultation - " + new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));

    const initialGreeting = "Hello! I am NavOk AI Specialist. How can I assist you with your health today?";

    if (typeof window !== "undefined" && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      activeUtterancesCountRef.current = 0;
    }

    toast.success("AI Consultation Started", {
      description: "I am listening automatically! 🎤 To show me something on camera, click 'Show AI' or say 'Look at this'.",
      duration: 8000,
      icon: "👋"
    });

    const initialMsg: Message = {
      id: Date.now().toString(),
      sender: "ai",
      text: initialGreeting,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    addMessage(activeStoreId, initialMsg);

    setTimeout(() => {
      speakText(initialGreeting);
    }, 100);
  };

  // Handle User Query Turn (Supports optional visual image payload)
  const handleUserQuery = async (text: string, overrideImage?: string) => {
    if (!text.trim() && !overrideImage) return;

    // Interrupt any active speech before starting new query (unified barge-in)
    interruptAISpeech();

    setInterimTranscript("");
    isProcessingRef.current = true;
    const currentTurn = turnCount + 1;
    setTurnCount(currentTurn);

    // Determine if turn has a camera image
    let imagePayload: string | undefined = overrideImage;
    if (!imagePayload && isVisualTrigger(text)) {
      const captured = captureCameraFrame();
      if (captured) {
        imagePayload = captured;
      }
    }

    let activeStoreId = storeSessionId;
    if (!activeStoreId) {
      activeStoreId = createSession("Video Consultation Notes");
      setStoreSessionId(activeStoreId);
    }

    const displayText = imagePayload ? `📷 [Camera Frame Shown] ${text}` : text;
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: displayText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    addMessage(activeStoreId, userMessage);

    try {
      // Call Process Turn Backend
      const turnResult = await processTurn({
        sessionId: activeStoreId,
        text: text,
        emergencyNumber,
        turnCount: currentTurn,
      });

      // Emergency Check Result (Deterministic emergency remains strictly text-based)
      if (turnResult.type === "emergency") {
        setIsAITyping(false);
        setIsEmergencyActive(true);
        setEmergencyMode(activeStoreId, true);
        speakText(turnResult.message);
        return;
      }

      // Summary Result
      if (turnResult.type === "summary" && turnResult.structured) {
        setIsAITyping(false);
        setSummaryData(turnResult.structured);
        const summaryMsgText = turnResult.message || "Consultation complete. Displaying intake summary report.";
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          sender: "ai",
          text: summaryMsgText,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        addMessage(activeStoreId, aiMsg);
        speakText(summaryMsgText);
        return;
      }

      // Standard Question Turn - Pipe through /api/chat Gemini stream
      setIsAITyping(true);
      setCurrentStreamingText("");

      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      const turnStartTime = Date.now();
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: text,
          history: [...messages, userMessage].map(m => ({
            role: m.sender === 'ai' ? 'model' : 'user',
            content: m.text
          })),
          isEmergencyMode: isEmergencyActive,
          emergencyNumber,
          isElderlyMode: userProfile?.isElderlyMode || false,
          image: imagePayload
        }),
        signal: abortControllerRef.current.signal
      });

      if (!res.ok) throw new Error("API responded with " + res.status);

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder("utf-8");
      let accumulatedText = "";
      let unplayedText = "";
      let hasStartedReceiving = false;

      while (true) {
        if (isSessionEndedRef.current || turnCount !== currentTurn) {
          reader.cancel();
          break;
        }
        const { done, value } = await reader.read();
        if (done) break;

        let chunk = decoder.decode(value, { stream: true });
        if (chunk.includes("[FALLBACK]\n")) {
          setIsOfflineMode(true);
          chunk = chunk.replace("[FALLBACK]\n", "");
        }

        accumulatedText += chunk;
        unplayedText += chunk;

        if (!hasStartedReceiving && accumulatedText.trim().length > 0) {
          hasStartedReceiving = true;
          setIsAITyping(false);
          const firstChunkLatency = Date.now() - turnStartTime;
        }

        setCurrentStreamingText(accumulatedText);

        const sentenceRegex = /([^.!?]+[.!?]+)(\s+|$)/;
        let match;
        while ((match = sentenceRegex.exec(unplayedText)) !== null) {
          const sentence = match[1].trim();
          if (sentence) speakText(sentence);
          unplayedText = unplayedText.slice(match.index + match[0].length);
        }
      }

      if (unplayedText.trim()) speakText(unplayedText.trim());

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: accumulatedText || "I'm sorry, I couldn't process that.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      addMessage(activeStoreId, aiResponse);

    } catch (err: any) {
      if (err.name === 'AbortError') return;
      toast.error("AI service temporarily unavailable.");
    } finally {
      setIsAITyping(false);
      setCurrentStreamingText("");
      isProcessingRef.current = false;
    }
  };

  const handleSendNote = () => {
    if (!chatInput.trim()) return;
    const currentInput = chatInput;
    setChatInput("");
    handleUserQuery(currentInput);
  };

  const avatarState: DoctorAvatarState = 
    isAISpeaking ? "speaking" :
    (isAITyping || isProcessingRef.current) ? "thinking" :
    (isListening && !isAISpeaking) ? "listening" :
    "idle";

  return (
    <div className="h-screen w-full bg-[#FAF7F0] flex flex-col overflow-hidden text-[#14332F] font-sans relative">
      
      {/* Pre-Session Modal Overlay */}
      {!sessionStarted && (
        <div className="absolute inset-0 z-50 bg-[#14332F]/40 backdrop-blur-md flex flex-col items-center justify-center p-6">
          <div className="bg-white border border-[#E8E2D5] p-8 rounded-3xl max-w-md w-full text-center shadow-healink">
            <div className="w-16 h-16 bg-[#EBF3EE] border border-[#2A6A5E]/20 rounded-full flex items-center justify-center mx-auto mb-6 text-[#14332F]">
              <Activity className="w-8 h-8 text-[#2A6A5E]" />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-[#14332F]">AI Video Consultation</h2>
            
            <p className="text-[#5E6E69] text-xs md:text-sm mb-6 leading-relaxed">
              Experience real-time virtual intake assessment. Speak naturally with NavOk AI Specialist. The AI will listen automatically. To show the AI your camera, use the <strong>Show AI</strong> button.
            </p>

            <div className="p-3.5 rounded-2xl bg-[#FAF7F0] border border-[#E8E2D5] text-left mb-6 text-xs text-[#5E6E69]">
              <strong className="text-[#14332F]">Medical Disclaimer:</strong> NavOk Heal AI provides educational guidance and intake organization only. It is not a substitute for professional medical advice or emergency care.
            </div>

            {permissionDenied && (
              <div className="p-3 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-700 text-xs flex items-center gap-2 justify-center">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Camera or microphone access denied.</span>
                <button onClick={initMedia} className="underline font-semibold ml-1">Retry</button>
              </div>
            )}

            <button 
              onClick={handleStartSession}
              className="w-full py-3.5 bg-[#14332F] hover:bg-[#1A3D3A] text-[#FAF7F0] font-semibold rounded-full transition-all shadow-md"
            >
              Start Consultation & Activate AI
            </button>
            <button 
              onClick={() => router.push("/dashboard/patient")}
              className="w-full py-3 mt-2 bg-transparent hover:bg-[#FAF7F0] text-[#5E6E69] font-medium rounded-full transition-all text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Full-Screen Emergency Alert Takeover */}
      <AnimatePresence>
        {isEmergencyActive && (
          <EmergencyAlert
            emergencyNumber={emergencyNumber}
            userEmergencyContact={userProfile?.emergencyContact}
            onDismiss={() => setIsEmergencyActive(false)}
          />
        )}
      </AnimatePresence>

      {/* Summary Report Modal */}
      <AnimatePresence>
        {summaryData && (
          <SummaryReport
            summary={summaryData}
            onTalkToDoctor={() => router.push("/doctors")}
            onClose={() => handleEndCall()}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="h-16 border-b border-[#E8E2D5] flex items-center justify-between px-4 md:px-6 bg-white/90 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={handleEndCall}
            className="p-2 rounded-full hover:bg-[#FAF7F0] transition-colors text-[#5E6E69] hover:text-[#14332F]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${sessionStarted ? 'bg-red-500 animate-pulse' : 'bg-[#2A6A5E]'}`} />
            <span className="font-bold tracking-tight text-sm md:text-base text-[#14332F]">AI Video Consultation</span>
            <span className="font-mono text-xs md:text-sm text-[#5E6E69] ml-2 border border-[#E8E2D5] px-2 py-0.5 rounded-full bg-[#FAF7F0]">
              {formatTime(timeElapsed)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold text-[#2A6A5E] border border-[#2A6A5E]/20 bg-[#EBF3EE]">
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Encrypted Intake Stream</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F0] via-white to-[#FAF7F0] pointer-events-none" />
        
        {/* Video Area */}
        <div className={`flex-1 flex flex-col p-4 md:p-6 transition-all duration-300 relative ${isChatOpen ? 'md:pr-[320px]' : ''}`}>
          
          <ErrorBoundary fallbackMessage="Video view crashed.">
          <div className="flex-1 bg-white rounded-3xl overflow-hidden relative border border-[#E8E2D5] shadow-healink flex items-center justify-center flex-col">
            
            {isOfflineMode && (
              <div className="w-full bg-amber-500/15 text-amber-900 border-b border-amber-500/20 p-2 text-center text-xs font-semibold z-50 flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                ⚠️ Offline mode — using limited fallback responses
              </div>
            )}
            
            {/* Reactive Cartoon Doctor Avatar */}
            <div className="absolute inset-0 flex items-center justify-center">
              <DoctorAvatar state={avatarState} doctorName="Dr. Maya (NavOk AI Specialist)" />
            </div>

            {/* Corner Self-View Video */}
            <div className={`absolute bottom-4 right-4 md:bottom-6 md:right-6 w-32 md:w-48 aspect-video bg-[#14332F] rounded-2xl border-2 border-white overflow-hidden shadow-xl z-20 transition-all ${!isVideoOn ? "flex items-center justify-center" : ""}`}>
              {isVideoOn ? (
                <>
                  <video 
                    ref={videoRef}
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover mirror-x"
                    style={{ transform: "scaleX(-1)" }}
                  />
                  <span className="absolute bottom-2 left-2 text-[10px] bg-[#14332F]/80 px-2 py-0.5 rounded-full text-white backdrop-blur-sm z-30 font-medium">You</span>
                </>
              ) : (
                <div className="w-full h-full bg-[#14332F] flex items-center justify-center flex-col gap-1.5 text-[#D9E7E2]">
                  <VideoOff className="w-5 h-5 opacity-70" />
                  <span className="text-[10px] opacity-70">Camera Off</span>
                </div>
              )}
            </div>
            
            {/* Camera Shutter Flash Effect */}
            <AnimatePresence>
              {showShutterFlash && (
                <motion.div 
                  initial={{ opacity: 0.95 }}
                  animate={{ opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0 bg-white z-40 pointer-events-none"
                />
              )}
            </AnimatePresence>

            {/* Visual Capture Indicator Banner */}
            <AnimatePresence>
              {isCapturingVisual && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-[#14332F] text-[#FAF7F0] px-4 py-2 rounded-full shadow-lg border border-[#2A6A5E]/40 z-30 font-semibold text-xs"
                >
                  <Camera className="w-4 h-4 text-[#A3D9C9] animate-pulse" />
                  <span>Showing this to NavOk AI...</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Listening / Speaking Status */}
            {isListening && !isAISpeaking && !isCapturingVisual && (
              <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-full shadow-sm z-30">
                <Mic className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                <span className="text-xs text-emerald-800 font-semibold">Listening to you...</span>
              </div>
            )}

            {/* Barge-in Tap to Interrupt Button */}
            {isAISpeaking && (
              <button
                onClick={interruptAISpeech}
                className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-2 bg-[#14332F] hover:bg-[#1A3D3A] text-[#FAF7F0] border border-[#14332F] px-4 py-2 rounded-full shadow-md transition-all cursor-pointer z-30"
                title="Click to interrupt AI and speak"
              >
                <VolumeX className="w-3.5 h-3.5 text-[#A3D9C9] animate-bounce" />
                <span className="text-xs font-semibold">Tap to Interrupt AI</span>
              </button>
            )}

            {/* Captions */}
            <AnimatePresence>
              {(interimTranscript || currentStreamingText) && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-24 left-1/2 -translate-x-1/2 max-w-lg w-full px-6 text-center z-20 pointer-events-none"
                >
                  <div className="bg-white/95 backdrop-blur-md px-5 py-2.5 rounded-full border border-[#E8E2D5] inline-block shadow-healink">
                    <p className={`text-xs md:text-sm font-medium ${interimTranscript ? 'text-[#14332F] italic' : 'text-[#2A6A5E]'}`}>
                      {interimTranscript || currentStreamingText}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </ErrorBoundary>

          {/* Controls Bar (Healink Warm Theme Pill) */}
          <div className="h-18 md:h-20 mt-4 bg-white rounded-full border border-[#E8E2D5] shadow-healink flex items-center justify-center gap-3 md:gap-6 px-6 shrink-0">
            <button 
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-3 md:p-3.5 rounded-full transition-all duration-300 ${
                isMicOn ? 'bg-[#FAF7F0] hover:bg-[#EBF3EE] text-[#14332F] border border-[#E8E2D5]' : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
              }`}
              title={isMicOn ? "Mute Mic" : "Unmute Mic"}
            >
              {isMicOn ? <Mic className="w-4 h-4 md:w-5 md:h-5" /> : <MicOff className="w-4 h-4 md:w-5 md:h-5" />}
            </button>
            
            <button 
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3 md:p-3.5 rounded-full transition-all duration-300 ${
                isVideoOn ? 'bg-[#FAF7F0] hover:bg-[#EBF3EE] text-[#14332F] border border-[#E8E2D5]' : 'bg-red-50 hover:bg-red-100 text-red-600 border border-red-200'
              }`}
              title={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
            >
              {isVideoOn ? <Video className="w-4 h-4 md:w-5 md:h-5" /> : <VideoOff className="w-4 h-4 md:w-5 md:h-5" />}
            </button>

            {/* Show AI Multimodal Button */}
            <button
              onClick={handleShowAIClick}
              disabled={isAITyping || isCapturingVisual}
              className={`px-4 py-2.5 md:py-3 rounded-full transition-all duration-300 flex items-center gap-2 text-xs font-semibold shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer ${
                isCapturingVisual
                  ? 'bg-[#14332F] text-[#FAF7F0] ring-2 ring-[#2A6A5E]'
                  : 'bg-[#EBF3EE] hover:bg-[#14332F] text-[#14332F] hover:text-[#FAF7F0] border border-[#2A6A5E]/30'
              }`}
              title="Capture camera frame and show to AI"
            >
              <Camera className="w-4 h-4 text-[#2A6A5E]" />
              <span className="hidden sm:inline">Show AI</span>
            </button>

            <button 
              onClick={handleEndCall}
              className="p-3 md:p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white transition-all shadow-md mx-2 hover:scale-105"
              title="End Session"
            >
              <PhoneOff className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className={`p-3 md:p-3.5 rounded-full transition-all duration-300 ${
                isChatOpen ? 'bg-[#14332F] text-[#FAF7F0]' : 'bg-[#FAF7F0] hover:bg-[#EBF3EE] text-[#14332F] border border-[#E8E2D5]'
              }`}
              title="Consultation Notes"
            >
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>

          {/* Persistent Privacy / Medical Disclaimer */}
          <div className="text-[11px] text-[#5E6E69] flex items-center justify-center gap-1.5 mt-2.5 opacity-85 select-none text-center px-4">
            <span>📷</span>
            <span>On-demand camera visual input is processed via Gemini API for intake reference only. Not an in-person clinical examination.</span>
          </div>
        </div>

        {/* Chat Sidebar (Healink Theme) */}
        <AnimatePresence>
          {isChatOpen && (
            <ErrorBoundary fallbackMessage="Notes sidebar crashed.">
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-[320px] bg-white border-l border-[#E8E2D5] shadow-2xl flex flex-col z-40 md:z-30"
            >
              <div className="p-4 border-b border-[#E8E2D5] flex items-center justify-between bg-[#FAF7F0]">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#14332F] flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#2A6A5E]" /> Intake Transcript
                </h3>
                <button onClick={() => setIsChatOpen(false)} className="text-[#5E6E69] hover:text-[#14332F] p-1 rounded-md hover:bg-white transition-colors">
                  <Maximize className="w-4 h-4" />
                </button>
              </div>
              
              <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} w-full`}>
                    <div className={`flex flex-col max-w-[85%] ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                      <div className={`px-3.5 py-2.5 rounded-2xl shadow-sm ${
                        msg.sender === "user" 
                          ? "bg-[#14332F] text-[#FAF7F0] rounded-tr-sm" 
                          : "bg-[#FAF7F0] border border-[#E8E2D5] text-[#14332F] rounded-tl-sm"
                      }`}>
                        <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      </div>
                      <span className="text-[9px] text-[#5E6E69] mt-1 font-medium px-1">{msg.time}</span>
                    </div>
                  </div>
                ))}
                
                {currentStreamingText && (
                  <div className="flex justify-start w-full">
                    <div className="flex flex-col max-w-[85%] items-start">
                      <div className="px-3.5 py-2.5 rounded-2xl shadow-sm bg-[#FAF7F0] border border-[#E8E2D5] text-[#14332F] rounded-tl-sm">
                        <p className="text-[13px] leading-relaxed whitespace-pre-wrap">{currentStreamingText}</p>
                      </div>
                      <span className="text-[9px] text-[#5E6E69] mt-1 font-medium px-1">Just now</span>
                    </div>
                  </div>
                )}
                
                {isAITyping && (
                  <div className="flex justify-start w-full">
                    <div className="bg-[#FAF7F0] border border-[#E8E2D5] px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center">
                      <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} className="w-1.5 h-1.5 bg-[#2A6A5E] rounded-full" />
                      <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-1.5 h-1.5 bg-[#2A6A5E] rounded-full" />
                      <motion.div animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-1.5 h-1.5 bg-[#2A6A5E] rounded-full" />
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} className="h-1" />
              </div>

              <div className="p-3 border-t border-[#E8E2D5] bg-[#FAF7F0]">
                <div className="relative">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendNote()}
                    placeholder="Speak or type a note..." 
                    className="w-full bg-white border border-[#E8E2D5] rounded-xl pl-4 pr-10 py-3 text-sm text-[#14332F] focus:outline-none focus:border-[#14332F] transition-colors placeholder:text-[#5E6E69]"
                  />
                  <button 
                    onClick={handleSendNote}
                    disabled={!chatInput.trim()}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-[#14332F] text-[#FAF7F0] rounded-lg hover:bg-[#1A3D3A] transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
            </ErrorBoundary>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
