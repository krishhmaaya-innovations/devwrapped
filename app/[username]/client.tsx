"use client";

import { useEffect, useState, useCallback } from "react";
import { Download, Share2, Swords, AlertCircle, Twitter } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heatmap } from "@/components/heatmap";
import { StatsCards, StatsHighlight } from "@/components/stats-cards";
import { ThemeSelector } from "@/components/theme-selector";
import { YearSelector } from "@/components/year-selector";
import { ProfileHeader } from "@/components/profile-header";
import { ProfileSkeleton } from "@/components/profile-skeleton";
import type { GitHubUserData } from "@/lib/github";
import { computeStats, type DerivedStats } from "@/lib/github";
import { formatNumber } from "@/lib/utils";

interface UserProfileClientProps {
  username: string;
}

export function UserProfileClient({ username }: UserProfileClientProps) {
  const [data, setData] = useState<GitHubUserData | null>(null);
  const [stats, setStats] = useState<DerivedStats | null>(null);
  const [themeId, setThemeId] = useState("github");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      toast.loading("Generating card…", { id: "export" });
      const res = await fetch(`/api/og/${encodeURIComponent(username)}?year=${year}`);
      if (!res.ok) throw new Error("Failed to generate card");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${username}-devwrapped-${year}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Card downloaded!", { id: "export" });
    } catch {
      toast.error("Export failed. Try again.", { id: "export" });
    }
  };

  const fetchData = useCallback(
    async (targetYear: number) => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/github?username=${encodeURIComponent(username)}&year=${targetYear}`
        );

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `HTTP ${res.status}`);
        }

        const result: GitHubUserData = await res.json();
        setData(result);
        setStats(computeStats(result.contributions));
        setYear(result.year);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to fetch data";
        setError(msg);
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [username]
  );

  useEffect(() => {
    fetchData(year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const handleYearChange = (newYear: number) => {
    setYear(newYear);
    fetchData(newYear);
  };

  const handleTweetShare = () => {
    if (!stats) return;
    const text = [
      `My #DevWrapped ${year} 🎁`,
      ``,
      `📊 ${formatNumber(stats.totalContributions)} contributions`,
      `🔥 ${stats.longestStreak}d longest streak`,
      `⚡ ${stats.currentStreak}d current streak`,
      ``,
      `See yours 👇`,
    ].join("\n");
    const url = `https://devwrapped.com/${username}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/${username}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: `${username} on DevWrapped`,
          text: `Check out ${username}'s GitHub contribution stats on DevWrapped!`,
          url,
        });
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard!");
    }
  };

  // Loading
  if (loading && !data) {
    return <ProfileSkeleton />;
  }

  // Error
  if (error && !data) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col items-center justify-center gap-4 px-4 py-20 text-center">
        <div className="rounded-full bg-red-500/10 p-4">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">
          Couldn&apos;t load profile
        </h2>
        <p className="text-sm text-[var(--text-muted)]">{error}</p>
        <Button onClick={() => fetchData(year)} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!data || !stats) return null;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8">
      {/* Profile Header */}
      <div className="animate-fadeIn">
        <ProfileHeader profile={data.profile} />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 flex-wrap animate-fadeIn" style={{ animationDelay: "80ms" }}>
        <Button variant="outline" size="sm" onClick={handleTweetShare} disabled={!stats}>
          <Twitter className="h-4 w-4" />
          Tweet
        </Button>
        <Button variant="outline" size="sm" onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          Share
        </Button>
        <Button variant="outline" size="sm" asChild>
          <a href={`/battle?user=${encodeURIComponent(username)}`}>
            <Swords className="h-4 w-4" />
            Battle
          </a>
        </Button>
        <Button variant="ghost" size="sm" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Export PNG
        </Button>
      </div>

      {/* Customize — Year + Theme in one section */}
      <div className="animate-fadeIn" style={{ animationDelay: "160ms" }}>
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Customize
        </p>
        <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-4">
          {data.contributions.contributionYears.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">Year</p>
              <YearSelector
                years={data.contributions.contributionYears}
                selected={year}
                onChange={handleYearChange}
              />
            </div>
          )}
          <div>
            <p className="mb-2 text-xs font-medium text-[var(--text-muted)]">Heatmap Theme</p>
            <ThemeSelector selected={themeId} onChange={setThemeId} />
          </div>
        </div>
      </div>

      {/* Heatmap */}
      <div className="relative animate-fadeIn" style={{ animationDelay: "240ms" }}>
        <Card>
          <CardContent className="p-4 sm:p-6 overflow-x-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-[var(--text-secondary)]">
                {stats.totalContributions.toLocaleString()} contributions in {year}
              </h2>
              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent)] border-t-transparent" />
              )}
            </div>
            <div className={loading ? "opacity-40 transition-opacity" : "transition-opacity"}>
              <Heatmap
                weeks={data.contributions.contributionCalendar.weeks}
                themeId={themeId}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="animate-fadeIn" style={{ animationDelay: "320ms" }}>
        <StatsCards contributions={data.contributions} stats={stats} />
      </div>

      {/* Highlights */}
      <div className="animate-fadeIn" style={{ animationDelay: "400ms" }}>
        <StatsHighlight stats={stats} />
      </div>
    </div>
  );
}
