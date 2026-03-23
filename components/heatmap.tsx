"use client";

import { useMemo } from "react";
import type { ContributionWeek } from "@/lib/github";
import { getTheme, levelToIndex, type HeatmapTheme } from "@/lib/heatmap-themes";

interface HeatmapProps {
  weeks: ContributionWeek[];
  themeId?: string;
  cellSize?: number;
  cellGap?: number;
  showLabels?: boolean;
  className?: string;
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

export function Heatmap({
  weeks,
  themeId = "github",
  cellSize = 13,
  cellGap = 3,
  showLabels = true,
  className,
}: HeatmapProps) {
  const theme = useMemo(() => getTheme(themeId), [themeId]);

  // Calculate dimensions
  const labelOffset = showLabels ? 32 : 0;
  const topLabelOffset = showLabels ? 20 : 0;
  const totalWidth =
    labelOffset + weeks.length * (cellSize + cellGap) - cellGap;
  const totalHeight = topLabelOffset + 7 * (cellSize + cellGap) - cellGap;

  // Compute month label positions
  const monthPositions = useMemo(() => {
    const positions: { month: string; x: number }[] = [];
    let lastMonth = -1;

    weeks.forEach((week, weekIndex) => {
      const firstDay = week.contributionDays[0];
      if (!firstDay) return;
      const month = new Date(firstDay.date).getMonth();
      if (month !== lastMonth) {
        positions.push({
          month: MONTH_LABELS[month],
          x: labelOffset + weekIndex * (cellSize + cellGap),
        });
        lastMonth = month;
      }
    });

    return positions;
  }, [weeks, labelOffset, cellSize, cellGap]);

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        width="100%"
        style={{ maxWidth: totalWidth }}
        role="img"
        aria-label="GitHub contribution heatmap"
      >
        {/* Month labels */}
        {showLabels &&
          monthPositions.map(({ month, x }, i) => (
            <text
              key={`month-${i}`}
              x={x}
              y={12}
              fill={theme.labelColor}
              fontSize="10"
              fontFamily="Inter, system-ui, sans-serif"
            >
              {month}
            </text>
          ))}

        {/* Day labels */}
        {showLabels &&
          DAY_LABELS.map(
            (label, i) =>
              label && (
                <text
                  key={`day-${i}`}
                  x={0}
                  y={topLabelOffset + i * (cellSize + cellGap) + cellSize - 2}
                  fill={theme.labelColor}
                  fontSize="10"
                  fontFamily="Inter, system-ui, sans-serif"
                >
                  {label}
                </text>
              )
          )}

        {/* Cells */}
        {weeks.map((week, weekIndex) =>
          week.contributionDays.map((day, dayIndex) => {
            const colorIndex = levelToIndex(day.contributionLevel);
            const x = labelOffset + weekIndex * (cellSize + cellGap);
            const y = topLabelOffset + dayIndex * (cellSize + cellGap);

            return (
              <rect
                key={`${weekIndex}-${dayIndex}`}
                x={x}
                y={y}
                width={cellSize}
                height={cellSize}
                rx={2}
                ry={2}
                fill={theme.levels[colorIndex]}
                className="heatmap-cell transition-colors duration-150"
                style={{ animationDelay: `${weekIndex * 10}ms` }}
              >
                <title>
                  {day.date}: {day.contributionCount} contribution
                  {day.contributionCount !== 1 ? "s" : ""}
                </title>
              </rect>
            );
          })
        )}
      </svg>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-1.5 text-xs text-[var(--text-muted)]">
        <span>Less</span>
        {theme.levels.map((color, i) => (
          <div
            key={i}
            className="rounded-[2px]"
            style={{
              width: cellSize - 2,
              height: cellSize - 2,
              backgroundColor: color,
            }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

/**
 * Heatmap legend showing color scale
 */
export function HeatmapLegend({
  theme,
  cellSize = 11,
}: {
  theme: HeatmapTheme;
  cellSize?: number;
}) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
      <span>Less</span>
      {theme.levels.map((color, i) => (
        <div
          key={i}
          className="rounded-[2px]"
          style={{
            width: cellSize,
            height: cellSize,
            backgroundColor: color,
          }}
        />
      ))}
      <span>More</span>
    </div>
  );
}
