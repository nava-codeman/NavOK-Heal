"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search, Pill, AlertTriangle, CheckCircle, Info, Filter, ArrowDownAZ, ArrowUpAZ, Loader2, CloudOff } from "lucide-react";

interface Medicine {
  id: string;
  name: string;
  price: number;
  type: string;
  medicine_desc: string;
  side_effects: string;
  manufacturer_name: string;
}

export default function MedicinesPage() {
  const router = useRouter();
  
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  
  // Background loading state
  const [bgLoadProgress, setBgLoadProgress] = useState(0); // 0 to 100
  const [bgLoadError, setBgLoadError] = useState<string | null>(null);
  const [totalRecords, setTotalRecords] = useState(0);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [priceSort, setPriceSort] = useState<"none" | "asc" | "desc">("none");
  const [displayLimit, setDisplayLimit] = useState(50);
  
  const fetchedChunksRef = useRef(new Set<number>());

  useEffect(() => {
    let isCancelled = false;

    const loadDataset = async () => {
      try {
        // Fetch metadata
        const metaRes = await fetch('/data/medicines_meta.json');
        if (!metaRes.ok) throw new Error('Failed to fetch dataset metadata');
        const meta = await metaRes.json();
        const totalChunks = meta.totalChunks;
        
        if (isCancelled) return;
        setTotalRecords(meta.totalRecords);

        // Fetch chunk 0 for initial paint
        const chunk0Res = await fetch('/data/medicines_chunk_0.json');
        if (!chunk0Res.ok) throw new Error('Failed to fetch initial chunk');
        const chunk0 = await chunk0Res.json();
        
        if (isCancelled) return;
        setAllMedicines(chunk0);
        fetchedChunksRef.current.add(0);
        setIsLoadingInitial(false);
        setBgLoadProgress(Math.round((1 / totalChunks) * 100));

        // Background progressive load for the rest
        for (let i = 1; i < totalChunks; i++) {
          if (isCancelled) return;
          if (fetchedChunksRef.current.has(i)) continue;

          let retries = 3;
          let success = false;
          
          while (retries > 0 && !success) {
            try {
              const res = await fetch(`/data/medicines_chunk_${i}.json`);
              if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
              const chunkData = await res.json();
              
              if (isCancelled) return;
              
              setAllMedicines(prev => [...prev, ...chunkData]);
              fetchedChunksRef.current.add(i);
              setBgLoadProgress(Math.round(((i + 1) / totalChunks) * 100));
              success = true;
            } catch (err) {
              retries--;
              if (retries === 0) {
                console.error(`Failed to load chunk ${i} after retries:`, err);
                if (!isCancelled) setBgLoadError(`Warning: Could not load the complete dataset (Chunk ${i} failed). Search results may be incomplete.`);
              } else {
                // Short wait before retry
                await new Promise(r => setTimeout(r, 1000));
              }
            }
          }
        }
      } catch (error) {
        console.error("Error initializing dataset:", error);
        if (!isCancelled) {
          setBgLoadError("Critical Error: Could not initialize the medicine database. Please refresh the page.");
          setIsLoadingInitial(false);
        }
      }
    };

    loadDataset();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Compute filtered & sorted list
  const filteredMedicines = useMemo(() => {
    if (!allMedicines.length) return [];
    
    let result = allMedicines;

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase().trim();
      const searchWords = lowerTerm.split(/\s+/).filter(w => w.length > 1);

      result = result.filter(med => {
        const lowerName = med.name.toLowerCase();
        const lowerDesc = med.medicine_desc.toLowerCase();
        const lowerManuf = med.manufacturer_name.toLowerCase();
        
        // 1. Exact phrase match (Crucial for symptom searches like "muscle growth" or "stomach ache")
        // This ensures the words actually appear together in context, rather than randomly spread across a paragraph.
        if (lowerDesc.includes(lowerTerm)) return true;
        if (lowerName.includes(lowerTerm)) return true;
        if (lowerManuf.includes(lowerTerm)) return true;

        // 2. Disjointed multi-word match (Good for names like "Cipro 500")
        // We ONLY allow disjointed matching in the Name and Manufacturer. 
        // We DO NOT allow it in the description, otherwise "muscle" and "growth" sentences apart triggers a false positive.
        if (searchWords.length > 1) {
          if (searchWords.every(word => lowerName.includes(word) || lowerManuf.includes(word))) {
            return true;
          }
        }
        
        return false;
      });
    }

    if (priceSort === "asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (priceSort === "desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    }

    return result;
  }, [allMedicines, searchTerm, priceSort]);

  // Pagination slice
  const displayedMedicines = filteredMedicines.slice(0, displayLimit);

  const handleLoadMore = () => {
    setDisplayLimit(prev => prev + 50);
  };

  useEffect(() => {
    setDisplayLimit(50);
  }, [searchTerm, priceSort]);

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col font-sans text-[#14332F] overflow-hidden relative pt-16">
      
      <header className="px-6 md:px-8 py-6 border-b border-[#E8E2D5] bg-white/80 backdrop-blur-md relative z-20 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/dashboard/patient")}
              className="p-2 rounded-full bg-[#FAF7F0] border border-[#E8E2D5] hover:bg-[#EBF3EE] transition-colors text-[#5E6E69] hover:text-[#14332F]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#14332F]">
                Verified Drug & <span className="font-serif-accent font-normal italic text-[#2A6A5E]">Medicine Directory</span>
              </h1>
              <p className="text-sm text-[#5E6E69] mt-1">
                Search verified generic formulations, safety indications, and pricing ({allMedicines.length.toLocaleString()} active items).
              </p>
            </div>
          </div>
          
          {/* Background Loading Progress */}
          {bgLoadProgress < 100 && bgLoadProgress > 0 && !bgLoadError && (
            <div className="flex items-center gap-3 bg-[#EBF3EE] border border-[#2A6A5E]/20 px-4 py-2 rounded-full shadow-sm">
              <Loader2 className="w-4 h-4 text-[#2A6A5E] animate-spin" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-[#14332F]">Indexing Database... {bgLoadProgress}%</span>
                <div className="w-32 h-1 bg-[#E8E2D5] rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-[#2A6A5E] transition-all duration-300" style={{ width: `${bgLoadProgress}%` }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 md:p-8 relative z-10 flex flex-col">
        
        {bgLoadError && (
          <div className="mb-6 p-4 rounded-2xl border border-rose-200 bg-rose-50 flex items-start gap-3">
            <CloudOff className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <p className="text-sm text-rose-800">{bgLoadError}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mb-10 shrink-0">
          <div className="relative bg-white rounded-full border border-[#E8E2D5] shadow-sm overflow-hidden flex-1 focus-within:border-[#14332F] transition-colors">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#2A6A5E]" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-3.5 bg-transparent border-0 focus:outline-none text-[#14332F] placeholder-[#5E6E69] text-base"
              placeholder="Search by medicine name, symptom, or manufacturer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => setPriceSort(prev => prev === "none" ? "asc" : prev === "asc" ? "desc" : "none")}
              className={`bg-white rounded-full border border-[#E8E2D5] shadow-sm flex items-center justify-center px-5 py-3 shrink-0 text-xs font-semibold transition-colors ${priceSort !== "none" ? "bg-[#EBF3EE] text-[#14332F] border-[#2A6A5E]" : "text-[#5E6E69] hover:text-[#14332F]"}`}
            >
              {priceSort === "desc" ? <ArrowUpAZ className="w-4 h-4 mr-2 text-[#2A6A5E]" /> : <ArrowDownAZ className="w-4 h-4 mr-2 text-[#2A6A5E]" />}
              {priceSort === "none" ? "Sort by Price" : priceSort === "asc" ? "Price: Low to High" : "Price: High to Low"}
            </button>
          </div>
        </div>

        {isLoadingInitial ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#2A6A5E] animate-spin mb-4" />
            <h3 className="text-lg font-bold text-[#14332F]">Loading Drug Directory...</h3>
            <p className="text-[#5E6E69] text-sm mt-1">Indexing active formulations and OpenFDA labels</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
              {displayedMedicines.map((med, index) => (
                <div key={med.id || index} className="bg-white rounded-3xl p-6 border border-[#E8E2D5] shadow-sm hover:shadow-healink hover:border-[#2A6A5E]/40 transition-all group flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-2xl bg-[#EBF3EE] flex items-center justify-center shrink-0 border border-[#2A6A5E]/20 group-hover:bg-[#14332F] transition-colors">
                          <Pill className="w-5 h-5 text-[#2A6A5E] group-hover:text-[#FAF7F0] transition-colors" />
                        </div>
                        <div className="min-w-0">
                          <h2 className="text-lg font-bold text-[#14332F] truncate group-hover:text-[#2A6A5E] transition-colors">{med.name}</h2>
                          <p className="text-xs text-[#5E6E69] truncate">{med.manufacturer_name || 'Generic Formulation'}</p>
                        </div>
                      </div>
                      {med.price > 0 && (
                        <span className="px-3 py-1 rounded-full bg-[#EBF3EE] border border-[#2A6A5E]/20 text-[#14332F] text-xs font-bold shrink-0 ml-4">
                          ₹{med.price.toFixed(2)}
                        </span>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FAF7F0] border border-[#E8E2D5] text-[11px] font-semibold text-[#5E6E69] mb-2 capitalize">
                        {med.type || 'Standard Drug'}
                      </span>
                      <p className="text-xs text-[#5E6E69] leading-relaxed line-clamp-3" title={med.medicine_desc}>
                        {med.medicine_desc || 'No description available for this medicine.'}
                      </p>
                    </div>
                  </div>

                  {med.side_effects && (
                    <div className="mt-4 pt-3 border-t border-[#FAF7F0]">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-[10px] text-[#5E6E69] uppercase font-bold tracking-wider block">Reported Side Effects</span>
                          <p className="text-xs text-[#14332F] line-clamp-2" title={med.side_effects}>{med.side_effects}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {filteredMedicines.length === 0 && (
                <div className="col-span-1 lg:col-span-2 py-20 flex flex-col items-center justify-center text-center">
                  <Pill className="w-12 h-12 text-[#E8E2D5] mb-3" />
                  <h3 className="text-lg font-bold text-[#14332F]">No matching medicines found</h3>
                  <p className="text-[#5E6E69] text-xs mt-1">Try adjusting search terms or verify the spelling.</p>
                </div>
              )}
            </div>

            {filteredMedicines.length > displayLimit && (
              <div className="flex justify-center pb-16">
                <button 
                  onClick={handleLoadMore}
                  className="px-6 py-2.5 bg-[#14332F] hover:bg-[#1A3D3A] text-[#FAF7F0] rounded-full text-xs font-semibold transition-all shadow-md"
                >
                  Load More Results ({filteredMedicines.length - displayLimit} remaining)
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

