"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Send, 
  Bot, 
  User, 
  ChevronLeft, 
  MoreVertical, 
  FileText, 
  MapPin, 
  Plus, 
  MessageSquare, 
  Trash2, 
  Menu, 
  X,
  Mic,
  MicOff,
  Paperclip,
  Info,
  ShieldAlert,
  Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChatStore, Message } from "@/store/chatStore";
import { auth, db } from "@/lib/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { getEmergencyNumber } from "@/lib/emergencyNumbers";
import EmergencyCard from "@/components/consultation/EmergencyCard";
import SummaryCard from "@/components/consultation/SummaryCard";
import FileUploadChip, { AttachedFile, uploadConsultationFile } from "@/components/consultation/FileUploadChip";
import ChatBubble from "@/components/consultation/ChatBubble";
import { startConsultation, processTurn, endConsultation } from "@/lib/consultationApi";
import { ConsultationSummaryData } from "@/components/consultation/SummaryReport";
import { toast } from "sonner";

export default function ChatConsultationPage() {
  const router = useRouter();
  
  const { 
    sessions, 
    currentSessionId, 
    createSession, 
    addMessage, 
    deleteSession, 
    setCurrentSessionId 
  } = useChatStore();

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [emergencyNumber, setEmergencyNumber] = useState<string>("112");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Turn Count & Status
  const [turnCount, setTurnCount] = useState(1);
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);
  const [inlineSummary, setInlineSummary] = useState<ConsultationSummaryData | null>(null);

  // File Upload State
  const [attachedFiles, setAttachedFiles] = useState<AttachedFile[]>([]);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice STT Input State
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // User Profile
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const cc = userDoc.data().medicalProfile?.countryCode;
            setEmergencyNumber(getEmergencyNumber(cc));
          }
        } catch (e) {}
      }
    });
    return () => unsubscribe();
  }, []);

  // Initialize session
  useEffect(() => {
    if (!currentSessionId) {
      if (sessions.length > 0) {
        setCurrentSessionId(sessions[0].id);
      } else {
        const id = createSession();
        startConsultation({ type: "chat" }).then(res => {
          if (res.sessionId) setCurrentSessionId(res.sessionId);
        });
      }
    }
  }, [currentSessionId, sessions, setCurrentSessionId, createSession]);

  const currentSession = sessions.find(s => s.id === currentSessionId);
  const messages = currentSession?.messages || [];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, inlineSummary, isEmergencyActive]);

  // Geolocation
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}`);
            const data = await res.json();
            if (data && data.address) {
              const city = data.address.city || data.address.town || data.address.village || data.address.state || "your area";
              setUserLocation(city);
            }
          } catch (error) {}
        },
        () => {}
      );
    }
  }, []);

  // Initialize Speech Recognition for Input Bar Mic Toggle
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let transcript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setInput(prev => {
              const base = prev.trim() ? prev + " " : "";
              return base + transcript;
            });
          }
        };

        recognition.onerror = () => {
          setIsVoiceRecording(false);
        };

        recognition.onend = () => {
          setIsVoiceRecording(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      toast.error("Voice recognition is not supported in your browser.");
      return;
    }

    if (isVoiceRecording) {
      recognitionRef.current.stop();
      setIsVoiceRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsVoiceRecording(true);
        toast.info("Listening... speak your query.");
      } catch (e) {
        setIsVoiceRecording(false);
      }
    }
  };

  // File Upload Handler
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !currentSessionId) return;

    const file = files[0];
    const fileId = Date.now().toString();

    const newAttachment: AttachedFile = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      uploading: true,
      progress: 10,
    };

    setAttachedFiles(prev => [...prev, newAttachment]);
    setIsUploadingFile(true);

    try {
      const downloadURL = await uploadConsultationFile(currentSessionId, file, (progress) => {
        setAttachedFiles(prev => prev.map(f => f.id === fileId ? { ...f, progress } : f));
      });

      setAttachedFiles(prev => prev.map(f => f.id === fileId ? { ...f, url: downloadURL, uploading: false, progress: 100 } : f));
      toast.success("Medical document attached!");
    } catch (error) {
      setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
      toast.error("File upload failed.");
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (id: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== id));
  };

  // Handle Send Message
  const handleSend = async () => {
    if ((!input.trim() && attachedFiles.length === 0) || !currentSessionId || isEmergencyActive) return;

    if (isVoiceRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsVoiceRecording(false);
    }

    const currentText = input;
    const currentFiles = [...attachedFiles];

    setInput("");
    setAttachedFiles([]);
    setIsTyping(true);

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: currentText || (currentFiles.length > 0 ? `Uploaded ${currentFiles.length} file(s)` : ""),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    addMessage(currentSessionId, userMessage);

    const nextTurn = turnCount + 1;
    setTurnCount(nextTurn);

    // Call processTurn API
    const turnResult = await processTurn({
      sessionId: currentSessionId,
      text: currentText,
      attachments: currentFiles.map(f => ({ id: f.id, name: f.name, url: f.url, type: f.type })),
      history: messages.map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text })),
      emergencyNumber,
      turnCount: nextTurn
    });

    setIsTyping(false);

    // Emergency Check Result
    if (turnResult.type === "emergency") {
      setIsEmergencyActive(true);
      const emergencyMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: turnResult.message,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      addMessage(currentSessionId, emergencyMsg);
      return;
    }

    // Summary Result
    if (turnResult.type === "summary" && turnResult.structured) {
      setInlineSummary(turnResult.structured);
      const summaryMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: turnResult.message || "Consultation complete. Below is your clinical summary.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      addMessage(currentSessionId, summaryMsg);
      return;
    }

    // Standard Question Response (Fetch from /api/chat stream)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          prompt: currentText,
          history: messages.map(m => ({ role: m.sender === "user" ? "user" : "assistant", content: m.text }))
        })
      });

      if (!res.ok) throw new Error("API status " + res.status);

      const responseText = await res.text();
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: responseText || "I understand. Please describe any other symptoms you have.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      addMessage(currentSessionId, aiResponse);
    } catch (err) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: "I'm having trouble connecting right now, but please tell me more about your symptoms.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      addMessage(currentSessionId, errorMsg);
    }
  };

  const handleNewChat = async () => {
    const startRes = await startConsultation({ type: "chat" });
    const newId = createSession();
    setCurrentSessionId(startRes.sessionId || newId);
    setTurnCount(1);
    setIsEmergencyActive(false);
    setInlineSummary(null);
    setAttachedFiles([]);
    setSidebarOpen(false);
  };

  const handleDeleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteSession(id);
    if (sessions.length <= 1) {
      handleNewChat();
    }
  };

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  if (!currentSession) return null;

  return (
    <div className="h-screen w-full bg-[#FAF7F0] flex font-sans text-[#14332F] overflow-hidden relative">
      
      {/* Sidebar Mobile Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-[#14332F]/30 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* History Sidebar */}
      <motion.aside 
        className={`fixed md:relative z-50 w-72 h-full bg-white border-r border-[#E8E2D5] flex flex-col transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 flex items-center justify-between border-b border-[#E8E2D5]">
          <h2 className="font-bold text-base text-[#14332F] flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#2A6A5E]" />
            Intake History
          </h2>
          <button onClick={() => setSidebarOpen(false)} className="p-1.5 md:hidden hover:bg-[#FAF7F0] rounded-full text-[#5E6E69]">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-3">
          <button 
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#14332F] hover:bg-[#1A3D3A] text-[#FAF7F0] rounded-full transition-all font-semibold text-xs shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> New Consultation
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 custom-scrollbar">
          {sessions.map((session) => (
            <div 
              key={session.id}
              onClick={() => {
                setCurrentSessionId(session.id);
                setSidebarOpen(false);
              }}
              className={`group flex items-center justify-between w-full p-2.5 rounded-2xl cursor-pointer transition-all ${
                currentSessionId === session.id 
                  ? "bg-[#FAF7F0] border-[#E8E2D5] shadow-sm font-semibold" 
                  : "hover:bg-[#FAF7F0] border-transparent"
              } border`}
            >
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs truncate text-[#14332F]">{session.title}</span>
                <span className="text-[10px] text-[#5E6E69] mt-0.5">{formatDate(session.updatedAt)}</span>
              </div>
              <button 
                onClick={(e) => handleDeleteSession(e, session.id)}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-50 text-rose-600 rounded-md transition-all shrink-0"
                title="Delete chat"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </motion.aside>

      {/* Main Chat Content */}
      <div className="flex-1 flex flex-col relative z-10 w-full min-w-0">
        
        {/* Header */}
        <header className="h-18 shrink-0 border-b border-[#E8E2D5] bg-white/90 backdrop-blur-md px-4 md:px-8 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push("/dashboard/patient")}
              className="p-2 -ml-2 rounded-full hover:bg-[#FAF7F0] transition-colors text-[#5E6E69] hover:text-[#14332F]"
              title="Back to Dashboard"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-full md:hidden hover:bg-[#FAF7F0] transition-colors text-[#5E6E69] hover:text-[#14332F]"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 ml-1">
              <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-[#14332F] flex items-center justify-center text-white">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-sm md:text-base text-[#14332F] leading-tight">NavOk AI Assistant</h1>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[11px] text-emerald-700 font-semibold">Active Session</span>
                  </div>
                  {userLocation && (
                    <div className="flex items-center gap-1 text-[10px] text-[#5E6E69] bg-[#FAF7F0] px-2 py-0.5 rounded-full border border-[#E8E2D5] whitespace-nowrap">
                      <MapPin className="w-2.5 h-2.5 text-[#2A6A5E]" /> {userLocation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => router.push("/consultation/video")}
              className="px-3.5 py-1.5 rounded-full bg-[#FAF7F0] hover:bg-[#EBF3EE] border border-[#E8E2D5] text-[#14332F] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              Switch to Video
            </button>
          </div>
        </header>

        {/* Chat Messages */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 flex flex-col custom-scrollbar">
          
          {/* Medical Disclaimer Banner */}
          <div className="p-3.5 rounded-2xl bg-[#EBF3EE] border border-[#2A6A5E]/20 flex items-start gap-3 text-xs text-[#14332F] mb-2">
            <Info className="w-4 h-4 text-[#2A6A5E] shrink-0 mt-0.5" />
            <span>
              <strong>Medical Disclaimer:</strong> NavOk Heal AI provides educational intake assistance only and does not replace licensed medical professionals.
            </span>
          </div>

          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start w-full"
            >
              <div className="flex gap-3 max-w-[70%]">
                <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-indigo-400/30 flex items-center justify-center mt-1">
                  <Bot className="w-4 h-4 md:w-5 md:h-5 text-white" />
                </div>
                <div className="glass px-5 py-4 rounded-2xl rounded-tl-sm flex gap-1.5 items-center h-12">
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0 }} className="w-2 h-2 bg-zinc-400 rounded-full" />
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }} className="w-2 h-2 bg-zinc-400 rounded-full" />
                  <motion.div animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }} className="w-2 h-2 bg-zinc-400 rounded-full" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Inline Emergency Card */}
          {isEmergencyActive && (
            <div className="flex justify-start w-full">
              <EmergencyCard 
                emergencyNumber={emergencyNumber} 
                onAcknowledge={() => setIsEmergencyActive(false)}
              />
            </div>
          )}

          {/* Inline Summary Card */}
          {inlineSummary && (
            <div className="flex justify-start w-full">
              <SummaryCard 
                summary={inlineSummary}
                onTalkToDoctor={() => router.push("/doctors")}
              />
            </div>
          )}

          <div ref={messagesEndRef} className="h-4" />
        </main>

        {/* Input Bar Footer */}
        <footer className="p-3 md:p-6 bg-white/95 backdrop-blur-xl border-t border-[#E8E2D5] shrink-0">
          <div className="max-w-4xl mx-auto space-y-2">
            
            {/* Attached file chips preview */}
            {attachedFiles.length > 0 && (
              <div className="flex flex-wrap gap-2 pb-1">
                {attachedFiles.map(file => (
                  <FileUploadChip
                    key={file.id}
                    file={file}
                    onRemove={handleRemoveFile}
                  />
                ))}
              </div>
            )}

            <div className="relative flex items-center gap-2">
              
              {/* File Attachment Button */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,.pdf"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingFile || isEmergencyActive}
                className="p-3 md:p-3.5 bg-[#FAF7F0] border border-[#E8E2D5] rounded-full text-[#5E6E69] hover:text-[#14332F] hover:bg-[#EBF3EE] transition-colors disabled:opacity-50"
                title="Attach lab report or image (PDF / Image)"
              >
                {isUploadingFile ? <Loader2 className="w-5 h-5 animate-spin text-[#2A6A5E]" /> : <Paperclip className="w-5 h-5" />}
              </button>

              {/* Text Input Box */}
              <div className="relative flex-1">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  disabled={isEmergencyActive}
                  placeholder={isEmergencyActive ? "Medical emergency detected — please dial emergency services." : "Describe symptoms or ask health questions..."}
                  className="w-full bg-[#FAF7F0] border border-[#E8E2D5] focus:border-[#14332F] rounded-full pl-5 pr-12 py-3.5 text-[14px] md:text-[15px] text-[#14332F] focus:outline-none focus:ring-4 focus:ring-[#14332F]/5 transition-all placeholder:text-[#5E6E69] disabled:opacity-50"
                />

                {/* Voice Input Mic Toggle Button */}
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  disabled={isEmergencyActive}
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
                    isVoiceRecording 
                      ? "bg-red-50 text-red-600 border border-red-200 animate-pulse" 
                      : "text-[#5E6E69] hover:text-[#14332F] hover:bg-white"
                  }`}
                  title={isVoiceRecording ? "Stop voice transcription" : "Voice input (Speech to Text)"}
                >
                  {isVoiceRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>

              {/* Send Button */}
              <button 
                onClick={handleSend}
                disabled={(!input.trim() && attachedFiles.length === 0) || isEmergencyActive}
                className="p-3 md:p-3.5 bg-[#14332F] text-[#FAF7F0] rounded-full hover:bg-[#1A3D3A] transition-colors disabled:opacity-50 shadow-md shrink-0"
              >
                <Send className="w-5 h-5 ml-0.5" />
              </button>
            </div>
          </div>
          <p className="text-center text-[10px] md:text-xs text-[#5E6E69] mt-2 font-medium hidden sm:flex items-center justify-center">
            NavOk AI provides educational guidance only. Not for emergency medical use.
          </p>
        </footer>
      </div>
    </div>
  );
}
