"use client";

import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, limit } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Terminal, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

interface AuditLogNode {
  id: string;
  action: string;
  user: string;
  ipAddress?: string;
  timestamp: string;
}

export default function AuditPage() {
  const [logs, setLogs] = useState<AuditLogNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Polling audit_logs subcollection
    const q = query(collection(db, "system_settings", "logs", "audit_logs"), orderBy("timestamp", "desc"), limit(100));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: AuditLogNode[] = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        data.push({
          id: doc.id,
          action: d.action || "UNKNOWN_ACTION",
          user: d.user || "system",
          ipAddress: d.ipAddress || "0.0.0.0",
          timestamp: d.timestamp?.toDate ? d.timestamp.toDate().toISOString() : new Date().toISOString(),
        });
      });
      setLogs(data);
      setLoading(false);
    }, (error) => {
      console.error("Audit logs fetch error", error);
      toast.error("Failed to sync audit ledger.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-6 shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">Audit & Security Logs</h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">Raw system state transitions and access records</p>
        </div>
      </div>

      <div className="bg-[#09090B] border border-zinc-800/80 rounded-2xl shadow-2xl overflow-hidden flex-1 flex flex-col min-h-[600px]">
        <div className="bg-zinc-900/50 border-b border-zinc-800/60 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-zinc-400">
            <Terminal className="h-4 w-4" />
            <span className="text-xs font-mono font-bold uppercase tracking-widest">Sys_Console // TTY1</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest font-semibold">Live Socket</span>
          </div>
        </div>

        <div className="flex-1 p-4 font-mono text-xs overflow-y-auto">
          {loading ? (
            <div className="text-zinc-500 animate-pulse">Initializing secure connection to audit ledger...</div>
          ) : logs.length === 0 ? (
            <div className="text-zinc-500">
              <span className="text-emerald-500 mr-2">sysadmin@navok-heal:~$</span> 
              cat /var/log/audit.log
              <br/><br/>
              [SYSTEM] No access logs recorded in the current lifecycle.
            </div>
          ) : (
            <div className="space-y-1 text-zinc-300">
              {logs.map((log, index) => (
                <div key={log.id} className="hover:bg-zinc-800/30 px-2 py-1 -mx-2 rounded transition-colors flex flex-col sm:flex-row sm:gap-4">
                  <span className="text-zinc-500 shrink-0">[{log.timestamp}]</span>
                  <span className="text-indigo-400 font-bold shrink-0">{log.user}</span>
                  <span className="text-zinc-200">{log.action}</span>
                  <span className="text-zinc-600 ml-auto sm:ml-0 sm:border-l border-zinc-800 sm:pl-4">{log.ipAddress}</span>
                </div>
              ))}
              <div className="pt-4 pb-2 text-zinc-500 flex items-center gap-2">
                <span className="w-1.5 h-3 bg-zinc-400 animate-pulse" />
                Waiting for incoming streams...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
