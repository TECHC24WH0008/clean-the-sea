"use client";

import HotspotMap from "../components/HotspotMap";
import { useHotspots } from "../hooks/useHotspots";

export default function DashboardPage() {
  const { hotspots, loading, error, refetch } = useHotspots();

  const densityCounts = {
    high: hotspots.filter((h) => h.density === "high").length,
    medium: hotspots.filter((h) => h.density === "medium").length,
    low: hotspots.filter((h) => h.density === "low").length,
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        海洋プラスチック ホットスポットマップ
      </h1>

      {/* 統計サマリー */}
      {!loading && !error && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          <div className="rounded-lg bg-white shadow p-4 text-center">
            <p className="text-sm text-gray-500">総ホットスポット</p>
            <p className="text-3xl font-bold text-blue-600">{hotspots.length}</p>
          </div>
          <div className="rounded-lg bg-white shadow p-4 text-center">
            <p className="text-sm text-gray-500">高密度</p>
            <p className="text-3xl font-bold text-red-500">{densityCounts.high}</p>
          </div>
          <div className="rounded-lg bg-white shadow p-4 text-center">
            <p className="text-sm text-gray-500">中密度</p>
            <p className="text-3xl font-bold text-orange-500">{densityCounts.medium}</p>
          </div>
          <div className="rounded-lg bg-white shadow p-4 text-center">
            <p className="text-sm text-gray-500">低密度</p>
            <p className="text-3xl font-bold text-green-500">{densityCounts.low}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center h-[500px] bg-gray-50 rounded-lg">
          <p className="text-gray-500">読み込み中...</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center h-[500px] bg-red-50 rounded-lg gap-4">
          <p className="text-red-600">データの取得に失敗しました: {error}</p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors min-w-[44px] min-h-[44px]"
          >
            再読み込み
          </button>
        </div>
      )}

      {!loading && !error && <HotspotMap hotspots={hotspots} />}
    </div>
  );
}
