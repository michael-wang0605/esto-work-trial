"use client";

import { useEffect, useState } from "react";
import { X, AlertTriangle } from "lucide-react";
import type { Property } from "@/lib/types";

interface ConfirmDeleteModalProps {
  property?: Property | null;
  isOpen?: boolean;
  title?: string;
  onConfirm: ((p: Property) => void) | (() => void);
  onCancel?: () => void;
  onClose?: () => void;
}

export default function ConfirmDeleteModal({
  property,
  isOpen,
  title,
  onConfirm,
  onCancel,
  onClose,
}: ConfirmDeleteModalProps) {
  const [ack, setAck] = useState(false);

  // Reset the acknowledgment whenever a new property is selected for deletion.
  useEffect(() => {
    if (property) setAck(false);
  }, [property?.id]);

  const isModalOpen = isOpen ?? !!property;
  const displayTitle = title || property?.name || 'this property';
  
  // Close on ESC
  useEffect(() => {
    if (!isModalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleCancel();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const handleCancel = () => {
    setAck(false);
    if (onCancel) onCancel();
    if (onClose) onClose();
  };

  const handleConfirm = () => {
    if (property) {
      (onConfirm as (p: Property) => void)(property);
    } else {
      (onConfirm as () => void)();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      aria-modal="true"
      role="dialog"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleCancel}
        aria-hidden="true"
      />
      <div className="relative z-[101] w-full max-w-md glass-strong rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <h2 className="text-base font-semibold text-foreground">Delete Property</h2>
          </div>
          <button
            onClick={handleCancel}
            className="p-1 rounded-lg hover:bg-card/60 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4 text-foreground/60" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-foreground/80">
            You're about to permanently delete <span className="font-semibold text-foreground">{displayTitle}</span>.
          </p>
          <p className="text-sm text-foreground/70">
            This cannot be undone. If you later add a new property at the same address, the AI will need to text the tenant again to obtain message opt-in.
          </p>

          <label className="flex items-start gap-3 text-sm cursor-pointer p-3 rounded-lg glass hover:bg-card/60 transition-colors">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 accent-primary"
              checked={ack}
              onChange={(e) => setAck(e.target.checked)}
            />
            <span className="text-foreground/80">
              I understand this will permanently remove this property and its card, and re-adding the same address will trigger a new tenant opt-in request.
            </span>
          </label>
        </div>

        <div className="p-6 pt-0 flex items-center justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-[19px] glass hover:bg-card/60 text-sm font-medium transition-all"
          >
            Cancel
          </button>
          <button
            disabled={!ack}
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-[19px] text-sm font-medium transition-all ${
              ack 
                ? "bg-destructive text-white hover:bg-destructive/90 shadow-lg" 
                : "bg-destructive/30 text-destructive/50 cursor-not-allowed"
            }`}
          >
            Delete Forever
          </button>
        </div>
      </div>
    </div>
  );
}
