import {
  Flame,
  CalendarDays,
  TrendingUp,
  GitCommit,
  GitPullRequest,
  CircleDot,
  Eye,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import type { ContributionsData, DerivedStats } from "@/lib/github";

interface StatsCardsProps {
  contributions: ContributionsData;
  stats: DerivedStats;
}

export function StatsCards({ contributions, stats }: StatsCardsProps) {
  const statItems = [
    {
      label: "Total Contributions",
      value: formatNumber(stats.totalContributions),
      icon: Zap,
      color: "text-[var(--accent)]",
    },
    {
      label: "Current Streak",
      value: `${stats.currentStreak}d`,
      icon: Flame,
      color: "text-orange-400",
    },
    {
      label: "Longest Streak",
      value: `${stats.longestStreak}d`,
      icon: TrendingUp,
      color: "text-emerald-400",
    },
    {
      label: "Active Days",
      value: formatNumber(stats.activeDays),
      icon: CalendarDays,
      color: "text-sky-400",
    },
    {
      label: "Commits",
      value: formatNumber(contributions.totalCommitContributions),
      icon: GitCommit,
      color: "text-green-400",
    },
    {
      label: "Pull Requests",
      value: formatNumber(contributions.totalPullRequestContributions),
      icon: GitPullRequest,
      color: "text-purple-400",
    },
    {
      label: "Issues",
      value: formatNumber(contributions.totalIssueContributions),
      icon: CircleDot,
      color: "text-yellow-400",
    },
    {
      label: "Code Reviews",
      value: formatNumber(contributions.totalPullRequestReviewContributions),
      icon: Eye,
      color: "text-pink-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {statItems.map((item) => (
        <Card key={item.label} className="group hover:border-[var(--accent)]/30">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl font-bold text-[var(--text-primary)]">
                  {item.value}
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {item.label}
                </p>
              </div>
              <item.icon
                className={`h-5 w-5 ${item.color} opacity-60 group-hover:opacity-100 transition-opacity`}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Highlight stat — the "story" summary
 */
export function StatsHighlight({ stats }: { stats: DerivedStats }) {
  return (
    <Card className="border-[var(--accent)]/20 bg-gradient-to-br from-[var(--accent)]/5 to-transparent">
      <CardContent className="p-6">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div>
            <p className="text-sm text-[var(--text-muted)]">Busiest Day</p>
            <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
              {stats.busiestDay.date
                ? new Date(stats.busiestDay.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })
                : "—"}
            </p>
            <p className="text-xs text-[var(--accent)]">
              {formatNumber(stats.busiestDay.count)} contributions
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--text-muted)]">Busiest Month</p>
            <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
              {stats.busiestMonth.month || "—"}
            </p>
            <p className="text-xs text-[var(--accent)]">
              {formatNumber(stats.busiestMonth.count)} contributions
            </p>
          </div>
          <div>
            <p className="text-sm text-[var(--text-muted)]">Daily Average</p>
            <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
              {stats.averagePerDay}
            </p>
            <p className="text-xs text-[var(--text-muted)]">per day</p>
          </div>
          <div>
            <p className="text-sm text-[var(--text-muted)]">Active Average</p>
            <p className="mt-1 text-lg font-semibold text-[var(--text-primary)]">
              {stats.averagePerActiveDay}
            </p>
            <p className="text-xs text-[var(--text-muted)]">per active day</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
