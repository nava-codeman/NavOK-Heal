"use client";

import React from "react";
import { AlertTriangle, Phone, Building2 } from "lucide-react";

interface EmergencyCardProps {
  emergencyNumber?: string;
  onAcknowledge?: () => void;
}

export default function EmergencyCard({
  emergencyNumber = "112",
  onAcknowledge,
}: EmergencyCardProps) {
  return (
    <div className="w-full max-w-xl my-3 p-5 rounded-2xl bg-red-950/60 border border-red-500/40 shadow-xl backdrop-blur-md text-red-100">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/40 shrink-0 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-red-400" />
        </div>
        <div>
          <h4 className="font-bold text-white text-base leading-tight">POTENTIAL MEDICAL EMERGENCY</h4>
          <span className="text-xs text-red-300">Immediate action recommended</span>
        </div>
      </div>

      <p className="text-xs md:text-sm text-red-200 mb-4 leading-relaxed">
        Your response indicated symptoms associated with an urgent medical emergency. Please discontinue virtual assessment and seek emergency attention immediately.
      </p>

      <div className="flex flex-col sm:flex-row gap-2.5">
        <a
          href={`tel:${emergencyNumber}`}
          className="flex-1 inline-flex justify-center items-center gap-2 py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.5)]"
        >
          <Phone className="w-4 h-4" />
          Call Emergency ({emergencyNumber})
        </a>

        {onAcknowledge && (
          <button
            onClick={onAcknowledge}
            className="py-2.5 px-4 bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-semibold rounded-xl border border-white/10 transition-colors"
          >
            Confirm Safety / Continue
          </button>
        )}
      </div>

      <div className="mt-3 pt-3 border-t border-red-500/20 flex items-center gap-2 text-[11px] text-red-300/80">
        <Building2 className="w-3.5 h-3.5 shrink-0" />
        <span>Nearest emergency room: City General Hospital & Emergency Center</span>
      </div>
    </div>
  );
}
