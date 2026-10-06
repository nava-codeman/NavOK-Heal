"use client";

import React, { useRef, useState } from "react";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: LucideIcon;
  isAlert?: boolean;
}

export default function StatCard({ title, value, description, icon: Icon, isAlert = false }: StatCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Dynamic calculations tracking cursor position for targeted glass border lighting
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative overflow-hidden rounded-2xl bg-[#121214]/40 backdrop-blur-xl border border-zinc-800/80 p-6 shadow-xl transition-all duration-500"
    >
      {/* Realtime Cursor Spotlight Glow Sheet */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-500"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, rgba(99, 102, 241, 0.05), transparent 80%)`
        }}
      />

      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold tracking-wider text-zinc-500 uppercase">{title}</span>
        <div className={`p-2 rounded-xl border ${isAlert ? "bg-amber-500/5 border-amber-500/20 text-amber-400 animate-pulse" : "bg-zinc-800/60 border-zinc-700/60 text-zinc-400"}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="flex flex-col gap-1 z-10 relative">
        <h3 className="text-2xl font-bold tracking-tight text-white font-sans">{value}</h3>
        <p className="text-xs font-mono text-zinc-500">{description}</p>
      </div>
    </div>
  );
}
