"use client";

import { cn } from "@/lib/utils";

interface YearSelectorProps {
  years: number[];
  selected: number;
  onChange: (year: number) => void;
}

export function YearSelector({ years, selected, onChange }: YearSelectorProps) {
  const sortedYears = [...years].sort((a, b) => b - a);

  return (
    <div className="flex flex-wrap gap-1.5">
      {sortedYears.map((year) => (
        <button
          key={year}
          aria-pressed={selected === year}
          onClick={() => onChange(year)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-all cursor-pointer",
            selected === year
              ? "bg-[var(--accent)] text-white shadow-sm"
              : "bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)]/50 hover:text-[var(--text-primary)]"
          )}
        >
          {year}
        </button>
      ))}
    </div>
  );
}
