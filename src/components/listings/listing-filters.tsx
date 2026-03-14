"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const listingTypes = [
  { id: "", label: "All" },
  { id: "JOB", label: "Jobs" },
  { id: "GIG", label: "Gigs" },
  { id: "BOUNTY", label: "Bounties" },
];

const sortOptions = [
  { id: "newest", label: "Newest" },
  { id: "oldest", label: "Oldest" },
  { id: "budget_high", label: "Budget: High" },
  { id: "budget_low", label: "Budget: Low" },
];

type Category = { id: string; name: string; slug: string };

export default function ListingFilters({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentSearch = searchParams.get("search") || "";
  const currentRemote = searchParams.get("remote") === "true";

  function updateParams(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    params.delete("page");
    router.push(`/listings?${params.toString()}`);
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <input
          type="text"
          placeholder="Search listings..."
          defaultValue={currentSearch}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              updateParams({ search: (e.target as HTMLInputElement).value });
            }
          }}
          className="input-field w-full"
        />
      </div>

      {/* Type filter */}
      <div>
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-3">Type</h4>
        <div className="flex flex-wrap gap-2">
          {listingTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => updateParams({ type: type.id })}
              className={cn(
                "px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all",
                currentType === type.id
                  ? "bg-primary text-white"
                  : "border border-white/10 text-white/40 hover:text-white hover:border-white/30"
              )}
              style={
                currentType === type.id
                  ? { clipPath: "polygon(6px 0, 100% 0, 100% 100%, 0 100%, 0 6px)" }
                  : undefined
              }
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-3">Category</h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => updateParams({ category: "" })}
              className={cn(
                "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
                !currentCategory
                  ? "bg-white/10 text-white"
                  : "text-white/30 hover:text-white/60"
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateParams({ category: cat.slug })}
                className={cn(
                  "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
                  currentCategory === cat.slug
                    ? "bg-white/10 text-white"
                    : "text-white/30 hover:text-white/60"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Remote toggle */}
      <div>
        <button
          onClick={() => updateParams({ remote: currentRemote ? "" : "true" })}
          className={cn(
            "flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-colors",
            currentRemote ? "text-primary" : "text-white/40 hover:text-white/60"
          )}
        >
          <div className={cn(
            "w-4 h-4 border-2 flex items-center justify-center transition-colors",
            currentRemote ? "border-primary bg-primary" : "border-white/30"
          )}>
            {currentRemote && (
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          Remote Only
        </button>
      </div>

      {/* Sort */}
      <div>
        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-white/60 mb-3">Sort By</h4>
        <select
          value={currentSort}
          onChange={(e) => updateParams({ sort: e.target.value })}
          className="input-field"
        >
          {sortOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
