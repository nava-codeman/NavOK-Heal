"use client";

import dynamic from 'next/dynamic';
import React from 'react';
import type { LocationData } from '@/app/pharmacies/map/page';

interface MedicalMapProps {
  locations: LocationData[];
  center: [number, number];
  zoom: number;
  markerPos: [number, number] | null;
}

const MedicalMapInner = dynamic(() => import('./MedicalMapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-[#FAF7F0] rounded-3xl border border-[#E8E2D5] shadow-sm">
      <div className="w-10 h-10 border-3 border-[#2A6A5E] border-t-transparent rounded-full animate-spin"></div>
    </div>
  ),
});

export default function MedicalMap(props: MedicalMapProps) {
  return <MedicalMapInner {...props} />;
}
