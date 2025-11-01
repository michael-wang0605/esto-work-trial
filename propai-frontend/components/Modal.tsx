"use client";
import { useEffect } from "react";
import { X } from "lucide-react";

interface ModalProps {
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export default function Modal({
  open,
  isOpen,
  onClose,
  children,
  title,
}: ModalProps) {
  const isModalOpen = open ?? isOpen ?? false;

  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isModalOpen, onClose]);

  if (!isModalOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-6xl max-h-[95vh] overflow-y-auto glass-strong rounded-2xl shadow-2xl"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-border/50">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-card/60 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-foreground/60" />
            </button>
          </div>
        )}
        <div className={title ? "p-6" : ""}>
          {children}
        </div>
      </div>
    </div>
  );
}
