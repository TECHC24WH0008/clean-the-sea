"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";

export interface Hotspot {
  id: number;
  latitude: number;
  longitude: number;
  density: "low" | "medium" | "high";
  reported_at: string;
}

interface HotspotMapProps {
  hotspots: Hotspot[];
}

const DENSITY_COLOR: Record<string, string> = {
  low: "#22c55e",
  medium: "#f97316",
  high: "#ef4444",
};

const DENSITY_RADIUS: Record<string, number> = {
  low: 6,
  medium: 10,
  high: 16,
};

const DENSITY_LABEL_JA: Record<string, string> = {
  low: "低",
  medium: "中",
  high: "高",
};

export default function HotspotMap({ hotspots }: HotspotMapProps) {
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    setMapReady(true);
  }, []);

  if (!mapReady) {
    return (
      <div className="w-full h-[500px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">地図を読み込み中...</p>
      </div>
    );
  }

  return <LeafletMap hotspots={hotspots} />;
}

function LeafletMap({ hotspots }: HotspotMapProps) {
  const [components, setComponents] = useState<{
    MapContainer: typeof import("react-leaflet").MapContainer;
    TileLayer: typeof import("react-leaflet").TileLayer;
    CircleMarker: typeof import("react-leaflet").CircleMarker;
    Popup: typeof import("react-leaflet").Popup;
  } | null>(null);

  useEffect(() => {
    // Dynamic import to avoid SSR issues
    import("react-leaflet").then((mod) => {
      setComponents({
        MapContainer: mod.MapContainer,
        TileLayer: mod.TileLayer,
        CircleMarker: mod.CircleMarker,
        Popup: mod.Popup,
      });
    });
  }, []);

  if (!components) {
    return (
      <div className="w-full h-[500px] rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">地図を読み込み中...</p>
      </div>
    );
  }

  const { MapContainer, TileLayer, CircleMarker, Popup } = components;

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden" aria-label="海洋プラスチックホットスポットマップ">
      <MapContainer
        center={[35, 135]}
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hotspots.map((h) => (
          <CircleMarker
            key={h.id}
            center={[h.latitude, h.longitude]}
            radius={DENSITY_RADIUS[h.density] ?? 6}
            pathOptions={{
              color: "#fff",
              weight: 1,
              fillColor: DENSITY_COLOR[h.density] ?? "#22c55e",
              fillOpacity: 0.8,
            }}
          >
            <Popup>
              <div style={{ fontSize: "14px", lineHeight: 1.6 }}>
                <strong>密度レベル:</strong> {DENSITY_LABEL_JA[h.density]}<br />
                <strong>緯度:</strong> {h.latitude.toFixed(4)}<br />
                <strong>経度:</strong> {h.longitude.toFixed(4)}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}
