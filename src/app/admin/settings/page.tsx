"use client";

import React, { useState, useEffect } from "react";
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Settings, Shield, Globe, Database, ServerCrash, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface SystemConfig {
  maintenanceMode: boolean;
  languageDictionarySync: boolean;
  globalApiVersion: string;
}

export default function SettingsPage() {
  const [config, setConfig] = useState<SystemConfig>({
    maintenanceMode: false,
    languageDictionarySync: true,
    globalApiVersion: "v1.4.2-stable",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const configRef = doc(db, "system_settings", "global_config");
    const unsubscribe = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConfig({
          maintenanceMode: data.maintenanceMode || false,
          languageDictionarySync: data.languageDictionarySync ?? true,
          globalApiVersion: data.globalApiVersion || "v1.4.2-stable",
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("Config fetch error", error);
      toast.error("Failed to read system configuration.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleToggle = async (field: keyof SystemConfig) => {
    setSaving(true);
    const newValue = !config[field];
    try {
      const configRef = doc(db, "system_settings", "global_config");
      await updateDoc(configRef, { [field]: newValue }).catch(async (e) => {
        // If document doesn't exist, create it
        if (e.code === 'not-found') {
           await setDoc(configRef, { ...config, [field]: newValue });
        } else throw e;
      });
      toast.success(`${field} updated successfully.`);
    } catch (error) {
      console.error("Config update error", error);
      toast.error(`Failed to update ${field}.`);
    } finally {
      setSaving(false);
    }
  };

  const handleVersionUpdate = async (newVersion: string) => {
    setSaving(true);
    try {
      const configRef = doc(db, "system_settings", "global_config");
      await updateDoc(configRef, { globalApiVersion: newVersion }).catch(async (e) => {
        if (e.code === 'not-found') {
           await setDoc(configRef, { ...config, globalApiVersion: newVersion });
        } else throw e;
      });
      toast.success(`Global API Version updated to ${newVersion}.`);
    } catch (error) {
      console.error("Config update error", error);
      toast.error("Failed to update API version.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">Platform Configuration Matrix</h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">Core system operational switches and environment variables</p>
        </div>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Security & Maintenance */}
          <div className="bg-[#121214]/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/60">
              <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                <Shield className="h-4 w-4 text-red-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">System Operations</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">Maintenance Mode</h4>
                <p className="text-[11px] text-zinc-500 max-w-[250px] mt-1">Suspend all external API traffic and redirect users to the status page.</p>
              </div>
              <button 
                onClick={() => handleToggle("maintenanceMode")}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#09090B] ${config.maintenanceMode ? 'bg-red-500' : 'bg-zinc-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.maintenanceMode ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/60">
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">Force Cache Invalidation</h4>
                <p className="text-[11px] text-zinc-500 max-w-[250px] mt-1">Purge all edge CDN caches across global regions.</p>
              </div>
              <button 
                className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg border border-zinc-700 transition-colors flex items-center gap-2"
              >
                <ServerCrash className="h-3 w-3" />
                Purge Nodes
              </button>
            </div>
          </div>

          {/* Core Configuration */}
          <div className="bg-[#121214]/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-zinc-800/60">
              <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <Database className="h-4 w-4 text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-white">Environment Configuration</h3>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">Language Dictionary Sync</h4>
                <p className="text-[11px] text-zinc-500 max-w-[250px] mt-1">Automatically push translation vector updates to client devices.</p>
              </div>
              <button 
                onClick={() => handleToggle("languageDictionarySync")}
                disabled={saving}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#09090B] ${config.languageDictionarySync ? 'bg-emerald-500' : 'bg-zinc-700'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${config.languageDictionarySync ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div className="pt-4 border-t border-zinc-800/60 space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-zinc-200">Global API Version Structure</h4>
                <p className="text-[11px] text-zinc-500 mt-1">Target engine specification for client requests.</p>
              </div>
              <div className="flex items-center gap-3">
                <select 
                  value={config.globalApiVersion}
                  onChange={(e) => handleVersionUpdate(e.target.value)}
                  disabled={saving}
                  className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors w-48 font-mono"
                >
                  <option value="v1.4.2-stable">v1.4.2-stable</option>
                  <option value="v1.5.0-beta">v1.5.0-beta</option>
                  <option value="v2.0.0-rc1">v2.0.0-rc1</option>
                </select>
                {saving ? (
                   <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                   <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
