"use client";

import ContributionForm, { type SubmissionResult } from "../components/ContributionForm";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

export default function ContributePage() {
  const handleSubmit = async (data: FormData): Promise<SubmissionResult> => {
    const res = await fetch(`${API_BASE_URL}/api/submissions`, {
      method: "POST",
      body: data,
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      const message =
        errorBody?.detail ??
        "データの送信に失敗しました。もう一度お試しください。";
      throw new Error(typeof message === "string" ? message : JSON.stringify(message));
    }

    return res.json();
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4">
      <h1 className="text-2xl font-bold text-center text-gray-900 mb-8">
        海洋ごみデータ投稿
      </h1>
      <ContributionForm onSubmit={handleSubmit} />
    </main>
  );
}
