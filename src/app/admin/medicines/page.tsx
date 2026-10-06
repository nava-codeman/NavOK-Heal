"use client";

import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Pill, Plus, X, Trash2, Search, Tag } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface MedicineNode {
  id: string;
  genericName: string;
  brandName: string;
  category: string;
  createdAt: string;
}

export default function MedicinesPage() {
  const [medicines, setMedicines] = useState<MedicineNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSlideOutOpen, setIsSlideOutOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Form State
  const [genericName, setGenericName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [category, setCategory] = useState("Antibiotic");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "medicines"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: MedicineNode[] = [];
      snapshot.forEach(doc => {
        const d = doc.data();
        data.push({
          id: doc.id,
          genericName: d.genericName || "Unknown",
          brandName: d.brandName || "Unknown",
          category: d.category || "General",
          createdAt: d.createdAt?.toDate ? d.createdAt.toDate().toLocaleDateString() : "Unknown",
        });
      });
      setMedicines(data);
      setLoading(false);
    }, (error) => {
      console.error("Medicines fetch error", error);
      toast.error("Failed to sync medicine registry.");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddCompound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genericName || !brandName) {
      toast.error("Please fill all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "medicines"), {
        genericName,
        brandName,
        category,
        createdAt: serverTimestamp()
      });
      toast.success("Compound successfully added to registry.");
      setIsSlideOutOpen(false);
      setGenericName("");
      setBrandName("");
    } catch (error) {
      console.error("Error adding compound", error);
      toast.error("Failed to add compound.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this compound?")) return;
    try {
      await deleteDoc(doc(db, "medicines", id));
      toast.success("Compound removed from registry.");
    } catch (error) {
      console.error("Error deleting compound", error);
      toast.error("Failed to remove compound.");
    }
  };

  const filteredMedicines = medicines.filter(m => 
    m.genericName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.brandName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/60 pb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white font-sans">Compound Database</h2>
          <p className="text-xs text-zinc-500 font-mono mt-0.5">Global master registry for verification rules</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative w-64 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-indigo-400 transition-colors" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search registry..." 
              className="w-full bg-zinc-900/60 border border-zinc-800/80 rounded-xl pl-10 pr-4 py-2 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30 transition-all shadow-inner"
            />
          </div>
          <button 
            onClick={() => setIsSlideOutOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20"
          >
            <Plus className="h-4 w-4" />
            Add Compound
          </button>
        </div>
      </div>

      <div className="bg-[#121214]/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl shadow-xl overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : medicines.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Pill className="h-8 w-8 text-zinc-600 mb-3" />
            <p className="text-sm text-zinc-400 font-medium">Registry is empty.</p>
            <p className="text-xs text-zinc-600 font-mono mt-1">Add your first medicinal compound to initialize the database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-zinc-900/40">
                <tr className="text-zinc-500 uppercase tracking-wider text-[10px] font-semibold border-b border-zinc-800/80">
                  <th className="py-4 pl-6">Generic Title</th>
                  <th className="py-4">Brand Counterparts</th>
                  <th className="py-4">Category</th>
                  <th className="py-4">Registry Date</th>
                  <th className="py-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
                {filteredMedicines.map((med) => (
                  <tr key={med.id} className="hover:bg-zinc-800/20 transition-colors duration-200">
                    <td className="py-4 pl-6 font-semibold text-zinc-200">{med.genericName}</td>
                    <td className="py-4">{med.brandName}</td>
                    <td className="py-4">
                      <span className="flex w-fit items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400">
                        <Tag className="h-3 w-3" />
                        {med.category}
                      </span>
                    </td>
                    <td className="py-4 text-zinc-500">{med.createdAt}</td>
                    <td className="py-4 pr-6 text-right">
                      <button 
                        onClick={() => handleDelete(med.id)}
                        className="p-1.5 bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/30 text-red-400 rounded-lg transition-all"
                        title="Remove Compound"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-out Form Layer */}
      <AnimatePresence>
        {isSlideOutOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsSlideOutOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            
            {/* Drawer */}
            <motion.div 
              initial={{ x: "100%" }} 
              animate={{ x: 0 }} 
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-screen w-full sm:w-[400px] bg-[#09090B] border-l border-zinc-800/80 shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-zinc-800/80">
                <h3 className="text-lg font-bold text-white">Add New Compound</h3>
                <button 
                  onClick={() => setIsSlideOutOpen(false)}
                  className="p-2 text-zinc-400 hover:text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="p-6 flex-1 overflow-y-auto">
                <form id="add-med-form" onSubmit={handleAddCompound} className="space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Generic Title</label>
                    <input 
                      type="text" 
                      value={genericName}
                      onChange={(e) => setGenericName(e.target.value)}
                      placeholder="e.g. Amoxicillin" 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Brand Counterparts</label>
                    <input 
                      type="text" 
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      placeholder="e.g. Amoxil, Trimox" 
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    >
                      <option value="Antibiotic">Antibiotic</option>
                      <option value="Analgesic">Analgesic</option>
                      <option value="Antipyretic">Antipyretic</option>
                      <option value="Antiseptic">Antiseptic</option>
                      <option value="Supplement">Supplement</option>
                    </select>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-zinc-800/80 bg-zinc-900/50">
                <button 
                  form="add-med-form"
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Publish to Registry"
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
