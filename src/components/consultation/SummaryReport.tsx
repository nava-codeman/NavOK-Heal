"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  AlertCircle, 
  ShieldAlert, 
  Activity, 
  Pill, 
  UserCheck, 
  Calendar, 
  Download, 
  Sparkles,
  Info,
  ChevronRight
} from "lucide-react";
import { toast } from "sonner";

export interface ConsultationSummaryData {
  aiSummary: string;
  symptoms: string[];
  possibleConditions: Array<{
    name: string;
    confidenceScore: number; // 0 to 1
    description?: string;
  }>;
  severity: "low" | "moderate" | "high" | "emergency";
  suggestedMedicineCategories: string[];
  suggestedSpecialists: string[];
  riskLevel: "green" | "yellow" | "orange" | "red";
  lifestyleNotes?: string[];
  emergencyFlag?: boolean;
}

interface SummaryReportProps {
  summary: ConsultationSummaryData;
  onSaveToTimeline?: () => void;
  onTalkToDoctor?: () => void;
  onClose?: () => void;
}

export default function SummaryReport({
  summary,
  onSaveToTimeline,
  onTalkToDoctor,
  onClose,
}: SummaryReportProps) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    toast.success("Consultation summary saved to your Health Timeline!");
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 md:p-6 overflow-y-auto"
    >
      <div className="bg-zinc-900 border border-white/10 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col text-zinc-100">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold">Consultation Report</h2>
              <span className="text-xs text-zinc-400">AI Clinical Intake Summary</span>
            </div>
          </div>
          <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold ${riskInfo.bg} ${riskInfo.border} ${riskInfo.text}`}>
            {riskInfo.label}
          </div>
        </div>

        {/* Report Content */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6 custom-scrollbar pr-1">
          
          {/* Disclaimer banner */}
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-start gap-3 text-xs text-indigo-200">
            <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>
              <strong>Informational Assistance Only:</strong> This AI summary organizes your self-reported symptoms for clinician review and does not constitute a definitive medical diagnosis.
            </span>
          </div>

          {/* AI Clinical Summary */}
          <div>
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" /> Intake Summary
            </h3>
            <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5 text-sm leading-relaxed text-zinc-200">
              {summary.aiSummary}
            </div>
          </div>

          {/* Symptoms List */}
          {summary.symptoms && summary.symptoms.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                Identified Symptoms
              </h3>
              <div className="flex flex-wrap gap-2">
                {summary.symptoms.map((symptom, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-zinc-300"
                  >
                    {symptom}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Possible Conditions & Confidence Bars */}
          {summary.possibleConditions && summary.possibleConditions.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
                Possible Conditions & AI Confidence Match
              </h3>
              <div className="space-y-3">
                {summary.possibleConditions.map((condition, idx) => {
                  const pct = Math.round(condition.confidenceScore * 100);
                  return (
                    <div key={idx} className="p-3.5 rounded-2xl bg-zinc-950/60 border border-white/5">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-sm font-semibold text-white">{condition.name}</span>
                        <span className="text-xs font-mono font-medium text-indigo-400">{pct}% Match</span>
                      </div>
                      <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden mb-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full"
                        />
                      </div>
                      {condition.description && (
                        <p className="text-xs text-zinc-400">{condition.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggested Specialist & Medicine Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {summary.suggestedSpecialists && summary.suggestedSpecialists.length > 0 && (
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Recommended Specialists
                </h4>
                <ul className="space-y-1 text-xs text-zinc-300">
                  {summary.suggestedSpecialists.map((spec, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-400" /> {spec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {summary.suggestedMedicineCategories && summary.suggestedMedicineCategories.length > 0 && (
              <div className="p-4 rounded-2xl bg-zinc-950/60 border border-white/5">
                <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Pill className="w-4 h-4 text-amber-400" /> Suggested Medication Types
                </h4>
                <ul className="space-y-1 text-xs text-zinc-300">
                  {summary.suggestedMedicineCategories.map((med, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400" /> {med}
                    </li>
                  ))}
                </ul>
                <span className="text-[10px] text-zinc-500 mt-2 block">
                  *Consult a licensed pharmacist or physician before taking any medication.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Footer CTAs */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSave}
            disabled={saved}
            className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-emerald-600 text-white font-semibold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)]"
          >
            {saved ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> Saved to Timeline
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" /> Save to Health Timeline
              </>
            )}
          </button>

          {(summary.riskLevel === "orange" || summary.riskLevel === "red" || summary.severity === "high") && onTalkToDoctor && (
            <button
              onClick={onTalkToDoctor}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold text-sm rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              <UserCheck className="w-4 h-4" /> Talk to a Doctor Now
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="py-3 px-4 bg-white/10 hover:bg-white/20 text-zinc-300 font-semibold text-sm rounded-2xl transition-colors"
            >
              Done
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
