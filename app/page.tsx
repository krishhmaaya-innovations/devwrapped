"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Sparkles, Github, Zap, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SUGGESTED_USERS = [
  "torvalds",
  "gaearon",
  "sindresorhus",
  "tj",
  "yyx990803",
  "ThePrimeagen",
];

const FEATURES = [
  {
    icon: Sparkles,
    title: "Beautiful Heatmaps",
    description: "9 stunning themes from GitHub Green to Synthwave",
    href: null,
  },
  {
    icon: Zap,
    title: "Instant Stats",
    description: "Streaks, busiest day, contribution breakdown & more",
    href: null,
  },
  {
    icon: Trophy,
    title: "Battle Friends",
    description: "Compare your stats head-to-head with any developer",
    href: "/battle",
  },
];

export default function HomePage() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = username.trim();
    if (!trimmed) return;
    setIsLoading(true);
    router.push(`/${trimmed}`);
  };

  const handleSuggestion = (user: string) => {
    setIsLoading(true);
    router.push(`/${user}`);
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-4 pt-20 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[var(--accent)]/5 blur-[128px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-[100px]" />
        </div>

        {/* Badge */}
        <div
          className="mb-6 flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-1.5 text-sm text-[var(--text-secondary)] animate-fadeIn"
          style={{ animationDelay: "0ms" }}
        >
          <Github className="h-4 w-4" />
          <span>100% Free · No Sign-in Required</span>
        </div>

        {/* Title */}
        <h1
          className="max-w-3xl text-center text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-6xl animate-fadeIn"
          style={{ animationDelay: "100ms" }}
        >
          Your GitHub year,{" "}
          <span className="gradient-text">unwrapped</span>
        </h1>

        {/* Subtitle */}
        <p
          className="mt-4 max-w-xl text-center text-lg text-[var(--text-secondary)] sm:text-xl animate-fadeIn"
          style={{ animationDelay: "200ms" }}
        >
          Beautiful contribution heatmaps, streak stats, and shareable story
          cards — for any public GitHub profile.
        </p>

        {/* Search */}
        <form
          onSubmit={handleSubmit}
          className="mt-10 flex w-full max-w-md items-center gap-2 animate-fadeIn"
          style={{ animationDelay: "300ms" }}
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--text-muted)]" />
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub username"
              className="pl-10 pr-4"
              autoFocus
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <Button type="submit" size="lg" disabled={isLoading || !username.trim()}>
            {isLoading ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <>
                Generate
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </form>

        {/* Suggestions */}
        <div
          className="mt-4 flex flex-wrap items-center justify-center gap-2 animate-fadeIn"
          style={{ animationDelay: "400ms" }}
        >
          <span className="text-xs text-[var(--text-muted)]">Try:</span>
          {SUGGESTED_USERS.map((user) => (
            <button
              key={user}
              onClick={() => handleSuggestion(user)}
              className="rounded-md border border-[var(--border)] bg-[var(--bg-secondary)] px-2.5 py-1 text-xs text-[var(--text-secondary)] transition-all hover:border-[var(--accent)] hover:text-[var(--accent)] cursor-pointer"
            >
              {user}
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-4xl px-4 pb-20">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const inner = (
              <>
                <feature.icon className="mb-3 h-8 w-8 text-[var(--accent)] transition-transform group-hover:scale-110" />
                <h3 className="mb-1.5 font-semibold text-[var(--text-primary)]">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)]">
                  {feature.description}
                </p>
                {feature.href && (
                  <span className="mt-2 block text-xs text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                    Try it →
                  </span>
                )}
              </>
            );
            const cls =
              "group rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] p-6 transition-all duration-200 hover:border-[var(--accent)]/50 hover:shadow-lg hover:shadow-[var(--accent)]/5 animate-fadeInScale block";
            const style = { animationDelay: `${500 + i * 120}ms` };
            return feature.href ? (
              <a key={feature.title} href={feature.href} className={cls} style={style}>
                {inner}
              </a>
            ) : (
              <div key={feature.title} className={cls} style={style}>
                {inner}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
