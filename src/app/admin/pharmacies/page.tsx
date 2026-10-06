"use client";

import React, { useState, useEffect } from "react";
import { collection, query, getDocs, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Check, X, Store, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PharmacyNode {
  id: string;
  email: string;
  name: string;
  verificationStatus: "pending" | "approved" | "rejected";
  licenseNumber?: string;
  createdAt: string;
}

export default function PharmaciesPage() {
  const [pharmacies, setPharmacies] = useState<PharmacyNode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, "pharmacies"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: PharmacyNode[] = [];
      snapshot.forEach(d => {
        const docData = d.data();
        data.push({
          id: d.id,
          email: docData.email || "unknown",
          name: docData.name || "Unnamed Pharmacy",
          verificationStatus: docData.verificationStatus || "pending",
          licenseNumber: docData.licenseNumber || "N/A",
          createdAt: docData.createdAt?.toDate ? docData.createdAt.toDate().toLocaleDateString() : "Unknown",
        });
      });
      // Sort pending first
      data.sort((a, b) => {
        if (a.verificationStatus === "pending" && b.verificationStatus !== "pending") return -1;
        if (a.verificationStatus !== "pending" && b.verificationStatus === "pending") return 1;
        return 0;
      });
      setPharmacies(data);
      setLoading(false);
    }, (err) => {
      console.error("Pharmacies error:", err);
      toast.error("Failed to sync pharmacy ledger");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: "approved" | "rejected") => {
    try {
      const ref = doc(db, "pharmacies", id);
      await updateDoc(ref, { verificationStatus: newStatus });
      toast.success(`Pharmacy registration ${newStatus}.`);
    } catch (error) {
      console.error("Failed to update status", error);
      toast.error("System error: Unable to modify verification state.");
    }
  };

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">Pharmacy Infrastructure Matrix</h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">Brand registrations and live operational state</p>
        </div>
      </div>

      <div className="bg-[#121214]/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800/60 flex items-center justify-between bg-zinc-900/20">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <Store className="h-4 w-4 text-indigo-400" />
            </div>
            <h4 className="text-sm font-semibold tracking-wide text-white">Active Queue & Logs</h4>
          </div>
        </div>

        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pharmacies.length === 0 ? (
           <div className="p-12 text-center flex flex-col items-center">
            <AlertCircle className="h-8 w-8 text-zinc-600 mb-3" />
            <p className="text-sm text-zinc-400 font-medium">Verification queue fully cleared.</p>
            <p className="text-xs text-zinc-600 font-mono mt-1">Zero pharmacy applications present in the global registry.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-zinc-900/40">
                <tr className="text-zinc-500 uppercase tracking-wider text-[10px] font-semibold border-b border-zinc-800/80">
                  <th className="py-4 pl-6">Business Node</th>
                  <th className="py-4">License Index</th>
                  <th className="py-4">Auth Status</th>
                  <th className="py-4">Timestamp</th>
                  <th className="py-4 pr-6 text-right">Command Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {pharmacies.map((pharm) => (
                  <tr key={pharm.id} className="hover:bg-zinc-800/20 transition-colors duration-200">
                    <td className="py-4 pl-6">
                      <div className="font-semibold text-zinc-200">{pharm.name}</div>
                      <div className="text-[10px] text-zinc-500 truncate max-w-[200px]">{pharm.email}</div>
                    </td>
                    <td className="py-4 text-zinc-400">{pharm.licenseNumber}</td>
                    <td className="py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        pharm.verificationStatus === "approved" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                        pharm.verificationStatus === "rejected" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                        "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse"
                      }`}>
                        {pharm.verificationStatus}
                      </span>
                    </td>
                    <td className="py-4 text-zinc-500">{pharm.createdAt}</td>
                    <td className="py-4 pr-6 text-right">
                      {pharm.verificationStatus === "pending" ? (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleUpdateStatus(pharm.id, "approved")}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg transition-all"
                            title="Approve"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleUpdateStatus(pharm.id, "rejected")}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-all"
                            title="Reject"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] text-zinc-600 uppercase tracking-widest font-semibold">Locked</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
