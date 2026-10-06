"use client";

import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Stethoscope, ChevronDown, ChevronUp, Bot, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ConsultationNode {
  id: string;
  patientId: string;
  transcript: string;
  diagnosticIndex: string;
  timestamp: string;
}

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<ConsultationNode[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "consultations"), orderBy("timestamp", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: ConsultationNode[] = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        data.push({
          id: doc.id,
          patientId: d.patientId || "Unknown Patient",
          transcript: d.transcript || "No transcript available.",
          diagnosticIndex: d.diagnosticIndex || "Normal",
          timestamp: d.timestamp?.toDate ? d.timestamp.toDate().toLocaleString() : "Unknown",
        });
      });
      setConsultations(data);
      setLoading(false);
    }, (error) => {
      console.error("Consultations fetch error", error);
      toast.error("Failed to sync consultation ledger.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">AI Consultation Logs</h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">Chronological event ledger and transcript analysis</p>
        </div>
      </div>

      <div className="bg-[#121214]/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : consultations.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Stethoscope className="h-8 w-8 text-zinc-600 mb-3" />
            <p className="text-sm text-zinc-400 font-medium">0 active streams recorded.</p>
            <p className="text-xs text-zinc-600 font-mono mt-1">No AI consultation sessions have been initiated.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/60">
            {consultations.map((consult) => (
              <div key={consult.id} className="group">
                {/* Header Row */}
                <div 
                  onClick={() => setExpandedId(expandedId === consult.id ? null : consult.id)}
                  className="px-6 py-4 flex items-center justify-between hover:bg-zinc-800/20 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-200">Session ID: {consult.id.slice(0, 8).toUpperCase()}</h4>
                      <p className="text-xs font-mono text-zinc-500">Patient: {consult.patientId.slice(0,12)}...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <span className="text-[10px] font-mono text-zinc-500 hidden sm:block">{consult.timestamp}</span>
                    <div className="p-1.5 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-400 group-hover:text-white transition-colors">
                      {expandedId === consult.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedId === consult.id && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-zinc-900/40 rounded-xl border border-zinc-800/60 p-5">
                          {/* Transcript Box */}
                          <div className="lg:col-span-2 space-y-3">
                            <h5 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Parsed Transcript</h5>
                            <div className="p-4 bg-[#09090B] rounded-lg border border-zinc-800/80 text-xs font-mono text-zinc-300 leading-relaxed max-h-48 overflow-y-auto">
                              {consult.transcript}
                            </div>
                          </div>
                          {/* Diagnostics Box */}
                          <div className="space-y-3">
                            <h5 className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Diagnostic Safety Index</h5>
                            <div className="p-4 bg-[#09090B] rounded-lg border border-zinc-800/80 flex flex-col h-[calc(100%-28px)] justify-center">
                              <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                                <span className="text-sm font-semibold text-emerald-400">Risk Cleared</span>
                              </div>
                              <p className="text-xs text-zinc-400">Index Flag: <span className="font-mono text-zinc-200">{consult.diagnosticIndex}</span></p>
                              <div className="mt-4 pt-4 border-t border-zinc-800/60">
                                <button className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-[10px] uppercase tracking-wider font-semibold transition-colors">
                                  Flag for Human Review
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
