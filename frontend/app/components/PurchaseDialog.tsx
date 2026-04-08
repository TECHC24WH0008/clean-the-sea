"use client";

import { useEffect, useRef } from "react";

interface PurchaseDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName: string;
  tons: number;
}

export default function PurchaseDialog({
  open,
  onClose,
  onConfirm,
  projectName,
  tons,
}: PurchaseDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Trap focus and handle Escape key
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Prevent background scroll
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  // Focus the dialog when opened
  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      role="presentation"
    >
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-dialog-title"
        tabIndex={-1}
        className="relative z-10 w-full max-w-md mx-4 rounded-lg bg-white shadow-xl"
      >
        <div className="p-6">
          <h2
            id="purchase-dialog-title"
            className="text-lg font-bold text-gray-900 mb-4"
          >
            クレジット購入の確認
          </h2>

          <div className="rounded-lg bg-green-50 border border-green-200 p-4 mb-4">
            <p className="text-sm text-green-700 mb-1">対象プロジェクト</p>
            <p className="font-semibold text-green-900">{projectName}</p>
            <p className="text-sm text-green-700 mt-2">
              回収量: <span className="font-bold">{tons} トン</span>
            </p>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            このプロジェクトのプラスチッククレジットを購入（オフセット）します。
            よろしいですか？
          </p>

          <p className="text-xs text-gray-400 mb-6">
            ※ これはモック機能です。実際の決済処理は行われません。
          </p>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors min-h-[44px] min-w-[44px]"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors min-h-[44px] min-w-[44px]"
            >
              購入を確定する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
