"use client";

import React, { useEffect, useRef } from "react";
import { Search, Bell, Shield, ShieldCheck, CheckCircle, X } from "lucide-react";
import { useNotificationsStore } from "@/store/notificationsStore";
import { AnimatePresence, motion } from "framer-motion";

export default function TopBar() {
  const { isOpen, alerts, togglePopover, closePopover, startListening, markAsRead } = useNotificationsStore();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = startListening();
    return () => unsubscribe();
  }, [startListening]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        closePopover();
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closePopover]);

  return (
    <header className="sticky top-0 right-0 z-40 w-full bg-[#09090B]/60 backdrop-blur-md border-b border-zinc-800/60 h-16 px-6 lg:px-8 flex items-center justify-between">
      {/* Premium Spotlight Global Command Box */}
      <div className="relative w-72 max-w-md group hidden sm:block">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 group-focus-within:text-indigo-400 transition-colors duration-300" />
        <input 
          type="text" 
          placeholder="Global system index lookup..." 
          className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl pl-9 pr-4 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all duration-300 shadow-inner"
        />
      </div>
      <div className="sm:hidden text-sm font-semibold text-white">Console</div>

      {/* Control Nodes */}
      <div className="flex items-center gap-4 relative" ref={popoverRef}>
        {/* Security Matrix Health Indicator */}
        <div className="flex items-center gap-1.5 bg-emerald-500/5 border border-emerald-500/20 rounded-full px-2.5 py-1">
          <Shield className="h-3 w-3 text-emerald-400" />
          <span className="font-mono text-[10px] text-emerald-400 tracking-wider uppercase font-semibold">RBAC Verified</span>
        </div>

        {/* System Broadcast Center Trigger */}
        <button 
          onClick={togglePopover}
          className="relative p-2 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/80 transition-all duration-300 text-zinc-400 hover:text-white group"
        >
          <Bell className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform duration-300" />
          {alerts.length > 0 && (
            <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-indigo-500 rounded-full border border-[#09090B]" />
          )}
        </button>

        {/* Glassmorphic Dropdown Popover */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-14 right-0 w-80 bg-[#121214]/90 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden z-50 flex flex-col"
            >
              <div className="px-4 py-3 border-b border-zinc-800/60 flex items-center justify-between bg-zinc-900/50">
                <h3 className="text-xs font-semibold tracking-wide text-zinc-200">System Alerts</h3>
                <span className="text-[10px] font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">{alerts.length} pending</span>
              </div>
              
              <div className="max-h-80 overflow-y-auto p-2 space-y-2">
                {alerts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-6 text-center">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
                      <ShieldCheck className="h-6 w-6 text-emerald-400" />
                    </div>
                    <p className="text-xs font-medium text-zinc-300 mb-1">System secure.</p>
                    <p className="text-[10px] font-mono text-zinc-500">Zero outstanding infrastructure notifications.</p>
                  </div>
                ) : (
                  alerts.map(alert => (
                    <div key={alert.id} className="relative p-3 rounded-xl bg-zinc-900/40 border border-zinc-800/60 hover:bg-zinc-800/40 transition-colors group">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[11px] font-bold text-zinc-200 uppercase tracking-wide truncate mb-1">
                            {alert.title}
                          </h4>
                          <p className="text-[10px] text-zinc-400 leading-tight mb-2">
                            {alert.message}
                          </p>
                          <span className="text-[9px] font-mono text-zinc-500">{alert.timestamp}</span>
                        </div>
                        <button 
                          onClick={() => markAsRead(alert.id)}
                          className="flex-shrink-0 p-1.5 rounded-lg bg-zinc-800/50 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition-all"
                          title="Mark as Read"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {/* Indicator strip based on alert type */}
                      <div className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-l-xl ${
                        alert.type === 'critical' ? 'bg-red-500' : 
                        alert.type === 'warning' ? 'bg-amber-500' : 'bg-indigo-500'
                      }`} />
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
