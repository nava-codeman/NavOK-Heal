import { useEffect, useRef } from 'react';
import type { LocationData } from '@/app/pharmacies/map/page';

const CACHE_LIMIT = 20;

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

const geocodeCache = new Map<string, { lat: number; lon: number }>();
const overpassCache = new Map<string, { elements: OverpassElement[]; expandedMessage: string | null }>();

function setCache<K, V>(cache: Map<K, V>, key: K, value: V) {
  if (cache.has(key)) {
    cache.delete(key);
  } else if (cache.size >= CACHE_LIMIT) {
    const firstKey = cache.keys().next().value;
    if (firstKey !== undefined) cache.delete(firstKey);
  }
  cache.set(key, value);
}

// Haversine distance in meters
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const p1 = lat1 * Math.PI/180;
  const p2 = lat2 * Math.PI/180;
  const dp = (lat2-lat1) * Math.PI/180;
  const dl = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dp/2) * Math.sin(dp/2) + Math.cos(p1) * Math.cos(p2) * Math.sin(dl/2) * Math.sin(dl/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

interface UseFacilitySearchProps {
  searchQuery: string;
  searchType: string;
  coordinates?: { lat: number; lon: number } | null;
  onLocationsFound: (locations: LocationData[]) => void;
  onLoading: (isLoading: boolean) => void;
  onError: (msg: string | null) => void;
  onInfo?: (msg: string | null) => void;
  onCenterChange: (center: [number, number]) => void;
  onZoomChange: (zoom: number) => void;
  onMarkerPosChange: (pos: [number, number] | null) => void;
}

export function useFacilitySearch({
  searchQuery,
  searchType,
  coordinates,
  onLocationsFound,
  onLoading,
  onError,
  onInfo,
  onCenterChange,
  onZoomChange,
  onMarkerPosChange,
}: UseFacilitySearchProps) {
  const lastGeocodedCoord = useRef<{query: string, lat: number, lon: number} | null>(null);

  useEffect(() => {
    if (!coordinates && !searchQuery) return;

    let isCancelled = false;
    
    const fetchData = async () => {
      onLoading(true);
      onError(null);
      if (onInfo) onInfo(null);
      onLocationsFound([]);

      try {
        let lat = 28.6139; // Default if neither provided (New Delhi)
        let lon = 77.2090;
        let foundNewLocation = false;

        // 1. RESOLVE COORDINATES
        if (coordinates) {
          lat = coordinates.lat;
          lon = coordinates.lon;
          foundNewLocation = true;
        } else {
          const queryLower = searchQuery.toLowerCase();
          
          if (lastGeocodedCoord.current?.query.toLowerCase() === queryLower) {
            lat = lastGeocodedCoord.current.lat;
            lon = lastGeocodedCoord.current.lon;
          } else if (geocodeCache.has(queryLower)) {
            const cachedGeo = geocodeCache.get(queryLower)!;
            lat = cachedGeo.lat;
            lon = cachedGeo.lon;
            lastGeocodedCoord.current = { query: searchQuery, lat, lon };
            foundNewLocation = true;
          } else {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            
            const geocodeUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`;
            const geoRes = await fetch(geocodeUrl, {
              headers: { "User-Agent": "NavOkHeal-MedicalLocator/1.0" },
              signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            if (!geoRes.ok) throw new Error("Geocoding service unavailable.");
            const geoData = await geoRes.json();
            
            if (isCancelled) return;
            
            if (!geoData || geoData.length === 0) {
              throw new Error(`Location "${searchQuery}" not found. Please try a different city or area.`);
            }
            
            lat = parseFloat(geoData[0].lat);
            lon = parseFloat(geoData[0].lon);
            lastGeocodedCoord.current = { query: searchQuery, lat, lon };
            setCache(geocodeCache, queryLower, { lat, lon });
            foundNewLocation = true;
          }
        }

        onCenterChange([lat, lon]);
        onMarkerPosChange([lat, lon]);
        onZoomChange(13);

        // 2. OVERPASS API
        const cacheKey = `${lat.toFixed(5)},${lon.toFixed(5)},${searchType}`;
        let opData;
        let expandedMessage: string | null = null;

        if (overpassCache.has(cacheKey)) {
          const cachedOp = overpassCache.get(cacheKey)!;
          opData = { elements: cachedOp.elements };
          expandedMessage = cachedOp.expandedMessage;
        } else {
          const fetchFromOverpass = async (radius: number): Promise<{ elements: OverpassElement[] }> => {
            const endpoints = [
              'https://overpass-api.de/api/interpreter',
              'https://overpass.kumi.systems/api/interpreter',
              'https://maps.mail.ru/osm/tools/overpass/api/interpreter'
            ];
            
            const query = `
              [out:json][timeout:20];
              nwr["amenity"="${searchType}"](around:${radius},${lat},${lon});
              out center;
            `;

            let lastError = null;

            for (const endpoint of endpoints) {
              try {
                const opController = new AbortController();
                const opTimeout = setTimeout(() => opController.abort(), 20000);
                
                const res = await fetch(endpoint, {
                  method: "POST",
                  body: query,
                  signal: opController.signal
                });
                clearTimeout(opTimeout);
                
                if (!res.ok) {
                  if (res.status === 429) throw new Error("Rate limited");
                  throw new Error(`Server returned ${res.status}`);
                }

                const text = await res.text();
                if (text.trim().startsWith('<')) {
                  throw new Error("Server returned HTML instead of JSON (likely overloaded)");
                }
                
                return JSON.parse(text);
              } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : String(err);
                console.warn(`Overpass mirror ${endpoint} failed:`, errorMessage);
                lastError = err;
              }
            }
            throw lastError;
          };

          try {
            opData = await fetchFromOverpass(8000);
            
            if (!opData || !opData.elements || opData.elements.length === 0) {

              opData = await fetchFromOverpass(20000);
            }

            if (!opData || !opData.elements || opData.elements.length === 0) {

              opData = await fetchFromOverpass(50000);
              if (opData && opData.elements && opData.elements.length > 0) {
                expandedMessage = "Showing results from a wider area since none were found nearby.";
              }
            }
            
            setCache(overpassCache, cacheKey, { 
              elements: opData?.elements || [], 
              expandedMessage 
            });

          } catch (error: unknown) {
             throw new Error("Could not fetch nearby facilities. The open data servers are currently overloaded. Please try again.");
          }
        }
        
        if (isCancelled) return;
        
        if (expandedMessage && onInfo) {
          onInfo(expandedMessage);
        }

        if (opData && opData.elements && opData.elements.length > 0) {
          const newLocs = opData.elements.map((el: OverpassElement) => {
            const elLat = el.lat || el.center?.lat;
            const elLon = el.lon || el.center?.lon;
            const distance = (elLat && elLon) ? getDistance(lat, lon, elLat, elLon) : undefined;
            
            const name = el.tags?.name || `Unnamed ${searchType}`;
            const addressParts = [];
            if (el.tags?.["addr:street"]) addressParts.push(el.tags["addr:street"]);
            if (el.tags?.["addr:city"]) addressParts.push(el.tags["addr:city"]);
            const address = addressParts.length > 0 ? addressParts.join(", ") : "Address not available on OpenStreetMap";

            return {
              id: el.id.toString(),
              lat: elLat as number,
              lon: elLon as number,
              name,
              type: searchType,
              address,
              distance
            } as LocationData;
          });

          newLocs.sort((a, b) => (a.distance || 0) - (b.distance || 0));
          
          onLocationsFound(newLocs);
          
          if (foundNewLocation && newLocs.length > 0) {
            onZoomChange(14);
          }
        } else {
          onLocationsFound([]);
        }
      } catch (error: unknown) {
        console.error("Map Data Error:", error);
        if (!isCancelled) {
          if (error instanceof Error && error.name === 'AbortError') {
            onError("Request timed out. The map server is currently overloaded. Please try again.");
          } else {
            onError(error instanceof Error ? error.message : "An error occurred fetching map data.");
          }
          onLocationsFound([]);
        }
      } finally {
        if (!isCancelled) onLoading(false);
      }
    };

    fetchData();

    return () => { isCancelled = true; };
  }, [searchQuery, searchType, coordinates, onLocationsFound, onLoading, onError, onInfo, onCenterChange, onZoomChange, onMarkerPosChange]);
}
