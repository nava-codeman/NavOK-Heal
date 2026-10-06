"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  CheckCircle2, 
  UserCheck, 
  Pill, 
  Calendar, 
  ChevronRight, 
  Info 
} from "lucide-react";
import { ConsultationSummaryData } from "./SummaryReport";
import { toast } from "sonner";

interface SummaryCardProps {
  summary: ConsultationSummaryData;
  onSaveToTimeline?: () => void;
  onTalkToDoctor?: () => void;
}

export default function SummaryCard({
  summary,
  onSaveToTimeline,
  onTalkToDoctor,
}: SummaryCardProps) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast.success("Summary saved to your Health Timeline!");
    if (onSaveToTimeline) onSaveToTimeline();
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case "green":
        return { label: "Low Risk", bg: "bg-emerald-500/20", border: "border-emerald-500/30", text: "text-emerald-400" };
      case "yellow":
        return { label: "Moderate Risk", bg: "bg-amber-500/20", border: "border-amber-500/30", text: "text-amber-400" };
      case "orange":
        return { label: "Elevated Risk", bg: "bg-orange-500/20", border: "border-orange-500/30", text: "text-orange-400" };
      case "red":
        return { label: "High Risk", bg: "bg-red-500/20", border: "border-red-500/30", text: "text-red-400" };
      default:
        return { label: "Assessed", bg: "bg-blue-500/20", border: "border-blue-500/30", text: "text-blue-400" };
    }
  };

  const riskInfo = getRiskBadge(summary.riskLevel);

  return (
    <div className="w-full max-w-2xl my-4 p-5 rounded-2xl bg-zinc-900/90 border border-indigo-500/30 shadow-2xl backdrop-blur-md text-zinc-100">
      
      {/* Card Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white text-base leading-tight">AI Intake Assessment Summary</h4>
            <span className="text-[11px] text-zinc-400">Clinical Evaluation Result</span>
          </div>
        </div>
        <div className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold ${riskInfo.bg} ${riskInfo.border} ${riskInfo.text}`}>
          {riskInfo.label}
        </div>
      </div>

      {/* Summary Body */}
      <div className="py-4 space-y-4">
        <p className="text-xs md:text-sm leading-relaxed text-zinc-200 bg-black/30 p-3 rounded-xl border border-white/5">
          {summary.aiSummary}
        </p>

        {/* Possible Conditions */}
        {summary.possibleConditions && summary.possibleConditions.length > 0 && (
          <div>
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
              Possible Conditions & AI Confidence Match
            </span>
            <div className="space-y-2">
              {summary.possibleConditions.map((cond, i) => {
                const pct = Math.round(cond.confidenceScore * 100);
                return (
                  <div key={i} className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="font-medium text-white">{cond.name}</span>
                      <span className="font-mono text-indigo-400 font-semibold">{pct}% Match</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6 }}
                        className="bg-indigo-500 h-full rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {summary.suggestedSpecialists && summary.suggestedSpecialists.length > 0 && (
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="font-semibold text-emerald-400 block mb-1.5 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5" /> Recommended Specialists
              </span>
              <ul className="space-y-1 text-zinc-300">
                {summary.suggestedSpecialists.map((s, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-emerald-400 shrink-0" /> {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {summary.suggestedMedicineCategories && summary.suggestedMedicineCategories.length > 0 && (
            <div className="p-3 rounded-xl bg-black/40 border border-white/5">
              <span className="font-semibold text-amber-400 block mb-1.5 flex items-center gap-1">
                <Pill className="w-3.5 h-3.5" /> Medication Categories
              </span>
              <ul className="space-y-1 text-zinc-300">
                {summary.suggestedMedicineCategories.map((m, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <ChevronRight className="w-3 h-3 text-amber-400 shrink-0" /> {m}
                  </li>
                ))}
              </ul>
              <span className="text-[9px] text-zinc-500 block mt-1.5">Informational only — consult a doctor.</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Actions */}
      <div className="pt-3 border-t border-white/10 flex flex-wrap gap-2">
        <button
          onClick={handleSave}
          disabled={saved}
          className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-emerald-600 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
        >
          {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
          {saved ? "Saved to Health Timeline" : "Save to Health Timeline"}
        </button>

        {(summary.riskLevel === "orange" || summary.riskLevel === "red" || summary.severity === "high") && onTalkToDoctor && (
          <button
            onClick={onTalkToDoctor}
            className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" /> Talk to a Doctor
          </button>
        )}
      </div>
    </div>
  );
}
