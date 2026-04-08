"use client";

import { useState, useEffect, useCallback } from "react";
import type { Hotspot } from "../components/HotspotMap";

interface UseHotspotsResult {
  hotspots: Hotspot[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useHotspots(): UseHotspotsResult {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHotspots = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
      const res = await fetch(`${baseUrl}/api/hotspots`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data = await res.json();
      setHotspots(data.hotspots ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "ホットスポットデータの取得に失敗しました。"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHotspots();
  }, [fetchHotspots]);

  return { hotspots, loading, error, refetch: fetchHotspots };
}
