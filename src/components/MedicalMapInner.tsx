"use client";

import React, { useEffect } from "react";
import { Map, MapMarker, MarkerContent, MarkerPopup, MapControls, useMap } from "@/components/ui/map";
import type { LocationData } from "@/app/pharmacies/map/page";

interface MedicalMapInnerProps {
  locations: LocationData[];
  center: [number, number]; // [lat, lon] from parent
  zoom: number;
  markerPos: [number, number] | null; // [lat, lon] from parent
}

// Subcomponent to animate flyTo when center or zoom changes
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const { map } = useMap();
  useEffect(() => {
    if (!map) return;
    map.flyTo({
      center: [center[1], center[0]], // convert [lat, lon] to [lon, lat]
      zoom: zoom,
      duration: 1200,
    });
  }, [center, zoom, map]);
  return null;
}

const OPENFREEMAP_STYLES = {
  light: "https://tiles.openfreemap.org/styles/liberty",
  dark: "https://tiles.openfreemap.org/styles/bright",
};

export default function MedicalMapInner({ locations, center, zoom, markerPos }: MedicalMapInnerProps) {
  const getIconEmoji = (type: string) => {
    const iconMap: Record<string, string> = {
      hospital: "🏥",
      clinic: "⚕️",
      pharmacy: "💊",
    };
    return iconMap[type.toLowerCase()] || "🏥";
  };

  return (
    <div className="w-full h-full relative">
      <Map
        viewport={{
          center: [center[1], center[0]], // [lon, lat] for MapLibre
          zoom: zoom,
          bearing: 0,
          pitch: 0,
        }}
        styles={OPENFREEMAP_STYLES}
        className="w-full h-full rounded-3xl overflow-hidden bg-[#FAF7F0]"
      >
        <MapController center={center} zoom={zoom} />
        <MapControls position="bottom-right" showZoom showLocate />

        {/* Search Center / Target Marker */}
        {markerPos && (
          <MapMarker longitude={markerPos[1]} latitude={markerPos[0]}>
            <MarkerContent>
              <div className="relative flex items-center justify-center">
                <div className="w-5 h-5 rounded-full bg-[#2A6A5E] border-2 border-white shadow-md ring-4 ring-[#2A6A5E]/25" />
              </div>
            </MarkerContent>
            <MarkerPopup closeButton>
              <div className="text-xs font-bold text-[#14332F]">Search Center</div>
            </MarkerPopup>
          </MapMarker>
        )}

        {/* Facility Markers */}
        {locations.map((loc) => {
          if (loc.lat === undefined || loc.lon === undefined) return null;
          const emoji = getIconEmoji(loc.type);
          return (
            <MapMarker key={loc.id} longitude={loc.lon} latitude={loc.lat}>
              <MarkerContent>
                <div 
                  className="w-8 h-8 rounded-full bg-[#14332F] hover:bg-[#1A3D3A] text-white border-2 border-white shadow-md flex items-center justify-center text-sm transition-transform hover:scale-110"
                  title={loc.name}
                >
                  <span>{emoji}</span>
                </div>
              </MarkerContent>
              <MarkerPopup closeButton>
                <div className="w-52">
                  <h3 className="font-bold text-sm text-[#14332F] mb-1 line-clamp-1">{loc.name}</h3>
                  <p className="text-xs text-[#5E6E69] leading-tight mb-2 line-clamp-2" title={loc.address}>{loc.address}</p>
                  {loc.distance && (
                    <span className="text-[11px] font-semibold text-[#2A6A5E] bg-[#EBF3EE] px-2.5 py-0.5 rounded-full mb-2.5 inline-block">
                      ~{(loc.distance / 1000).toFixed(1)} km away
                    </span>
                  )}
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lon}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[11px] bg-[#14332F] hover:bg-[#1A3D3A] text-[#FAF7F0] py-1.5 px-3 rounded-full block text-center font-semibold transition-colors shadow-sm"
                  >
                    Directions
                  </a>
                </div>
              </MarkerPopup>
            </MapMarker>
          );
        })}
      </Map>
    </div>
  );
}
