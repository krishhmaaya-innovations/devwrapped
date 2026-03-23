import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { fetchUserData } from "@/lib/github";
import { computeStats } from "@/lib/github";
import { apiRateLimiter, getClientIP } from "@/lib/rate-limit";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ username: string }>;
}

function formatNum(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

const errorImage = (msg: string) =>
  new ImageResponse(
    (
      <div style={{ width: 1200, height: 630, display: "flex", alignItems: "center", justifyContent: "center", background: "#0f0f23", color: "#ef4444", fontSize: 32, fontFamily: "system-ui" }}>
        {msg}
      </div>
    ),
    { width: 1200, height: 630 }
  );

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { username } = await params;

  // Rate limit
  const ip = getClientIP(request.headers);
  const limit = apiRateLimiter.check(ip);
  if (!limit.success) {
    return errorImage("Rate limit exceeded. Try again later.");
  }

  // Validate username format
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
    return errorImage("Invalid username");
  }

  const yearParam = new URL(request.url).searchParams.get("year");
  const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

  try {
    const data = await fetchUserData(username, year);
    const stats = computeStats(data.contributions);

    // Heatmap last 4 months (16 weeks) simplified as colored bars
    const recentWeeks = data.contributions.contributionCalendar.weeks.slice(-16);
    const maxDay = Math.max(
      1,
      ...recentWeeks.flatMap((w) => w.contributionDays.map((d) => d.contributionCount))
    );

    const levelColors = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];

    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            display: "flex",
            flexDirection: "column",
            background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)",
            padding: "60px",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {/* Top row — Avatar + name + meta */}
          <div style={{ display: "flex", alignItems: "center", gap: "32px" }}>
            {/* Avatar */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.profile.avatarUrl}
              width={100}
              height={100}
              style={{ borderRadius: "50%", border: "3px solid #6366f1" }}
              alt={username}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: 42, fontWeight: 800, color: "#f1f5f9" }}>
                  {data.profile.name || username}
                </span>
                <span
                  style={{
                    fontSize: 18,
                    color: "#94a3b8",
                    background: "#1e293b",
                    padding: "4px 12px",
                    borderRadius: 8,
                    fontFamily: "monospace",
                  }}
                >
                  @{username}
                </span>
              </div>
              {data.profile.bio && (
                <span style={{ fontSize: 18, color: "#94a3b8", maxWidth: 600 }}>
                  {data.profile.bio.slice(0, 80)}
                  {data.profile.bio.length > 80 ? "…" : ""}
                </span>
              )}
            </div>

            {/* DevWrapped badge — far right */}
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <span style={{ fontSize: 22, fontWeight: 700, color: "#6366f1" }}>
                &lt;/&gt; DevWrapped
              </span>
              <span style={{ fontSize: 14, color: "#64748b" }}>devwrapped.com</span>
            </div>
          </div>

          {/* Divider */}
          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.08)",
              margin: "32px 0",
            }}
          />

          {/* Stats row */}
          <div style={{ display: "flex", gap: "16px", marginBottom: "40px" }}>
            {([
              { label: "Contributions", value: formatNum(stats.totalContributions), color: "#6366f1" },
              { label: "Longest Streak", value: `${stats.longestStreak}d`, color: "#f97316" },
              { label: "Active Days", value: String(stats.activeDays), color: "#22d3ee" },
              { label: "Year", value: String(data.year), color: "#a78bfa" },
            ] as { label: string; value: string; color: string }[]).map((s) => (
              <div
                key={s.label}
                style={{
                  flex: 1,
                  background: "rgba(255,255,255,0.04)",
                  border: `1px solid rgba(255,255,255,0.08)`,
                  borderRadius: 16,
                  padding: "20px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                <span style={{ fontSize: 42, fontWeight: 800, color: s.color }}>
                  {s.value}
                </span>
                <span style={{ fontSize: 14, color: "#64748b" }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Mini heatmap */}
          <div style={{ display: "flex", gap: "3px", alignItems: "flex-end" }}>
            {recentWeeks.map((week, wi) =>
              week.contributionDays.map((day, di) => {
                const pct = day.contributionCount / maxDay;
                const lvl =
                  day.contributionCount === 0
                    ? 0
                    : pct < 0.25
                    ? 1
                    : pct < 0.5
                    ? 2
                    : pct < 0.75
                    ? 3
                    : 4;
                return (
                  <div
                    key={`${wi}-${di}`}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 3,
                      background: levelColors[lvl],
                    }}
                  />
                );
              })
            )}
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
        },
      }
    );
  } catch {
    // Generic error OG card
    return new ImageResponse(
      (
        <div
          style={{
            width: 1200,
            height: 630,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f0f23",
            color: "#f1f5f9",
            gap: 16,
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <span style={{ fontSize: 24, color: "#6366f1" }}>&lt;/&gt; DevWrapped</span>
          <span style={{ fontSize: 42, fontWeight: 700 }}>
            {username}&apos;s GitHub Wrapped
          </span>
          <span style={{ fontSize: 20, color: "#64748b" }}>devwrapped.com</span>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}
