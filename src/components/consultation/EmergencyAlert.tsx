"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Phone, Building2, UserCheck, ShieldAlert } from "lucide-react";

interface EmergencyAlertProps {
  emergencyNumber?: string;
  userEmergencyContact?: {
    name: string;
    phone: string;
    relationship?: string;
  } | null;
  nearestHospitalPlaceholder?: string;
  onDismiss?: () => void;
}

export default function EmergencyAlert({
  emergencyNumber = "112",
  userEmergencyContact,
  nearestHospitalPlaceholder = "City General Hospital & Emergency Trauma Center (1.8 miles away)",
  onDismiss,
}: EmergencyAlertProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 bg-red-950/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 md:p-6 overflow-y-auto"
    >
      <div className="bg-red-950/80 border border-red-500/50 p-6 md:p-8 rounded-3xl max-w-lg w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.4)] my-auto relative">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse border border-red-500/40">
          <AlertTriangle className="w-10 h-10 text-red-400" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold uppercase tracking-wider mb-3">
          <ShieldAlert className="w-3.5 h-3.5" /> High Risk Detected
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">
          MEDICAL EMERGENCY ALERT
        </h2>

        <p className="text-red-100 text-sm md:text-base mb-6 leading-relaxed">
          NavOk AI detected symptoms indicating a potential medical emergency. Please seek immediate emergency medical care. Do not wait for an online response.
        </p>

        {/* Primary Action Button */}
        <a
          href={`tel:${emergencyNumber}`}
          className="inline-flex w-full justify-center items-center gap-3 py-4 px-6 bg-red-600 hover:bg-red-500 text-white font-bold text-lg rounded-2xl transition-all shadow-[0_0_30px_rgba(220,38,38,0.6)] hover:shadow-[0_0_40px_rgba(239,68,68,0.8)] mb-6"
        >
          <Phone className="w-6 h-6 animate-bounce" />
          Call Emergency Services ({emergencyNumber})
        </a>

        {/* Info Cards */}
        <div className="space-y-3 text-left">
          {/* Nearest Hospital Placeholder */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-red-500/20 flex items-start gap-3">
            <Building2 className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-xs text-red-300 font-semibold uppercase block">Nearest Hospital</span>
              <span className="text-xs text-zinc-200">{nearestHospitalPlaceholder}</span>
            </div>
          </div>

          {/* User Emergency Contact */}
          {userEmergencyContact && (
            <div className="p-3.5 rounded-2xl bg-black/40 border border-red-500/20 flex items-start gap-3">
              <UserCheck className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs text-red-300 font-semibold uppercase block">Personal Emergency Contact</span>
                <div className="flex justify-between items-center mt-1">
                  <div>
                    <span className="text-xs font-semibold text-white">{userEmergencyContact.name}</span>
                    {userEmergencyContact.relationship && (
                      <span className="text-[10px] text-zinc-400 ml-1.5">({userEmergencyContact.relationship})</span>
                    )}
                  </div>
                  <a
                    href={`tel:${userEmergencyContact.phone}`}
                    className="text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 px-2.5 py-1 rounded-lg border border-red-500/30 transition-colors"
                  >
                    {userEmergencyContact.phone}
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="mt-6 text-xs text-zinc-400 hover:text-white underline transition-colors"
          >
            I am now safe — return to consultation
          </button>
        )}
      </div>
    </motion.div>
  );
}
