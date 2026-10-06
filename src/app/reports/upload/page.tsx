"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Upload, FileText, CheckCircle2, Activity, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadReportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "analyzing" | "complete">("idle");
  const [progress, setProgress] = useState(0);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (selectedFile: File) => {
    setFile(selectedFile);
    setUploadState("uploading");
    
    // Simulate upload and analysis process
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      
      if (currentProgress === 50) {
        setUploadState("analyzing");
      }
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setUploadState("complete");
      }
    }, 200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadState("idle");
    setProgress(0);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col font-sans text-[#14332F] overflow-hidden relative">
      {/* Background abstract elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="px-6 md:px-8 py-5 border-b border-white/5 bg-black/20 backdrop-blur-md relative z-20 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button 
            onClick={() => router.push("/dashboard/patient")}
            className="p-2 rounded-full glass hover:bg-white/10 transition-colors text-zinc-300"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">Upload Medical Report</h1>
            <p className="text-sm text-zinc-400 mt-1">Instant AI analysis of your lab results, PDFs, or images.</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full p-6 md:p-8 relative z-10">
        
        <AnimatePresence mode="wait">
          {uploadState === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex items-center justify-center"
            >
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full max-w-2xl aspect-video rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-8 text-center cursor-pointer ${
                  isDragging ? "border-emerald-400 bg-emerald-500/10 scale-[1.02]" : "border-white/20 hover:border-white/40 glass bg-black/20"
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors ${
                  isDragging ? "bg-emerald-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.3)]" : "bg-white/10 text-zinc-400"
                }`}>
                  <Upload className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-white">Drag & drop your report here</h3>
                <p className="text-zinc-400 max-w-sm mx-auto mb-8">
                  Supported formats: PDF, JPG, PNG, DICOM. Max file size: 50MB.
                </p>
                <button className="px-8 py-3.5 bg-zinc-100 text-zinc-900 hover:bg-white font-semibold rounded-xl transition-colors">
                  Browse Files
                </button>
                <input 
                  type="file" 
                  className="hidden" 
                  ref={fileInputRef} 
                  accept=".pdf,.jpg,.jpeg,.png" 
                  onChange={handleFileChange}
                />
              </div>
            </motion.div>
          )}

          {(uploadState === "uploading" || uploadState === "analyzing") && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex-1 flex items-center justify-center"
            >
              <div className="w-full max-w-xl glass rounded-3xl p-10 flex flex-col items-center text-center shadow-2xl border border-white/10 bg-black/40">
                <div className="relative mb-8">
                  <div className="w-24 h-24 rounded-full border-4 border-white/5 flex items-center justify-center">
                    {uploadState === "analyzing" ? (
                      <Activity className="w-10 h-10 text-emerald-400 animate-pulse" />
                    ) : (
                      <FileText className="w-10 h-10 text-blue-400" />
                    )}
                  </div>
                  <svg className="absolute top-0 left-0 w-24 h-24 -rotate-90">
                    <circle 
                      cx="48" cy="48" r="46" 
                      fill="transparent" 
                      stroke={uploadState === "analyzing" ? "#10b981" : "#3b82f6"}
                      strokeWidth="4" 
                      strokeDasharray={289}
                      strokeDashoffset={289 - (289 * progress) / 100}
                      className="transition-all duration-300 ease-out"
                    />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold mb-2">
                  {uploadState === "uploading" ? "Uploading Report..." : "AI Analyzing Results..."}
                </h3>
                <p className="text-zinc-400 mb-8">{file?.name}</p>
                
                <div className="w-full bg-white/10 rounded-full h-2 mb-2 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${uploadState === "analyzing" ? "bg-emerald-500" : "bg-blue-500"}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="w-full flex justify-between text-xs text-zinc-500 font-mono">
                  <span>{progress}%</span>
                  <span>{uploadState === "analyzing" ? "Processing Data" : "Transferring"}</span>
                </div>
              </div>
            </motion.div>
          )}

          {uploadState === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full space-y-6 pb-20"
            >
              <div className="glass rounded-3xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-emerald-500/5 border border-emerald-500/20">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Analysis Complete</h2>
                    <p className="text-emerald-400/80">{file?.name}</p>
                  </div>
                </div>
                <button 
                  onClick={resetUpload}
                  className="px-6 py-2.5 rounded-xl border border-white/20 hover:bg-white/10 transition-colors flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" /> Upload Another
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  <div className="glass rounded-3xl p-8 border border-white/10">
                    <h3 className="text-xl font-semibold mb-6 flex items-center gap-3">
                      <Activity className="w-6 h-6 text-indigo-400" /> AI Findings Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <h4 className="font-medium text-emerald-400 mb-2">Normal Ranges Detected</h4>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                          Your CBC (Complete Blood Count) and Metabolic Panel results are within healthy normal ranges. Glucose levels are stable at 89 mg/dL.
                        </p>
                      </div>
                      <div className="p-4 rounded-2xl bg-white/5 border border-white/5">
                        <h4 className="font-medium text-amber-400 mb-2">Attention Required</h4>
                        <p className="text-sm text-zinc-300 leading-relaxed">
                          Vitamin D levels are slightly below optimal (22 ng/mL). Consider increasing sun exposure or discussing supplementation with your primary care physician.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="glass rounded-3xl p-6 border border-white/10 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center mb-4">
                      <FileText className="w-8 h-8 text-indigo-400" />
                    </div>
                    <h4 className="font-semibold mb-2">Full Extracted Report</h4>
                    <p className="text-xs text-zinc-400 mb-6">View the raw data extracted from your upload.</p>
                    <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-medium">
                      View Raw Data
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
