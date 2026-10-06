"use client";

import React, { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { motion } from "framer-motion";
import { 
  Video, 
  MessageSquare, 
  FileText, 
  Pill, 
  MapPin, 
  Stethoscope, 
  ArrowRight,
  ShieldCheck,
  Star,
  Clock,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function LandingPage() {
  const router = useRouter();
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (headlineRef.current) {
      gsap.fromTo(
        headlineRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }
      );
    }
  }, []);

  const featureCards = [
    {
      title: "Audio-Visual AI Intake",
      description: "Interactive real-time intake with conversational doctor avatar and instant clinical triage.",
      icon: <Video className="w-6 h-6 text-[#14332F]" />,
      route: "/consultation/video",
      tag: "Live Audio & Video",
      highlight: true,
    },
    {
      title: "24/7 AI Health Chat",
      description: "Ask medication questions, evaluate initial symptoms, and get evidence-grounded responses.",
      icon: <MessageSquare className="w-6 h-6 text-[#2A6A5E]" />,
      route: "/consultation/chat",
      tag: "Instant Response",
      highlight: false,
    },
    {
      title: "Lab Report Analysis",
      description: "Upload blood tests, pathology reports, and prescriptions for structured breakdown.",
      icon: <FileText className="w-6 h-6 text-[#2A6A5E]" />,
      route: "/reports/upload",
      tag: "Smart OCR & Insights",
      highlight: false,
    },
    {
      title: "Medicine Directory",
      description: "Search 250k+ verified generic active ingredients, brand equivalents, and OpenFDA safety guides.",
      icon: <Pill className="w-6 h-6 text-[#2A6A5E]" />,
      route: "/medicines",
      tag: "OpenFDA Grounded",
      highlight: false,
    },
    {
      title: "Find Nearby Pharmacies",
      description: "Locate open licensed medical stores and verified clinics with real-time OpenStreetMap routing.",
      icon: <MapPin className="w-6 h-6 text-[#2A6A5E]" />,
      route: "/pharmacies/map",
      tag: "GPS Navigation",
      highlight: false,
    },
    {
      title: "Specialist Doctor Registry",
      description: "Connect directly with certified practitioners, cardiologists, and telehealth physicians.",
      icon: <Stethoscope className="w-6 h-6 text-[#2A6A5E]" />,
      route: "/doctors",
      tag: "Verified Care",
      highlight: false,
    },
  ];

  const testimonials = [
    {
      name: "Dr. Alistair Vance, MD",
      role: "Chief of Emergency Medicine",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=250&q=80",
      quote: "NavOk Heal's intake pre-flight structure dramatically reduces emergency wait times and ensures patients are accurately categorized before stepping into a consultation room.",
      rating: 5,
    },
    {
      name: "Elena Rostova",
      role: "Chronic Care Patient",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80",
      quote: "The spoken audio intake feels remarkably human and reassuring. Being able to look up my medications with FDA verified interaction warnings gave me total peace of mind.",
      rating: 5,
    },
    {
      name: "Marcus Chen",
      role: "Caregiver & Family Member",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
      quote: "The elderly companion mode made explaining symptoms effortless for my mother. She never felt rushed, and the summary PDF was immediately accepted by her clinic.",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#14332F] overflow-x-hidden pt-20">
      
      {/* 1. HERO SECTION (HEALINK THEME: Deep Forest Teal Panel) */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-6 pb-16" ref={heroRef}>
        <div className="relative bg-[#14332F] text-[#FAF7F0] rounded-[32px] md:rounded-[40px] p-8 sm:p-12 lg:p-16 overflow-hidden shadow-hero">
          
          {/* Ambient Warm Highlights */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#2A6A5E]/20 rounded-full blur-3xl pointer-events-none -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-1/3 w-[350px] h-[350px] bg-[#1A3D3A]/40 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Trust Badge / Pill */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[#FAF7F0] text-xs font-medium tracking-wide">
                <Sparkles className="w-3.5 h-3.5 text-[#A3D9C9]" />
                <span>Next-Generation Clinical Intake & Telehealth</span>
              </div>

              {/* Headline with Serif Italic Accent */}
              <h1 
                ref={headlineRef} 
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.12]"
              >
                Intelligent Audio-Based <br className="hidden sm:inline" />
                <span className="font-serif-accent text-[#A3D9C9] font-normal italic">Health Checkup</span> & Intake
              </h1>

              <p className="text-[#D9E7E2] text-base sm:text-lg max-w-xl font-normal leading-relaxed">
                Connect seamlessly with our conversational AI intake assistant for real-time symptom evaluations, OpenFDA drug safety checks, and instant specialist routing.
              </p>

              {/* Action Buttons: Pill-shaped */}
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href="/consultation/video"
                  className="px-8 py-3.5 rounded-full bg-[#FAF7F0] text-[#14332F] hover:bg-white font-semibold text-sm transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5 group"
                >
                  <Video className="w-4 h-4 text-[#14332F] group-hover:scale-110 transition-transform" />
                  <span>Start AI Consultation</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/reports/upload"
                  className="px-7 py-3.5 rounded-full bg-transparent hover:bg-white/10 text-[#FAF7F0] border border-white/20 font-medium text-sm transition-all hover:border-white/40"
                >
                  Upload Lab Report
                </Link>
              </div>

              {/* Social Proof Avatar Cluster */}
              <div className="pt-6 border-t border-white/10 flex items-center gap-4">
                <div className="flex -space-x-2.5 overflow-hidden">
                  <img 
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-[#14332F] object-cover" 
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80" 
                    alt="Doctor 1" 
                  />
                  <img 
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-[#14332F] object-cover" 
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=150&q=80" 
                    alt="Doctor 2" 
                  />
                  <img 
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-[#14332F] object-cover" 
                    src="https://images.unsplash.com/photo-1594824813585-716d1a938361?auto=format&fit=crop&w=150&q=80" 
                    alt="Doctor 3" 
                  />
                  <div className="h-10 w-10 rounded-full ring-2 ring-[#14332F] bg-[#2A6A5E] text-white flex items-center justify-center text-xs font-bold">
                    +2k
                  </div>
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#FBBF24] text-[#FBBF24]" />
                    ))}
                    <span className="text-xs font-semibold text-white ml-1.5">4.9/5.0</span>
                  </div>
                  <span className="text-xs text-[#A3D9C9] font-medium mt-0.5">
                    Trusted by 10,000+ patients and verified physicians
                  </span>
                </div>
              </div>

            </div>

            {/* Right Hero Image Column: Real Doctor Photo */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-sm lg:max-w-md aspect-[4/5] rounded-[28px] overflow-hidden shadow-2xl border-4 border-white/10 group">
                <img
                  src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80"
                  alt="Professional Healthcare Specialist"
                  className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Floating Status Badge on Doctor Photo */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3.5 border border-white/40 shadow-lg text-[#14332F] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <div>
                      <p className="text-xs font-bold text-[#14332F]">AI Intake Specialists Available</p>
                      <p className="text-[11px] text-[#5E6E69]">Average wait time: &lt; 15 seconds</p>
                    </div>
                  </div>
                  <div className="bg-[#EBF3EE] px-2.5 py-1 rounded-full text-[10px] font-bold text-[#2A6A5E]">
                    Online 24/7
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. STATS & CLINICAL TRUST STRIP */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { label: "Verified Medications", value: "250,000+", desc: "OpenFDA active ingredients" },
            { label: "Intake Accuracy", value: "98.4%", desc: "Structured symptom capture" },
            { label: "Emergency Response", value: "Instant", desc: "Automated triage escalation" },
            { label: "Pharmacy Coverage", value: "Worldwide", desc: "Real-time OpenStreetMap" },
          ].map((stat, idx) => (
            <div 
              key={idx} 
              className="bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-sm hover:shadow-healink transition-all"
            >
              <p className="text-3xl font-bold text-[#14332F] tracking-tight">{stat.value}</p>
              <p className="text-sm font-semibold text-[#2A6A5E] mt-1">{stat.label}</p>
              <p className="text-xs text-[#5E6E69] mt-0.5">{stat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. CLEAN ICON-BASED FEATURE GRID */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-16">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EBF3EE] text-[#2A6A5E] text-xs font-bold uppercase tracking-wider mb-3">
            Comprehensive Platform
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#14332F] tracking-tight">
            Designed for <span className="font-serif-accent font-normal italic text-[#2A6A5E]">Holistic Care</span> & Accessibility
          </h2>
          <p className="text-[#5E6E69] text-base mt-3">
            Every tool is designed with clinical precision, warm patient reassurance, and rigorous medical data safety.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureCards.map((card, idx) => (
            <motion.div
              key={card.title}
              whileHover={{ y: -4 }}
              onClick={() => router.push(card.route)}
              className={`bg-white rounded-3xl p-7 border transition-all cursor-pointer group flex flex-col justify-between ${
                card.highlight 
                  ? "border-[#14332F]/30 shadow-healink ring-1 ring-[#14332F]/10" 
                  : "border-[#E8E2D5] hover:border-[#2A6A5E]/40 hover:shadow-healink"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF7F0] border border-[#E8E2D5] flex items-center justify-center group-hover:bg-[#EBF3EE] transition-colors">
                    {card.icon}
                  </div>
                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#FAF7F0] text-[#5E6E69] border border-[#E8E2D5]">
                    {card.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-[#14332F] group-hover:text-[#2A6A5E] transition-colors">
                  {card.title}
                </h3>
                <p className="text-sm text-[#5E6E69] mt-2.5 leading-relaxed font-normal">
                  {card.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#FAF7F0] flex items-center text-xs font-semibold text-[#14332F] group-hover:text-[#2A6A5E]">
                <span>Explore Feature</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4. TESTIMONIALS SECTION */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto py-12 mb-16">
        <div className="bg-[#FAF7F0] border border-[#E8E2D5] rounded-[36px] p-8 sm:p-12 lg:p-16">
          <div className="max-w-xl mb-12">
            <span className="text-xs font-bold text-[#2A6A5E] uppercase tracking-wider">Clinical Testimonials</span>
            <h2 className="text-3xl font-bold text-[#14332F] tracking-tight mt-2">
              Endorsed by Clinicians & <span className="font-serif-accent font-normal italic text-[#2A6A5E]">Trusted by Patients</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((test, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(test.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#FBBF24] text-[#FBBF24]" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-[#14332F] leading-relaxed italic font-serif-accent">
                    "{test.quote}"
                  </p>
                </div>

                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-[#FAF7F0]">
                  <img 
                    src={test.image} 
                    alt={test.name} 
                    className="w-10 h-10 rounded-full object-cover ring-1 ring-[#E8E2D5]" 
                  />
                  <div>
                    <p className="text-xs font-bold text-[#14332F]">{test.name}</p>
                    <p className="text-[11px] text-[#5E6E69]">{test.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WARM PROFESSIONAL FOOTER */}
      <footer className="bg-white border-t border-[#E8E2D5] py-12 px-6 lg:px-12 text-center text-xs text-[#5E6E69]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#14332F] flex items-center justify-center p-1">
              <Image 
                src="/NavOk Heal Logo.png" 
                alt="NavOk Heal" 
                width={20} 
                height={20} 
                className="object-contain filter brightness-0 invert" 
              />
            </div>
            <span className="text-sm font-bold text-[#14332F]">
              NavOk <span className="font-serif-accent font-normal italic text-[#2A6A5E]">Heal</span>
            </span>
          </div>

          <p>© 2026 NavOk Heal Health Technologies. All rights reserved.</p>

          <div className="flex items-center gap-4 text-[#5E6E69]">
            <Link href="/medicines" className="hover:text-[#14332F]">Drug Index</Link>
            <Link href="/pharmacies/map" className="hover:text-[#14332F]">Facilities</Link>
            <Link href="/privacy" className="hover:text-[#14332F]">HIPAA & Privacy</Link>
          </div>
        </div>

        <div className="max-w-3xl mx-auto mt-6 text-[11px] text-[#5E6E69]/80 border-t border-[#FAF7F0] pt-4">
          ⚠️ <strong>Medical Disclaimer:</strong> NavOk Heal AI provides educational medical intake organization and reference summaries only. It is not a diagnostic device or replacement for an in-person emergency physician evaluation.
        </div>
      </footer>

    </div>
  );
}
