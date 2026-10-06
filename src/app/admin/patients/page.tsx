"use client";

import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Search, UserPlus, ShieldAlert, Terminal } from "lucide-react";
import { toast } from "sonner";

interface PatientNode {
  id: string;
  email: string;
  name?: string;
  role: string;
  createdAt: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientNode[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), where("role", "==", "patient"));
      const snap = await getDocs(q);
      const data: PatientNode[] = [];
      snap.forEach(doc => {
        const d = doc.data();
        data.push({
          id: doc.id,
          email: d.email || "unknown@domain.local",
          name: d.name || d.profileData?.fullName || "Undocumented",
          role: d.role,
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString() : "Unknown",
        });
      });
      setPatients(data);
    } catch (error) {
      console.error("Error fetching patients", error);
      toast.error("Failed to load patient records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleProvisionTestPatient = async () => {
    try {
      await addDoc(collection(db, "users"), {
        email: `test_patient_${Math.floor(Math.random() * 1000)}@example.com`,
        name: "Test Patient Array",
        role: "patient",
        status: "Active",
        createdAt: serverTimestamp()
      });
      toast.success("Root test patient token provisioned successfully.");
      fetchPatients();
    } catch (error) {
      console.error("Error provisioning patient:", error);
      toast.error("Failed to provision test patient.");
    }
  };

  const filteredPatients = patients.filter(p => 
    p.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">Patient Directory Hub</h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">Live index of all authenticated patient profiles</p>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..." 
            className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all shadow-inner"
          />
        </div>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : patients.length === 0 ? (
        <div className="border border-dashed border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center text-center bg-[#121214]/40 backdrop-blur-sm">
          <div className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4">
            <Terminal className="h-6 w-6 text-indigo-400 animate-pulse" />
          </div>
          <h3 className="text-sm font-semibold text-white mb-2">Zero Patients Indexed</h3>
          <p className="text-xs font-mono text-zinc-500 max-w-md mb-6">
            The patient sub-collection is currently empty. The system is listening for new authentication lifecycles.
          </p>
          <button 
            onClick={handleProvisionTestPatient}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-semibold uppercase tracking-wider rounded-lg transition-all"
          >
            <UserPlus className="h-4 w-4" />
            Provision Root Test Patient Token
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPatients.map((patient) => (
            <div key={patient.id} className="relative overflow-hidden rounded-2xl bg-[#121214]/40 backdrop-blur-xl border border-zinc-800/80 p-6 shadow-xl transition-all duration-300 hover:border-indigo-500/30 group">
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-mono font-bold text-sm uppercase">
                  {patient.name?.charAt(0) || "U"}
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-mono font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {patient.role}
                </span>
              </div>
              <div className="space-y-1 z-10 relative">
                <h3 className="text-base font-bold tracking-tight text-white">{patient.name}</h3>
                <p className="text-xs font-mono text-zinc-500 truncate">{patient.email}</p>
                <div className="pt-4 flex items-center justify-between text-[10px] text-zinc-600 font-mono border-t border-zinc-800/60 mt-4">
                  <span>ID: {patient.id.slice(0,8)}...</span>
                  <span>Joined: {patient.createdAt}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredPatients.length === 0 && (
            <div className="col-span-full py-12 text-center text-xs font-mono text-zinc-500">
              No matching records found for "{searchTerm}".
            </div>
          )}
        </div>
      )}
    </div>
  );
}
