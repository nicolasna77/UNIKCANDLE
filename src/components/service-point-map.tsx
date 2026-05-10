"use client";

import { useEffect } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { ServicePoint } from "@/lib/sendcloud";

function pinIcon(color: string) {
  return L.divIcon({
    className: "",
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="32" viewBox="0 0 24 32">
      <path fill="${color}" stroke="white" stroke-width="1.5" d="M12 0C7.58 0 4 3.58 4 8c0 1.9.65 3.64 1.73 5.03L12 32l6.27-18.97A7.96 7.96 0 0 0 20 8c0-4.42-3.58-8-8-8z"/>
      <circle cx="12" cy="8" r="3.5" fill="white"/>
    </svg>`,
    iconSize: [24, 32],
    iconAnchor: [12, 32],
    popupAnchor: [0, -34],
  });
}

const ICON_DEFAULT = pinIcon("#9ca3af");
const ICON_HIGHLIGHT = pinIcon("#8a6243");

function FitBounds({ points }: { points: ServicePoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const bounds = L.latLngBounds(
      points.map((p) => [parseFloat(p.latitude), parseFloat(p.longitude)])
    );
    map.fitBounds(bounds, { padding: [32, 32], maxZoom: 14 });
  }, [map, points]);
  return null;
}

interface ServicePointMapProps {
  points: ServicePoint[];
  highlightedId: number | null;
  onSelect: (point: ServicePoint) => void;
}

export function ServicePointMap({ points, highlightedId, onSelect }: ServicePointMapProps) {
  if (!points.length) return null;

  const center: [number, number] = [
    parseFloat(points[0].latitude),
    parseFloat(points[0].longitude),
  ];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "288px", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />
      {points.map((point) => (
        <Marker
          key={point.id}
          position={[parseFloat(point.latitude), parseFloat(point.longitude)]}
          icon={point.id === highlightedId ? ICON_HIGHLIGHT : ICON_DEFAULT}
          eventHandlers={{ click: () => onSelect(point) }}
        >
          <Popup>
            <div className="text-sm min-w-[160px]">
              <p className="font-semibold leading-tight">{point.name}</p>
              <p className="text-muted-foreground text-xs mt-0.5">
                {point.street} {point.house_number}
              </p>
              <p className="text-muted-foreground text-xs">
                {point.postal_code} {point.city}
              </p>
              {point.distance != null && (
                <p className="text-xs text-muted-foreground mt-1">
                  {(point.distance / 1000).toFixed(1)}&nbsp;km
                </p>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
