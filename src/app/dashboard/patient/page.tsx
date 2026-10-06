"use client";

import React from "react";
import { 
  Bell, 
  LogOut, 
  Video, 
  MessageSquare, 
  FileText, 
  Pill, 
  MapPin, 
  Stethoscope,
  ArrowRight,
  Download,
  Calendar,
  Sparkles,
  ShieldCheck
} from "lucide-react";
import { signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { doc, onSnapshot } from "firebase/firestore";
import OnboardingModal from "@/components/patient/OnboardingModal";
import { useChatStore, ChatSession } from "@/store/chatStore";

export default function PatientDashboard() {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  const [uid, setUid] = React.useState<string | null>(null);
  
  // Hydration safety for Zustand store
  const [isClient, setIsClient] = React.useState(false);
  const { sessions } = useChatStore();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        setUid(user.uid);
        const userRef = doc(db, "users", user.uid);
        const unsubscribeDoc = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (!data.medicalProfile?.onboardingComplete) {
              setShowOnboarding(true);
            } else {
              setShowOnboarding(false);
            }
          }
        });
        return () => unsubscribeDoc();
      } else {
        router.push("/login");
      }
    });
    return () => unsubscribeAuth();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      document.cookie = "navok-role=; path=/; max-age=0";
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error", error);
      toast.error("Failed to log out");
    }
  };

  const handleActionClick = (route: string) => {
    router.push(route);
  };

  const handleDownloadReport = (session: ChatSession) => {
    let reportContent = `NAVOK HEAL - CONSULTATION REPORT\n`;
    reportContent += `Date: ${new Date(session.createdAt).toLocaleString()}\n`;
    reportContent += `Subject: ${session.title}\n`;
    reportContent += `--------------------------------------------------\n\n`;

    session.messages.forEach((msg) => {
      const sender = msg.sender === 'ai' ? 'NavOk AI' : 'Patient';
      reportContent += `[${msg.time}] ${sender}:\n${msg.text}\n\n`;
    });

    reportContent += `--------------------------------------------------\n`;
    reportContent += `End of Report\n`;

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Consultation_Report_${new Date(session.createdAt).toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Report downloaded successfully");
  };

  const actionCards = [
    {
      title: "Audio-Visual Intake",
      description: "Interactive real-time intake with conversational doctor avatar.",
      icon: <Video className="w-6 h-6 text-[#14332F]" />,
      route: "/consultation/video",
      primary: true,
      tag: "Live Audio & Video"
    },
    {
      title: "AI Health Chat",
      description: "Text-based health assistant available 24/7 for symptom triage.",
      icon: <MessageSquare className="w-6 h-6 text-[#2A6A5E]" />,
      route: "/consultation/chat",
      primary: false,
      tag: "Always Online"
    },
    {
      title: "Upload Medical Report",
      description: "Instant AI analysis of your lab results, blood work, and PDFs.",
      icon: <FileText className="w-6 h-6 text-[#2A6A5E]" />,
      route: "/reports/upload",
      primary: false,
      tag: "OCR & Analysis"
    },
    {
      title: "Find Medicines",
      description: "Search 250k+ generic active ingredients and FDA safety labels.",
      icon: <Pill className="w-6 h-6 text-[#2A6A5E]" />,
      route: "/medicines",
      primary: false,
      tag: "OpenFDA Grounded"
    },
    {
      title: "Find Pharmacy",
      description: "Locate nearby verified medical stores and clinics on live map.",
      icon: <MapPin className="w-6 h-6 text-[#2A6A5E]" />,
      route: "/pharmacies/map",
      primary: false,
      tag: "GPS Navigation"
    },
    {
      title: "Specialist Doctors",
      description: "Direct physician registry and telehealth booking portal.",
      icon: <Stethoscope className="w-6 h-6 text-[#2A6A5E]" />,
      route: "/doctors",
      primary: false,
      tag: "Verified Care"
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#14332F] p-6 md:p-10 pt-24 relative overflow-x-hidden">
      {showOnboarding && uid && (
        <OnboardingModal uid={uid} onComplete={() => setShowOnboarding(false)} />
      )}
      
      <div className="max-w-7xl mx-auto space-y-10 relative z-10">
        
        {/* Header Strip */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF3EE] text-[#2A6A5E] text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Patient Command Center
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#14332F]">
              Welcome Back to NavOk <span className="font-serif-accent font-normal italic text-[#2A6A5E]">Heal</span>
            </h1>
            <p className="text-[#5E6E69] text-sm mt-1">Manage your active consultations, health summaries, and clinical access.</p>
          </div>

          <div className="flex gap-2.5 items-center flex-wrap">
            <button className="bg-white border border-[#E8E2D5] p-2.5 rounded-full hover:bg-[#FAF7F0] text-[#5E6E69] hover:text-[#14332F] transition-colors shadow-sm">
              <Bell className="w-4 h-4" />
            </button>
            <div className="bg-white border border-[#E8E2D5] px-4 py-2 rounded-full flex items-center gap-2 shadow-sm text-xs font-semibold text-[#14332F]">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>Status: Active Care</span>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-white border border-[#E8E2D5] px-4 py-2 rounded-full flex items-center gap-2 hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors shadow-sm text-xs font-semibold text-[#5E6E69]"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        {/* Hero AI Consultation Panel (Deep Teal Healink Hero) */}
        <div 
          onClick={() => handleActionClick("/consultation/video")}
          className="w-full bg-[#14332F] text-[#FAF7F0] rounded-[32px] p-8 md:p-10 shadow-hero relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.01] duration-300"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#2A6A5E]/30 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-[#A3D9C9] text-xs font-medium border border-white/15">
                <Sparkles className="w-3 h-3" />
                <span>Audio-Visual Doctor Consultation</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Begin Immediate Medical <span className="font-serif-accent font-normal italic text-[#A3D9C9]">Intake Assessment</span>
              </h2>
              <p className="text-[#D9E7E2] text-sm leading-relaxed">
                Speak directly with Dr. Maya, our conversational clinical AI specialist. Evaluate active symptoms, explore interactions, and generate intake notes.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-4">
              <span className="px-6 py-3 rounded-full bg-[#FAF7F0] text-[#14332F] font-semibold text-xs transition-all shadow-md group-hover:bg-white group-hover:scale-105 flex items-center gap-2">
                <Video className="w-4 h-4 text-[#14332F]" />
                Launch Session
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </span>
            </div>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actionCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.05, duration: 0.4 }}
              whileHover={{ y: -4 }}
              onClick={() => handleActionClick(card.route)}
              className={`bg-white rounded-3xl p-6 border transition-all cursor-pointer group flex flex-col justify-between ${
                card.primary 
                  ? "border-[#14332F]/30 shadow-healink ring-1 ring-[#14332F]/10" 
                  : "border-[#E8E2D5] hover:border-[#2A6A5E]/40 hover:shadow-healink"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] border border-[#E8E2D5] flex items-center justify-center group-hover:bg-[#EBF3EE] transition-colors">
                    {card.icon}
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF7F0] text-[#5E6E69] border border-[#E8E2D5]">
                    {card.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#14332F] group-hover:text-[#2A6A5E] transition-colors">{card.title}</h3>
                <p className="text-xs text-[#5E6E69] mt-2 leading-relaxed">{card.description}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-[#FAF7F0] flex items-center text-xs font-semibold text-[#14332F] group-hover:text-[#2A6A5E]">
                <span>Access Feature</span>
                <ArrowRight className="w-3 h-3 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Consultations Section */}
        {isClient && sessions.length > 0 && (
          <div className="bg-white rounded-[32px] p-6 md:p-8 border border-[#E8E2D5] shadow-sm">
            <h2 className="text-xl font-bold text-[#14332F] mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[#2A6A5E]" />
              Recent Intake Consultations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sessions.slice(0, 4).map(session => (
                <div key={session.id} className="bg-[#FAF7F0] rounded-2xl p-4 border border-[#E8E2D5] flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between hover:bg-[#EBF3EE]/50 transition-colors">
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="font-bold text-sm text-[#14332F] truncate">{session.title}</h3>
                    <p className="text-xs text-[#5E6E69]">
                      {new Date(session.createdAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-[11px] text-[#2A6A5E] font-medium">{session.messages.length} exchanges recorded</p>
                  </div>
                  <button 
                    onClick={() => handleDownloadReport(session)}
                    className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 bg-white hover:bg-[#FAF7F0] text-[#14332F] rounded-full transition-colors border border-[#E8E2D5] text-xs font-semibold shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-[#2A6A5E]" />
                    Download Report
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
