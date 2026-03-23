"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Swords, ArrowRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EXAMPLES = [
  ["torvalds", "gaearon"],
  ["sindresorhus", "tj"],
  ["yyx990803", "ThePrimeagen"],
];

export function BattleForm() {
  const searchParams = useSearchParams();
  const prefill = searchParams.get("user") || "";
  const [user1, setUser1] = useState(prefill);
  const [user2, setUser2] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const u1 = user1.trim();
    const u2 = user2.trim();
    if (!u1 || !u2) return;
    setLoading(true);
    router.push(`/battle/${encodeURIComponent(u1)}/${encodeURIComponent(u2)}`);
  };

  const loadExample = (a: string, b: string) => {
    setLoading(true);
    router.push(`/battle/${a}/${b}`);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-20">
      {/* Icon */}
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--accent)]/10 border border-[var(--accent)]/20">
        <Swords className="h-8 w-8 text-[var(--accent)]" />
      </div>

      <h1 className="mb-2 text-3xl font-bold text-[var(--text-primary)] sm:text-4xl text-center">
        Dev Battle
      </h1>
      <p className="mb-10 text-center text-[var(--text-secondary)] max-w-md">
        Compare two GitHub profiles head-to-head. Who has the most contributions? Longest streak? Best consistency?
      </p>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg space-y-4"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <Input
            value={user1}
            onChange={(e) => setUser1(e.target.value)}
            placeholder="First GitHub username"
            className="pl-10"
            autoFocus
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--border)]" />
          <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">vs</span>
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
          <Input
            value={user2}
            onChange={(e) => setUser2(e.target.value)}
            placeholder="Second GitHub username"
            className="pl-10"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={loading || !user1.trim() || !user2.trim()}
        >
          {loading ? (
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <>
              <Swords className="h-4 w-4" />
              Start Battle
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Example battles */}
      <div className="mt-10">
        <p className="mb-3 text-center text-xs text-[var(--text-muted)] uppercase tracking-widest">
          Example battles
        </p>
        <div className="flex flex-col gap-2">
          {EXAMPLES.map(([a, b]) => (
            <button
              key={`${a}-${b}`}
              onClick={() => loadExample(a, b)}
              className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-2.5 text-sm text-[var(--text-secondary)] transition-all hover:border-[var(--accent)]/50 hover:text-[var(--accent)] cursor-pointer"
            >
              <span className="font-mono">{a}</span>
              <span className="mx-3 text-[var(--text-muted)]">vs</span>
              <span className="font-mono">{b}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
