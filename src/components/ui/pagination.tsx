"use client";

import { cn } from "@/lib/utils";

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push("...");
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push("...");
    pages.push(totalPages);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="btn-ghost btn-sm disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Prev
      </button>
      {pages.map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className="text-white/30 px-2">...</span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "w-10 h-10 text-xs font-black uppercase tracking-widest transition-colors",
              currentPage === page
                ? "bg-primary text-white"
                : "text-white/40 hover:text-white hover:bg-white/5"
            )}
            style={
              currentPage === page
                ? { clipPath: "polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px)" }
                : undefined
            }
          >
            {page}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="btn-ghost btn-sm disabled:opacity-30 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}
