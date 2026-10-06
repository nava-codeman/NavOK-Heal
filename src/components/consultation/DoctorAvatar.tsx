"use client";

import React from "react";
import { Mic, Volume2, Brain, Smile } from "lucide-react";

export type DoctorAvatarState = "idle" | "listening" | "speaking" | "thinking";

interface DoctorAvatarProps {
  state: DoctorAvatarState;
  doctorName?: string;
}

export default function DoctorAvatar({ 
  state = "idle", 
  doctorName = "Dr. Maya (NavOk AI Specialist)" 
}: DoctorAvatarProps) {
  
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 select-none">
      
      {/* Background Soft Radiant Glow */}
      <div 
        className={`absolute w-72 h-72 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${
          state === "speaking" 
            ? "bg-[#2A6A5E]/25 scale-110" 
            : state === "listening" 
            ? "bg-emerald-500/20 scale-105" 
            : state === "thinking" 
            ? "bg-amber-500/20 scale-100" 
            : "bg-[#14332F]/10 scale-95"
        }`}
      />

      {/* SVG Cartoon Doctor Character */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center">
        
        {/* Floating Sound Waves for Listening State */}
        {state === "listening" && (
          <div className="absolute -top-4 right-10 flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shadow-sm animate-bounce z-20">
            <span className="w-1.5 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <span className="w-1.5 h-5 bg-emerald-600 rounded-full animate-pulse delay-75" />
            <span className="w-1.5 h-2.5 bg-emerald-500 rounded-full animate-pulse delay-150" />
            <span className="text-[11px] font-semibold text-emerald-800 ml-1">Listening</span>
          </div>
        )}

        {/* Thinking Cloud for Thinking State */}
        {state === "thinking" && (
          <div className="absolute -top-6 right-8 flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full shadow-sm z-20 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span className="text-[11px] font-bold text-amber-900">Evaluating symptoms...</span>
          </div>
        )}

        {/* Speaking Audio Badge */}
        {state === "speaking" && (
          <div className="absolute -top-4 left-10 flex items-center gap-1.5 bg-[#EBF3EE] border border-[#2A6A5E]/30 px-3 py-1 rounded-full shadow-sm z-20 animate-pulse">
            <Volume2 className="w-3.5 h-3.5 text-[#14332F] animate-bounce" />
            <span className="text-[11px] font-bold text-[#14332F]">Explaining guidance</span>
          </div>
        )}

        <svg 
          viewBox="0 0 300 320" 
          className={`w-full h-full filter drop-shadow-xl transition-transform duration-500 ${
            state === "listening" ? "rotate-[2deg] scale-[1.02]" : "rotate-0 scale-100"
          }`}
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="coatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#EDE8DE" />
            </linearGradient>
            <linearGradient id="scrubsGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2A6A5E" />
              <stop offset="100%" stopColor="#14332F" />
            </linearGradient>
            <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FDDFC7" />
              <stop offset="100%" stopColor="#F5CBA7" />
            </linearGradient>
            <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3A2A20" />
              <stop offset="100%" stopColor="#1F1612" />
            </linearGradient>

            {/* Animations */}
            <style>
              {`
                @keyframes eyeBlink {
                  0%, 90%, 100% { transform: scaleY(1); }
                  95% { transform: scaleY(0.1); }
                }
                @keyframes mouthTalk {
                  0%, 100% { transform: scaleY(0.4) scaleX(0.9); }
                  50% { transform: scaleY(1.4) scaleX(1.1); }
                }
                @keyframes subtleBreathe {
                  0%, 100% { transform: translateY(0); }
                  50% { transform: translateY(-3px); }
                }
                @keyframes headTilt {
                  0%, 100% { transform: rotate(0deg); }
                  50% { transform: rotate(2deg); }
                }
                .doctor-blink {
                  transform-origin: 150px 125px;
                  animation: eyeBlink 3.8s infinite ease-in-out;
                }
                .doctor-talk {
                  transform-origin: 150px 165px;
                  animation: mouthTalk 0.28s infinite ease-in-out alternate;
                }
                .doctor-breathe {
                  animation: subtleBreathe 4s infinite ease-in-out;
                }
              `}
            </style>
          </defs>

          {/* Torso Group (Breathing) */}
          <g className="doctor-breathe">
            
            {/* Shoulders & Torso */}
            <path 
              d="M60,320 C60,240 85,215 150,215 C215,215 240,240 240,320 Z" 
              fill="url(#coatGrad)" 
              stroke="#D4CEBF" 
              strokeWidth="2.5"
            />

            {/* Inner Medical Scrubs (Teal) */}
            <polygon 
              points="115,215 185,215 170,285 130,285" 
              fill="url(#scrubsGrad)" 
            />

            {/* Coat Lapels */}
            <path 
              d="M115,215 L80,280 L120,320 L150,260 Z" 
              fill="#FAF7F0" 
              stroke="#E8E2D5" 
              strokeWidth="1.5"
            />
            <path 
              d="M185,215 L220,280 L180,320 L150,260 Z" 
              fill="#FAF7F0" 
              stroke="#E8E2D5" 
              strokeWidth="1.5"
            />

            {/* Stethoscope around Neck */}
            <path 
              d="M110,215 C105,245 115,280 135,295 C145,295 150,285 150,270" 
              fill="none" 
              stroke="#2C3E50" 
              strokeWidth="4.5" 
              strokeLinecap="round"
            />
            <path 
              d="M190,215 C195,245 185,280 165,295" 
              fill="none" 
              stroke="#2C3E50" 
              strokeWidth="4.5" 
              strokeLinecap="round"
            />
            {/* Stethoscope Chest Piece */}
            <circle cx="135" cy="296" r="7" fill="#A3B1C2" stroke="#2C3E50" strokeWidth="2" />
            <circle cx="135" cy="296" r="3.5" fill="#EBF3EE" />

            {/* Stethoscope Earpieces entering neck */}
            <circle cx="110" cy="214" r="4" fill="#A3B1C2" />
            <circle cx="190" cy="214" r="4" fill="#A3B1C2" />

            {/* Medical ID Badge */}
            <rect x="75" y="250" width="22" height="30" rx="3" fill="#FFFFFF" stroke="#D4CEBF" strokeWidth="1.5" />
            <rect x="79" y="255" width="14" height="6" fill="#2A6A5E" rx="1" />
            <line x1="79" y1="266" x2="93" y2="266" stroke="#A8A29E" strokeWidth="1.5" />
            <line x1="79" y1="271" x2="89" y2="271" stroke="#A8A29E" strokeWidth="1.5" />

            {/* Thinking Hand (Appears near chin when Thinking) */}
            {state === "thinking" && (
              <g className="animate-in fade-in zoom-in-75 duration-300">
                <path 
                  d="M175,220 C185,200 185,175 165,175 C158,175 150,180 152,190" 
                  fill="url(#skinGrad)" 
                  stroke="#E2B694" 
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <circle cx="165" cy="177" r="6" fill="url(#skinGrad)" />
                <circle cx="171" cy="180" r="5" fill="url(#skinGrad)" />
              </g>
            )}

            {/* Explaining Hand Gesture (Appears when Speaking) */}
            {state === "speaking" && (
              <g className="animate-in fade-in duration-300">
                <path 
                  d="M215,260 C235,250 250,240 255,225 C255,220 248,220 240,228 L220,250" 
                  fill="url(#skinGrad)" 
                  stroke="#E2B694" 
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </g>
            )}
          </g>

          {/* Neck */}
          <rect x="135" y="180" width="30" height="40" rx="6" fill="url(#skinGrad)" />
          <path d="M135,195 Q150,205 165,195" fill="none" stroke="#E2B694" strokeWidth="1.5" opacity="0.6" />

          {/* Head & Face */}
          <g>
            {/* Ears */}
            <circle cx="95" cy="135" r="14" fill="url(#skinGrad)" stroke="#E2B694" strokeWidth="1.5" />
            <circle cx="205" cy="135" r="14" fill="url(#skinGrad)" stroke="#E2B694" strokeWidth="1.5" />
            <path d="M93,132 Q98,135 94,140" fill="none" stroke="#E2B694" strokeWidth="1.5" />
            <path d="M207,132 Q202,135 206,140" fill="none" stroke="#E2B694" strokeWidth="1.5" />

            {/* Face Shape */}
            <path 
              d="M102,110 C102,65 198,65 198,110 C198,155 178,190 150,190 C122,190 102,155 102,110 Z" 
              fill="url(#skinGrad)" 
              stroke="#E2B694" 
              strokeWidth="2"
            />

            {/* Hair Style */}
            <path 
              d="M98,110 C96,65 130,45 150,45 C170,45 204,65 202,110 C195,85 175,70 150,70 C125,70 105,85 98,110 Z" 
              fill="url(#hairGrad)" 
            />
            {/* Hair Sideburns */}
            <path d="M100,105 L102,130 L108,125 Z" fill="url(#hairGrad)" />
            <path d="M200,105 L198,130 L192,125 Z" fill="url(#hairGrad)" />

            {/* Eyebrows */}
            {state === "thinking" ? (
              // Inquisitive / Thinking Brows
              <>
                <path d="M120,108 Q132,103 140,111" fill="none" stroke="#3A2A20" strokeWidth="3" strokeLinecap="round" />
                <path d="M160,113 Q168,110 180,112" fill="none" stroke="#3A2A20" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : state === "listening" ? (
              // Attentive / Friendly Raised Brows
              <>
                <path d="M120,107 Q132,102 140,107" fill="none" stroke="#3A2A20" strokeWidth="3" strokeLinecap="round" />
                <path d="M160,107 Q168,102 180,107" fill="none" stroke="#3A2A20" strokeWidth="3" strokeLinecap="round" />
              </>
            ) : (
              // Normal Gentle Brows
              <>
                <path d="M120,110 Q132,106 140,110" fill="none" stroke="#3A2A20" strokeWidth="2.8" strokeLinecap="round" />
                <path d="M160,110 Q168,106 180,110" fill="none" stroke="#3A2A20" strokeWidth="2.8" strokeLinecap="round" />
              </>
            )}

            {/* Eyes (With natural blinking animation) */}
            <g className="doctor-blink">
              {/* Left Eye */}
              <ellipse cx="130" cy="126" rx="7" ry="8" fill="#FFFFFF" stroke="#E2B694" strokeWidth="1" />
              <circle 
                cx={state === "thinking" ? "132" : "130"} 
                cy={state === "thinking" ? "123" : "126"} 
                r="4.5" 
                fill="#2C1B14" 
              />
              <circle cx="132" cy="124" r="1.5" fill="#FFFFFF" />

              {/* Right Eye */}
              <ellipse cx="170" cy="126" rx="7" ry="8" fill="#FFFFFF" stroke="#E2B694" strokeWidth="1" />
              <circle 
                cx={state === "thinking" ? "172" : "170"} 
                cy={state === "thinking" ? "123" : "126"} 
                r="4.5" 
                fill="#2C1B14" 
              />
              <circle cx="172" cy="124" r="1.5" fill="#FFFFFF" />
            </g>

            {/* Soft Cheeks / Warmth */}
            <ellipse cx="118" cy="142" rx="7" ry="4" fill="#F1948A" opacity="0.45" />
            <ellipse cx="182" cy="142" rx="7" ry="4" fill="#F1948A" opacity="0.45" />

            {/* Friendly Nose */}
            <path d="M150,126 Q153,142 147,144 Q153,145 155,143" fill="none" stroke="#D99B77" strokeWidth="2" strokeLinecap="round" />

            {/* Mouth (Reactive to State) */}
            {state === "speaking" ? (
              // Animated Talking Mouth
              <g className="doctor-talk">
                <path 
                  d="M138,158 Q150,152 162,158 Q150,174 138,158 Z" 
                  fill="#78281F" 
                  stroke="#C0392B" 
                  strokeWidth="1.5" 
                />
                <path d="M142,158 Q150,161 158,158" fill="#FFFFFF" />
                <path d="M144,168 Q150,163 156,168" fill="#E74C3C" />
              </g>
            ) : state === "listening" ? (
              // Attentive Warm Listening Smile
              <path 
                d="M140,160 Q150,169 160,160" 
                fill="none" 
                stroke="#A93226" 
                strokeWidth="2.8" 
                strokeLinecap="round" 
              />
            ) : state === "thinking" ? (
              // Slight Thoughtful Pucker / Smile
              <path 
                d="M142,163 Q152,160 158,162" 
                fill="none" 
                stroke="#A93226" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
              />
            ) : (
              // Gentle Friendly Resting Smile
              <path 
                d="M138,159 Q150,168 162,159" 
                fill="none" 
                stroke="#A93226" 
                strokeWidth="2.6" 
                strokeLinecap="round" 
              />
            )}
          </g>
        </svg>
      </div>

      {/* Doctor Name & State Indicator Pill */}
      <div className="mt-4 flex flex-col items-center">
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-[#E8E2D5] shadow-sm backdrop-blur-md">
          <span 
            className={`w-2.5 h-2.5 rounded-full ${
              state === "speaking" 
                ? "bg-purple-500 animate-pulse" 
                : state === "listening" 
                ? "bg-emerald-500 animate-ping" 
                : state === "thinking" 
                ? "bg-amber-500 animate-bounce" 
                : "bg-[#2A6A5E]"
            }`} 
          />
          <span className="text-xs font-bold text-[#14332F] tracking-wide">
            {doctorName}
          </span>
          <span className="text-[10px] text-[#5E6E69] font-medium border-l border-[#E8E2D5] pl-2 uppercase tracking-wider">
            {state}
          </span>
        </div>
      </div>

    </div>
  );
}
