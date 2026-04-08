"use client";

import { useState, useEffect, useRef, type ChangeEvent, type FormEvent } from "react";

export interface SubmissionResult {
  id: number;
  points_earned: number;
  total_points: number;
}

interface ContributionFormProps {
  onSubmit: (data: FormData) => Promise<SubmissionResult>;
}

type DensityLevel = "low" | "medium" | "high";

const DENSITY_OPTIONS: { value: DensityLevel; label: string }[] = [
  { value: "low", label: "低" },
  { value: "medium", label: "中" },
  { value: "high", label: "高" },
];

export default function ContributionForm({ onSubmit }: ContributionFormProps) {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [density, setDensity] = useState<DensityLevel>("medium");
  const [contributorId, setContributorId] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [geoStatus, setGeoStatus] = useState<"loading" | "success" | "error">("loading");
  const [geoError, setGeoError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Request geolocation on mount
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      setGeoError("お使いのブラウザは位置情報に対応していません。");
      setManualInput(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setGeoStatus("success");
      },
      (err) => {
        setGeoStatus("error");
        setManualInput(true);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError("位置情報の利用が許可されていません。緯度・経度を手動で入力してください。");
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGeoError("位置情報を取得できませんでした。緯度・経度を手動で入力してください。");
        } else {
          setGeoError("位置情報の取得がタイムアウトしました。緯度・経度を手動で入力してください。");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setPhotoFile(file);

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

    if (file) {
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      setPhotoPreview(null);
    }
  };

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("density", density);
    formData.append("contributor_id", contributorId);
    if (photoFile) {
      formData.append("photo", photoFile);
    }

    try {
      const res = await onSubmit(formData);
      setResult(res);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "送信に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  const isLocationEditable = manualInput || geoStatus === "error";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto">
      {/* Geolocation status */}
      {geoStatus === "loading" && (
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg p-3">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
          位置情報を取得中...
        </div>
      )}

      {geoError && (
        <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3" role="alert">
          {geoError}
        </div>
      )}

      {geoStatus === "success" && !manualInput && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
          <span>位置情報を自動取得しました。</span>
          <button
            type="button"
            onClick={() => setManualInput(true)}
            className="text-green-800 underline text-xs min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            手動で編集
          </button>
        </div>
      )}

      {/* Latitude */}
      <div>
        <label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">
          緯度
        </label>
        <input
          id="latitude"
          type="number"
          step="any"
          required
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          readOnly={!isLocationEditable}
          placeholder="-90 〜 90"
          className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            !isLocationEditable ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
        />
      </div>

      {/* Longitude */}
      <div>
        <label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">
          経度
        </label>
        <input
          id="longitude"
          type="number"
          step="any"
          required
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          readOnly={!isLocationEditable}
          placeholder="-180 〜 180"
          className={`w-full rounded-lg border border-gray-300 px-4 py-3 text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            !isLocationEditable ? "bg-gray-100 cursor-not-allowed" : ""
          }`}
        />
      </div>

      {/* Density level selector */}
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-2">
          密度レベル
        </legend>
        <div className="flex gap-3">
          {DENSITY_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={`flex-1 flex items-center justify-center rounded-lg border-2 px-4 py-3 text-base font-medium cursor-pointer transition-colors min-h-[44px] ${
                density === opt.value
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                name="density"
                value={opt.value}
                checked={density === opt.value}
                onChange={() => setDensity(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Contributor ID */}
      <div>
        <label htmlFor="contributor_id" className="block text-sm font-medium text-gray-700 mb-1">
          投稿者ID
        </label>
        <input
          id="contributor_id"
          type="text"
          required
          value={contributorId}
          onChange={(e) => setContributorId(e.target.value)}
          placeholder="あなたのIDを入力"
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Photo upload */}
      <div>
        <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-1">
          写真（任意）
        </label>
        <input
          ref={fileInputRef}
          id="photo"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handlePhotoChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-3 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:min-h-[44px] file:min-w-[44px] file:cursor-pointer"
        />
        {photoPreview && (
          <div className="mt-3 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoPreview}
              alt="アップロード写真のプレビュー"
              className="w-full max-h-64 object-contain rounded-lg border border-gray-200"
            />
            <button
              type="button"
              onClick={() => {
                setPhotoFile(null);
                if (photoPreview) URL.revokeObjectURL(photoPreview);
                setPhotoPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-red-600 min-w-[44px] min-h-[44px]"
              aria-label="写真を削除"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Submit error */}
      {submitError && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg p-3" role="alert">
          {submitError}
        </div>
      )}

      {/* Success result */}
      {result && (
        <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg p-4" role="status">
          <p className="font-medium">送信が完了しました！</p>
          <p>獲得ポイント: {result.points_earned} pt</p>
          <p>累計ポイント: {result.total_points} pt</p>
        </div>
      )}

      {/* Submit button */}
      <button
        type="submit"
        disabled={submitting || geoStatus === "loading"}
        className="w-full rounded-lg bg-blue-600 text-white font-medium px-6 py-3 text-base min-h-[44px] hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? "送信中..." : "データを投稿する"}
      </button>
    </form>
  );
}
