"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, ArrowLeft, Swords, Flame, TrendingUp, CalendarDays, GitCommit, Zap, Twitter, Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { computeStats, type DerivedStats, type GitHubUserData } from "@/lib/github";
import { formatNumber } from "@/lib/utils";

interface BattleClientProps {
  user1: string;
  user2: string;
}

interface BattleUser {
  data: GitHubUserData;
  stats: DerivedStats;
}

const BATTLE_STATS = [
  { key: "totalContributions", label: "Total Contributions", icon: Zap, format: formatNumber },
  { key: "longestStreak", label: "Longest Streak", icon: Flame, format: (n: number) => `${n}d` },
  { key: "currentStreak", label: "Current Streak", icon: TrendingUp, format: (n: number) => `${n}d` },
  { key: "activeDays", label: "Active Days", icon: CalendarDays, format: formatNumber },
  { key: "averagePerDay", label: "Daily Average", icon: GitCommit, format: (n: number) => String(n) },
] as const;

function UserCard({ user, side, wins }: { user: BattleUser; side: "left" | "right"; wins: number }) {
  const isWinner = wins > BATTLE_STATS.length / 2;
  return (
    <div className={`flex-1 space-y-4 ${side === "right" ? "text-right" : ""}`}>
      {/* Profile */}
      <div className={`flex items-center gap-3 ${side === "right" ? "flex-row-reverse" : ""}`}>
        <a
          href={`https://github.com/${user.data.profile.login}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0"
        >
          <Image
            src={user.data.profile.avatarUrl}
            alt={user.data.profile.login}
            width={64}
            height={64}
            className="rounded-full border-2 border-[var(--border)] hover:border-[var(--accent)] transition-colors"
          />
        </a>
        <div className={side === "right" ? "text-right" : ""}>
          <div className="flex items-center gap-2 flex-wrap">
            {isWinner && (
              <Trophy className={`h-4 w-4 text-amber-400 ${side === "right" ? "order-last" : ""}`} />
            )}
            <a
              href={`/${user.data.profile.login}`}
              className="text-lg font-bold text-[var(--text-primary)] hover:text-[var(--accent)] transition-colors"
            >
              {user.data.profile.name || user.data.profile.login}
            </a>
          </div>
          <p className="font-mono text-xs text-[var(--text-muted)]">@{user.data.profile.login}</p>
          {isWinner && (
            <span className="inline-block mt-1 text-xs font-semibold text-amber-400 bg-amber-400/10 rounded-full px-2 py-0.5">
              Winner 🏆
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function StatRow({
  stat,
  v1,
  v2,
}: {
  stat: (typeof BATTLE_STATS)[number];
  v1: number;
  v2: number;
}) {
  const Icon = stat.icon;
  const winner: "left" | "right" | "tie" = v1 > v2 ? "left" : v1 < v2 ? "right" : "tie";

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-3 border-b border-[var(--border)] last:border-0">
      {/* Left value */}
      <div className={`text-right ${winner === "left" ? "text-[var(--accent)] font-bold text-lg" : "text-[var(--text-secondary)]"}`}>
        {stat.format(v1)}
        {winner === "left" && <span className="ml-1 text-xs">👑</span>}
      </div>

      {/* Label */}
      <div className="flex flex-col items-center gap-1">
        <Icon className="h-4 w-4 text-[var(--text-muted)]" />
        <span className="text-xs text-[var(--text-muted)] text-center whitespace-nowrap">{stat.label}</span>
      </div>

      {/* Right value */}
      <div className={`text-left ${winner === "right" ? "text-[var(--accent)] font-bold text-lg" : "text-[var(--text-secondary)]"}`}>
        {winner === "right" && <span className="mr-1 text-xs">👑</span>}
        {stat.format(v2)}
      </div>
    </div>
  );
}

function BattleSkeleton() {
  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
      <Skeleton className="h-8 w-48 mx-auto" />
      <div className="grid grid-cols-2 gap-8">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-16 w-16 rounded-full" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      <Skeleton className="h-60 w-full rounded-xl" />
    </div>
  );
}

export function BattleClient({ user1, user2 }: BattleClientProps) {
  const [users, setUsers] = useState<[BattleUser, BattleUser] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const year = new Date().getFullYear();
    Promise.all([
      fetch(`/api/github?username=${encodeURIComponent(user1)}&year=${year}`).then((r) => r.json()),
      fetch(`/api/github?username=${encodeURIComponent(user2)}&year=${year}`).then((r) => r.json()),
    ])
      .then(([d1, d2]) => {
        if (d1.error) throw new Error(`${user1}: ${d1.error}`);
        if (d2.error) throw new Error(`${user2}: ${d2.error}`);
        setUsers([
          { data: d1, stats: computeStats(d1.contributions) },
          { data: d2, stats: computeStats(d2.contributions) },
        ]);
      })
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Failed to load battle";
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  }, [user1, user2]);

  if (loading) return <BattleSkeleton />;

  if (error || !users) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-[var(--text-muted)]">{error || "Something went wrong"}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
          <Button variant="ghost" asChild>
            <Link href="/battle">← Change users</Link>
          </Button>
        </div>
      </div>
    );
  }

  const [u1, u2] = users;

  // Count wins per side
  let wins1 = 0;
  let wins2 = 0;
  for (const stat of BATTLE_STATS) {
    const v1 = u1.stats[stat.key] as number;
    const v2 = u2.stats[stat.key] as number;
    if (v1 > v2) wins1++;
    else if (v2 > v1) wins2++;
  }

  const overallWinner =
    wins1 > wins2 ? u1.data.profile.name || u1.data.profile.login
    : wins2 > wins1 ? u2.data.profile.name || u2.data.profile.login
    : null;

  const handleTweetBattle = () => {
    const text = overallWinner
      ? [
          `🏆 ${overallWinner} wins the #DevWrapped Battle!`,
          ``,
          `${Math.max(wins1, wins2)}/${BATTLE_STATS.length} categories dominated`,
          ``,
          `Who can beat them? 👇`,
        ].join("\n")
      : [
          `It's a tie! 🤝 ${user1} vs ${user2} on #DevWrapped`,
          ``,
          `Challenge anyone 👇`,
        ].join("\n");
    const url = `https://devwrapped.com/battle/${user1}/${user2}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="mx-auto w-full max-w-3xl space-y-8 px-4 py-8 animate-fadeIn">
      {/* Back */}
      <Button variant="ghost" size="sm" asChild>
        <Link href="/battle">
          <ArrowLeft className="h-4 w-4" />
          Change users
        </Link>
      </Button>

      {/* Header */}
      <div className="text-center">
        <div className="mb-2 inline-flex items-center gap-2 text-[var(--accent)]">
          <Swords className="h-5 w-5" />
          <span className="text-sm font-semibold uppercase tracking-widest">Dev Battle</span>
        </div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          <span className="font-mono">{user1}</span>
          <span className="mx-3 text-[var(--text-muted)]">vs</span>
          <span className="font-mono">{user2}</span>
        </h1>
        {overallWinner && (
          <p className="mt-2 text-sm text-amber-400 font-semibold">
            🏆 {overallWinner} wins {Math.max(wins1, wins2)}/{BATTLE_STATS.length} categories
          </p>
        )}
        {!overallWinner && (
          <p className="mt-2 text-sm text-[var(--text-muted)]">It&apos;s a tie! 🤝</p>
        )}
      </div>

      {/* Profile cards */}
      <div className="flex items-start gap-6 sm:gap-12">
        <UserCard user={u1} side="left" wins={wins1} />
        <div className="shrink-0 text-2xl font-black text-[var(--text-muted)] pt-4">VS</div>
        <UserCard user={u2} side="right" wins={wins2} />
      </div>

      {/* Stat rows */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <div className="divide-y divide-[var(--border)]">
            {BATTLE_STATS.map((stat) => (
              <StatRow
                key={stat.key}
                stat={stat}
                v1={u1.stats[stat.key] as number}
                v2={u2.stats[stat.key] as number}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Share */}
      <div className="flex justify-center gap-3 flex-wrap">
        <Button variant="outline" size="sm" onClick={handleTweetBattle}>
          <Twitter className="h-4 w-4" />
          Tweet Result
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            navigator.clipboard.writeText(window.location.href);
            toast.success("Battle link copied!");
          }}
        >
          <Link2 className="h-4 w-4" />
          Copy Link
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/${user1}`}>View {user1}</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/${user2}`}>View {user2}</Link>
        </Button>
      </div>
    </div>
  );
}
