"use client";

import { HEATMAP_THEMES } from "@/lib/heatmap-themes";
import { cn } from "@/lib/utils";

interface ThemeSelectorProps {
  selected: string;
  onChange: (themeId: string) => void;
}

export function ThemeSelector({ selected, onChange }: ThemeSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {HEATMAP_THEMES.map((theme) => (
        <button
          key={theme.id}
          onClick={() => onChange(theme.id)}
          className={cn(
            "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-all cursor-pointer",
            selected === theme.id
              ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
              : "border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--accent)]/50"
          )}
          aria-pressed={selected === theme.id}
          title={theme.name}
        >
          {/* Color preview dots */}
          <div className="flex gap-0.5">
            {theme.levels.slice(1).map((color, i) => (
              <div
                key={i}
                className="h-3 w-3 rounded-[2px]"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <span>{theme.name}</span>
        </button>
      ))}
    </div>
  );
}
