"use client";

import { useState, type FormEvent } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

interface PointHistoryEntry {
  id: number;
  submitted_at: string;
  latitude: number;
  longitude: number;
  points_earned: number;
  has_photo: boolean;
}

interface PointsResponse {
  contributor_id: string;
  total_points: number;
  history: PointHistoryEntry[];
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function MyPage() {
  const [contributorId, setContributorId] = useState("");
  const [data, setData] = useState<PointsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = contributorId.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/contributors/${encodeURIComponent(trimmed)}/points`
      );
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(
          body?.detail ?? `データの取得に失敗しました（${res.status}）`
        );
      }
      const json: PointsResponse = await res.json();
      setData(json);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "データの取得に失敗しました。もう一度お試しください。"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">
          マイページ
        </h1>

        {/* Contributor ID input */}
        <form onSubmit={handleSubmit} className="mb-8">
          <label
            htmlFor="contributor-id"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            投稿者ID
          </label>
          <div className="flex gap-2">
            <input
              id="contributor-id"
              type="text"
              value={contributorId}
              onChange={(e) => setContributorId(e.target.value)}
              placeholder="投稿者IDを入力"
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 min-h-[44px]"
            />
            <button
              type="submit"
              disabled={loading || !contributorId.trim()}
              className="rounded-md bg-blue-600 px-6 py-2 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px]"
            >
              {loading ? "読込中..." : "表示"}
            </button>
          </div>
        </form>

        {/* Loading state */}
        {loading && (
          <p className="text-center text-gray-500" role="status">
            データを読み込んでいます...
          </p>
        )}

        {/* Error state */}
        {error && (
          <div
            className="rounded-md bg-red-50 border border-red-200 p-4 mb-6"
            role="alert"
          >
            <p className="text-red-700">{error}</p>
            <button
              onClick={handleSubmit as () => void}
              className="mt-2 rounded-md bg-red-600 px-4 py-2 text-white text-sm hover:bg-red-700 transition-colors min-w-[44px] min-h-[44px]"
            >
              再読み込み
            </button>
          </div>
        )}

        {/* Data display */}
        {data && (
          <>
            {/* Total points */}
            <div className="rounded-lg bg-white shadow p-6 mb-6 text-center">
              <p className="text-sm text-gray-500 mb-1">累計ポイント</p>
              <p className="text-5xl font-bold text-blue-600">
                {data.total_points}
              </p>
              <p className="text-sm text-gray-400 mt-1">ポイント</p>
            </div>

            {/* History */}
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              投稿履歴
            </h2>

            {data.history.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                投稿履歴がありません。
              </p>
            ) : (
              <ul className="space-y-3">
                {data.history.map((entry) => (
                  <li
                    key={entry.id}
                    className="rounded-lg bg-white shadow p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm text-gray-500">
                          {formatDate(entry.submitted_at)}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          📍 {entry.latitude.toFixed(4)},{" "}
                          {entry.longitude.toFixed(4)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {entry.has_photo && (
                          <span
                            className="text-lg"
                            title="写真付き"
                            aria-label="写真付き"
                          >
                            📷
                          </span>
                        )}
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                          +{entry.points_earned}pt
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
    </div>
  );
}
