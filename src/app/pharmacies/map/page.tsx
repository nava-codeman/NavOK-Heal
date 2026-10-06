"use client";

import React, { useState } from "react";
import MedicalMap from "@/components/MedicalMap";
import { Search, MapPin, Stethoscope, Store, ChevronLeft, Navigation, Map as MapIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useFacilitySearch } from "@/hooks/useFacilitySearch";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export interface LocationData {
  id: string;
  lat: number;
  lon: number;
  name: string;
  type: string;
  address: string;
  distance?: number;
}

export default function MedicalMapPage() {
  const router = useRouter();
  const [searchInput, setSearchInput] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [searchType, setSearchType] = useState("pharmacy");
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number, lon: number } | null>(null);
  
  // Map state
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.2090]);
  const [mapZoom, setMapZoom] = useState(13);
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(null);

  // Hook for data fetching independently of map
  useFacilitySearch({
    searchQuery: activeQuery,
    searchType,
    coordinates: userCoords,
    onLocationsFound: setLocations,
    onLoading: setIsLoading,
    onError: setErrorMsg,
    onInfo: setInfoMsg,
    onCenterChange: setMapCenter,
    onZoomChange: setMapZoom,
    onMarkerPosChange: setMarkerPos,
  });

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg("Geolocation is not supported by your browser.");
      return;
    }
    
    setIsLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);
    setSearchInput("");
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude
        };
        setUserCoords(coords);
        setActiveQuery("CURRENT_LOCATION");
      },
      (error) => {
        setIsLoading(false);
        setErrorMsg("Location access denied. Please use the manual search.");
      }
    );
  };

  // Detect "near me" / "nearby" phrases in search input
  const isNearMeQuery = (text: string): boolean => {
    const lower = text.toLowerCase().trim();
    const nearMePatterns = [
      "near me",
      "nearby",
      "close to me",
      "around me",
      "my location",
      "my area",
      "closest",
      "nearest",
    ];
    return nearMePatterns.some(pattern => lower.includes(pattern));
  };

  // Try to extract a facility type from the "near me" query (e.g. "clinic near me" → clinic)
  const extractTypeFromQuery = (text: string): string | null => {
    const lower = text.toLowerCase();
    if (lower.includes("hospital")) return "hospital";
    if (lower.includes("clinic")) return "clinic";
    if (lower.includes("pharmacy") || lower.includes("chemist") || lower.includes("drugstore") || lower.includes("medical store")) return "pharmacy";
    return null;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    
    // If the user typed a "near me" phrase, use GPS geolocation
    if (isNearMeQuery(searchInput)) {
      const detectedType = extractTypeFromQuery(searchInput);
      if (detectedType) {
        setSearchType(detectedType);
      }
      handleUseCurrentLocation();
      return;
    }
    
    // Otherwise, do the standard Nominatim geocode search
    setUserCoords(null);
    setInfoMsg(null);
    setActiveQuery(searchInput.trim());
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col relative overflow-hidden font-sans text-[#14332F] pt-16">
      
      {/* Header */}
      <header className="px-6 md:px-8 py-5 border-b border-[#E8E2D5] bg-white/80 backdrop-blur-md relative z-20 shrink-0">
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
                Verified Facility & <span className="font-serif-accent font-normal italic text-[#2A6A5E]">Pharmacy Map</span>
              </h1>
              <p className="text-sm text-[#5E6E69] mt-1">Locate nearby licensed pharmacies, clinics, and emergency centers.</p>
            </div>
          </div>
          
          <div className="flex bg-[#FAF7F0] p-1.5 rounded-full border border-[#E8E2D5] self-start md:self-auto shadow-sm">
            <button 
              onClick={() => setSearchType("pharmacy")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                searchType === "pharmacy" ? "bg-[#14332F] text-[#FAF7F0] shadow-sm" : "text-[#5E6E69] hover:text-[#14332F]"
              }`}
            >
              <Store className="w-3.5 h-3.5" /> Pharmacy
            </button>
            <button 
              onClick={() => setSearchType("clinic")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                searchType === "clinic" ? "bg-[#14332F] text-[#FAF7F0] shadow-sm" : "text-[#5E6E69] hover:text-[#14332F]"
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" /> Clinic
            </button>
            <button 
              onClick={() => setSearchType("hospital")}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                searchType === "hospital" ? "bg-[#14332F] text-[#FAF7F0] shadow-sm" : "text-[#5E6E69] hover:text-[#14332F]"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" /> Hospital
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 md:p-6 lg:p-8 gap-6 relative z-10 overflow-hidden">
        
        {/* Left Column: Search & List */}
        <div className="flex flex-col w-full lg:w-[400px] gap-6 shrink-0 h-[400px] lg:h-auto">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative bg-white rounded-full border border-[#E8E2D5] shadow-sm overflow-hidden shrink-0 focus-within:border-[#14332F] transition-colors">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-[#2A6A5E]" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-32 py-3.5 bg-transparent border-0 focus:outline-none text-[#14332F] placeholder-[#5E6E69] text-sm"
              placeholder="Search city, area, or type 'near me'..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <div className="absolute inset-y-1.5 right-1.5 flex gap-1.5">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                title="Use My Location"
                className="p-2 bg-[#FAF7F0] hover:bg-[#EBF3EE] text-[#14332F] rounded-full transition-colors flex items-center justify-center border border-[#E8E2D5]"
              >
                <Navigation className="w-4 h-4 text-[#2A6A5E]" />
              </button>
              <button 
                type="submit"
                className="px-4 bg-[#14332F] hover:bg-[#1A3D3A] text-[#FAF7F0] font-semibold rounded-full transition-colors text-xs"
              >
                Search
              </button>
            </div>
          </form>

          {/* Current Location Indicator */}
          {userCoords && !errorMsg && (
            <div className="bg-[#EBF3EE] border border-[#2A6A5E]/20 p-3 rounded-2xl text-xs text-[#14332F] flex items-center gap-2 shrink-0 font-medium">
              <MapPin className="w-4 h-4 text-[#2A6A5E] shrink-0" />
              <p>📍 Showing facilities around your current location.</p>
            </div>
          )}

          {/* Info Message */}
          {infoMsg && !errorMsg && (
            <div className="bg-[#EBF3EE] border border-[#2A6A5E]/20 p-3 rounded-2xl text-xs text-[#14332F] flex items-center gap-2 shrink-0 font-medium">
              <MapIcon className="w-4 h-4 text-[#2A6A5E] shrink-0" />
              <p>{infoMsg}</p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-2xl text-xs text-rose-800 flex items-start gap-2.5 shrink-0">
              <MapIcon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          {/* Results List */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 pb-20 lg:pb-0">
            {isLoading && (
              <div className="flex flex-col items-center justify-center p-8 h-full bg-white rounded-3xl border border-[#E8E2D5]">
                <div className="w-8 h-8 border-3 border-[#2A6A5E] border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-[#5E6E69] text-xs animate-pulse font-medium">Querying verified health facilities...</p>
              </div>
            )}

            {!isLoading && locations.length === 0 && activeQuery && !errorMsg && (
              <div className="text-center p-8 bg-white rounded-3xl border border-[#E8E2D5]">
                <MapPin className="w-8 h-8 text-[#E8E2D5] mx-auto mb-2" />
                <p className="text-[#5E6E69] text-xs">
                  No {searchType === "pharmacy" ? "pharmacies" : `${searchType}s`} found nearby in OpenStreetMap for this search area.
                </p>
              </div>
            )}

            {!isLoading && !activeQuery && locations.length === 0 && (
              <div className="text-center p-8 bg-white rounded-3xl border border-[#E8E2D5]">
                <Navigation className="w-8 h-8 text-[#2A6A5E] mx-auto mb-2" />
                <p className="text-[#14332F] text-sm font-semibold">Enter a location or use GPS</p>
                <p className="text-[#5E6E69] text-xs mt-1">Locate active dispensaries, clinics, and emergency centers.</p>
              </div>
            )}

            {!isLoading && locations.map(loc => (
              <div key={loc.id} className="bg-white p-4 rounded-2xl border border-[#E8E2D5] shadow-sm hover:border-[#2A6A5E]/40 transition-colors group">
                <h3 className="font-bold text-[#14332F] text-sm mb-1 truncate">{loc.name}</h3>
                <p className="text-xs text-[#5E6E69] line-clamp-2 mb-3">{loc.address}</p>
                <div className="flex items-center justify-between mt-auto">
                  {loc.distance && (
                    <span className="text-[11px] font-semibold text-[#2A6A5E] bg-[#EBF3EE] px-2.5 py-0.5 rounded-full">
                      ~{(loc.distance / 1000).toFixed(1)} km away
                    </span>
                  )}
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${loc.lat},${loc.lon}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[11px] bg-[#FAF7F0] hover:bg-[#EBF3EE] text-[#14332F] px-3 py-1.5 rounded-full font-semibold transition-colors border border-[#E8E2D5]"
                  >
                    Directions
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Map Container */}
        <div className="flex-1 h-[400px] lg:h-auto min-h-[400px] rounded-3xl overflow-hidden shadow-healink border border-[#E8E2D5] relative group">
          <ErrorBoundary 
            fallbackMessage="Map view unavailable — showing results as a list"
          >
            <MedicalMap 
              locations={locations}
              center={mapCenter}
              zoom={mapZoom}
              markerPos={markerPos}
            />
          </ErrorBoundary>
        </div>
      </main>
    </div>
  );
}
