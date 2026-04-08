"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import PurchaseDialog from "../../components/PurchaseDialog";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

interface ProjectDetail {
  id: number;
  location_name: string;
  recovered_tons: number;
  photo_url: string;
  conducted_at: string;
  description: string;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [purchased, setPurchased] = useState(false);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNotFound(false);
    try {
      const res = await fetch(`${API_BASE_URL}/api/projects/${projectId}`);
      if (res.status === 404) {
        setNotFound(true);
        return;
      }
      if (!res.ok) {
        throw new Error(`プロジェクトデータの取得に失敗しました（${res.status}）`);
      }
      const data: ProjectDetail = await res.json();
      setProject(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "プロジェクトデータの取得に失敗しました。"
      );
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Back link */}
        <Link
          href="/credits"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-6 min-h-[44px] min-w-[44px]"
        >
          <svg
            className="w-5 h-5 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          戻る
        </Link>

        {/* Loading state */}
        {loading && (
          <p className="text-center text-gray-500 py-12" role="status">
            プロジェクト情報を読み込んでいます...
          </p>
        )}

        {/* 404 state */}
        {!loading && notFound && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              指定されたプロジェクトが見つかりません。
            </p>
            <Link
              href="/credits"
              className="inline-block rounded-md bg-blue-600 px-6 py-3 text-white text-sm font-medium hover:bg-blue-700 transition-colors min-h-[44px]"
            >
              プロジェクト一覧に戻る
            </Link>
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div
            className="rounded-md bg-red-50 border border-red-200 p-4 mb-6"
            role="alert"
          >
            <p className="text-red-700">{error}</p>
            <button
              onClick={fetchProject}
              className="mt-2 rounded-md bg-red-600 px-4 py-2 text-white text-sm hover:bg-red-700 transition-colors min-w-[44px] min-h-[44px]"
            >
              再読み込み
            </button>
          </div>
        )}

        {/* Project detail */}
        {!loading && !error && !notFound && project && (
          <article className="rounded-lg bg-white shadow overflow-hidden">
            {/* Large photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.photo_url}
              alt={`${project.location_name}の回収プロジェクト写真`}
              className="w-full h-64 sm:h-80 md:h-96 object-cover"
            />

            <div className="p-6">
              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {project.location_name}
              </h1>

              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="rounded-lg bg-green-50 border border-green-200 p-4">
                  <p className="text-sm text-green-600 mb-1">回収量</p>
                  <p className="text-xl font-bold text-green-800">
                    {project.recovered_tons} トン
                  </p>
                </div>
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <p className="text-sm text-blue-600 mb-1">実施日</p>
                  <p className="text-xl font-bold text-blue-800">
                    {formatDate(project.conducted_at)}
                  </p>
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">
                    プロジェクト概要
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {project.description}
                  </p>
                </div>
              )}

              {/* Purchase section */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                {purchased ? (
                  <div
                    className="rounded-md bg-green-50 border border-green-200 p-4 text-center"
                    role="status"
                  >
                    <p className="text-green-800 font-semibold">
                      🎉 クレジットの購入が完了しました！
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                      ※ モック処理のため、実際の決済は行われていません。
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDialogOpen(true)}
                    className="w-full rounded-md bg-green-600 px-6 py-3 text-white text-sm font-medium hover:bg-green-700 transition-colors min-h-[44px]"
                  >
                    購入（オフセット）する
                  </button>
                )}

                {/* Business model brief note */}
                <div className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <h3 className="text-sm font-semibold text-blue-800 mb-1">
                    🌊 プラスチッククレジットについて
                  </h3>
                  <p className="text-xs text-blue-700 leading-relaxed">
                    海洋から回収されたプラスチック量に基づいて発行される環境クレジットです。
                    クレジットを購入することで、プラスチックフットプリントのオフセットとESG目標の達成に貢献できます。
                  </p>
                </div>
              </div>

              {/* Purchase confirmation dialog */}
              {project && (
                <PurchaseDialog
                  open={dialogOpen}
                  onClose={() => setDialogOpen(false)}
                  onConfirm={() => {
                    setDialogOpen(false);
                    setPurchased(true);
                  }}
                  projectName={project.location_name}
                  tons={project.recovered_tons}
                />
              )}
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
