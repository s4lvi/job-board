"use client";

import { cn } from "@/lib/utils";

export default function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { id: string; label: string; count?: number }[];
  active: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex gap-1 border-b border-white/10">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            "px-4 py-3 text-xs font-black uppercase tracking-widest transition-colors relative",
            active === tab.id
              ? "text-white"
              : "text-white/40 hover:text-white/60"
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-2 text-[10px] text-primary">{tab.count}</span>
          )}
          {active === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
}
