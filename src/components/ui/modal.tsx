"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  className,
}: {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
      <div
        className={cn(
          "relative bg-surface-light border border-white/10 p-6 w-full max-w-lg card-cut",
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg">{title}</h3>
            <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
