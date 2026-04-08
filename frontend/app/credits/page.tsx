"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

interface Project {
  id: number;
  location_name: string;
  recovered_tons: number;
  photo_url: string;
  conducted_at: string;
}

interface ProjectsResponse {
  projects: Project[];
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function CreditsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects`);
      if (!res.ok) {
        throw new Error(`プロジェクトデータの取得に失敗しました（${res.status}）`);
      }
      const data: ProjectsResponse = await res.json();
      setProjects(data.projects);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "プロジェクトデータの取得に失敗しました。"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-6">
          プラスチッククレジット ポータル
        </h1>

        {/* Business model explanation */}
        <div className="rounded-lg bg-blue-50 border border-blue-200 p-5 mb-8">
          <h2 className="text-lg font-semibold text-blue-800 mb-2">
            🌊 プラスチッククレジットとは？
          </h2>
          <p className="text-sm text-blue-700 leading-relaxed">
            プラスチッククレジットは、海洋から回収されたプラスチック量に基づいて発行される環境クレジットです。
            企業はクレジットを購入することで、自社のプラスチックフットプリントをオフセットし、
            ESG目標の達成に貢献できます。各回収プロジェクトの実績は透明性をもって公開され、
            信頼性の高い環境投資を実現します。
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <p className="text-center text-gray-500 py-12" role="status">
            プロジェクトを読み込んでいます...
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
              onClick={fetchProjects}
              className="mt-2 rounded-md bg-red-600 px-4 py-2 text-white text-sm hover:bg-red-700 transition-colors min-w-[44px] min-h-[44px]"
            >
              再読み込み
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && projects.length === 0 && (
          <p className="text-center text-gray-500 py-12">
            現在、回収プロジェクトはありません。
          </p>
        )}

        {/* Project cards */}
        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/credits/${project.id}`}
                className="block rounded-lg bg-white shadow hover:shadow-md transition-shadow min-h-[44px]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={project.photo_url}
                  alt={`${project.location_name}の回収プロジェクト写真`}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {project.location_name}
                  </h3>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                      {project.recovered_tons} トン回収
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(project.conducted_at)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
