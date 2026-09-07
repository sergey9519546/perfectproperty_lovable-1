import { useEffect } from "react";
import { APIProvider, Map as GoogleMap, AdvancedMarker, useMap } from "@vis.gl/react-google-maps";
import { motion } from "motion/react";
import { GMP_ATTRIBUTION_ID, DEFAULT_MAP_ID, getGoogleMapsApiKey, DARK_MAP_STYLE } from "@/lib/google-maps";

export interface MapParcel {
  parcel_id: string;
  lat: number;
  lng: number;
  perfect_score: number;
  ring: number;
}

interface Props {
  parcels: MapParcel[];
  center?: [number, number];
  zoom?: number;
  onSelect?: (parcel_id: string) => void;
  selectedId?: string | null;
  className?: string;
}

const RING_COLORS: Record<number, string> = {
  1: "#7fb3ff",   // listed / open — steel blue
  2: "#a48bff",   // shadow — violet
  3: "#5ecfd7",   // prophecy — cyan
};

function tierColor(score: number): string {
  if (score >= 80) return "#f5b544"; // amber — exceptional
  if (score >= 65) return "#4ad19a"; // emerald — strong
  if (score >= 50) return "#7fb3ff"; // steel — viable
  return "#5a6272";
}

function MapBoundsFitter({ parcels }: { parcels: MapParcel[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || parcels.length === 0) return;
    const bounds = new google.maps.LatLngBounds();
    parcels.forEach((p) => {
      bounds.extend({ lat: p.lat, lng: p.lng });
    });
    map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
  }, [map, parcels]);

  return null;
}

export function MapView({ parcels, center = [-98, 36], zoom = 4, onSelect, selectedId, className }: Props) {
  const apiKey = getGoogleMapsApiKey();

  return (
    <div className={className ?? "h-full w-full relative overflow-hidden"}>
      <APIProvider apiKey={apiKey} libraries={["marker", "places", "geometry"]}>
        <GoogleMap
          mapId={DEFAULT_MAP_ID}
          internalUsageAttributionIds={[GMP_ATTRIBUTION_ID]}
          defaultCenter={{ lat: center[1], lng: center[0] }}
          defaultZoom={zoom}
          gestureHandling="greedy"
          disableDefaultUI={true}
          styles={DARK_MAP_STYLE}
          style={{ width: "100%", height: "100%" }}
        >
          <MapBoundsFitter parcels={parcels} />
          {parcels.map((p) => {
            const isSelected = p.parcel_id === selectedId;
            const color = tierColor(p.perfect_score);
            const ringColor = RING_COLORS[p.ring] ?? color;

            return (
              <AdvancedMarker
                key={p.parcel_id}
                position={{ lat: p.lat, lng: p.lng }}
                onClick={() => onSelect?.(p.parcel_id)}
                title={`Score: ${p.perfect_score}`}
              >
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: isSelected ? 1.3 : 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 380, damping: 26, mass: 0.6 }}
                  className="relative flex items-center justify-center cursor-pointer hover:scale-115 transition-transform"
                  style={{
                    width: isSelected ? 30 : 22,
                    height: isSelected ? 30 : 22,
                  }}
                >
                  {isSelected && (
                    <>
                      <span
                        className="absolute -inset-3 rounded-full animate-ping opacity-60 pointer-events-none"
                        style={{ backgroundColor: color, animationDuration: '1.6s' }}
                      />
                      <span
                        className="absolute -inset-1.5 rounded-full animate-ping opacity-40 pointer-events-none"
                        style={{ backgroundColor: '#ffffff', animationDuration: '1.2s' }}
                      />
                      <span
                        className="absolute -inset-2 rounded-full animate-pulse opacity-50 pointer-events-none"
                        style={{
                          boxShadow: `0 0 16px 3px ${color}`,
                          border: `1.5px solid ${color}`,
                        }}
                      />
                    </>
                  )}
                  <div
                    className="relative flex items-center justify-center rounded-full font-mono text-[10px] font-bold text-white shadow-lg"
                    style={{
                      width: isSelected ? 26 : 20,
                      height: isSelected ? 26 : 20,
                      backgroundColor: color,
                      border: isSelected ? "2.5px solid #ffffff" : `1.5px solid ${ringColor}`,
                      boxShadow: `0 0 10px ${color}88`,
                    }}
                  >
                    {Math.round(p.perfect_score)}
                  </div>
                </motion.div>
              </AdvancedMarker>
            );
          })}
        </GoogleMap>
      </APIProvider>
    </div>
  );
}

