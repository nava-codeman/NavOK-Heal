"use client";

import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface DataPoint {
  day: string;
  sessions: number;
}

interface AnalyticsChartProps {
  data: DataPoint[];
}

export default function AnalyticsChart({ data }: AnalyticsChartProps) {
  return (
    <div className="w-full h-72 bg-[#121214]/20 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 shadow-xl relative">
      <div className="mb-4">
        <h4 className="text-sm font-semibold tracking-wide text-white">Consultation Core Traffic Volume</h4>
        <p className="text-xs text-zinc-500 font-mono">Real-time aggregate streaming engine data logs</p>
      </div>

      <div className="w-full h-52">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="premiumChartGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272A/40" vertical={false} />
            <XAxis dataKey="day" stroke="#52525B" fontSize={10} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="#52525B" fontSize={10} tickLine={false} axisLine={false} dx={0} />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-[#121214]/90 backdrop-blur-xl border border-zinc-800 p-3 rounded-xl shadow-2xl font-mono text-xs">
                      <p className="text-zinc-400 mb-1">{payload[0].payload.day}</p>
                      <p className="text-white font-bold">
                        Sessions: <span className="text-indigo-400">{payload[0].value}</span>
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area 
              type="monotone" 
              dataKey="sessions" 
              stroke="url(#premiumChartGlow)" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#premiumChartGlow)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
