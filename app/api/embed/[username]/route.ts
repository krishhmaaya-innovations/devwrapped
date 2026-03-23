import { NextRequest } from "next/server";
import { fetchUserData } from "@/lib/github";
import { computeStats } from "@/lib/github";
import { getTheme } from "@/lib/heatmap-themes";
import { apiRateLimiter, getClientIP } from "@/lib/rate-limit";

export const runtime = "nodejs";

interface RouteParams {
  params: Promise<{ username: string }>;
}

/** Escape special chars for safe SVG embedding */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { username } = await params;

  // Rate limit
  const ip = getClientIP(request.headers);
  const rl = apiRateLimiter.check(ip);
  if (!rl.success) {
    const rateSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="80" viewBox="0 0 400 80"><rect width="400" height="80" rx="8" fill="#0f0f23"/><text x="20" y="48" font-family="sans-serif" font-size="12" fill="#ef4444">Rate limit exceeded. Try again later.</text></svg>`;
    return new Response(rateSvg, { status: 429, headers: { "Content-Type": "image/svg+xml", "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } });
  }

  // Validate username format
  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
    const errSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="80" viewBox="0 0 400 80"><rect width="400" height="80" rx="8" fill="#0f0f23"/><text x="20" y="32" font-family="sans-serif" font-size="13" fill="#6366f1">&lt;/&gt; DevWrapped</text><text x="20" y="56" font-family="sans-serif" font-size="12" fill="#64748b">Invalid username</text></svg>`;
    return new Response(errSvg, { status: 400, headers: { "Content-Type": "image/svg+xml" } });
  }

  const searchParams = new URL(request.url).searchParams;
  const themeId = searchParams.get("theme") || "github";
  const yearParam = searchParams.get("year");
  const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

  const theme = getTheme(themeId);

  try {
    const data = await fetchUserData(username, year);
    const stats = computeStats(data.contributions);

    const weeks = data.contributions.contributionCalendar.weeks;
    const recentWeeks = weeks.slice(-26); // last 26 weeks

    const CELL = 10;
    const GAP = 2;
    const ROWS = 7;
    const paddingLeft = 12;
    const paddingTop = 56;

    const heatmapW = recentWeeks.length * (CELL + GAP) - GAP;
    const heatmapH = ROWS * (CELL + GAP) - GAP;
    const totalW = paddingLeft + heatmapW + paddingLeft;
    const totalH = paddingTop + heatmapH + 44; // 44 for footer

    const cells = recentWeeks
      .map((week, wi) =>
        week.contributionDays
          .map((day, di) => {
            const pct =
              stats.totalContributions === 0
                ? 0
                : day.contributionCount /
                  Math.max(
                    1,
                    ...recentWeeks.flatMap((w) =>
                      w.contributionDays.map((d) => d.contributionCount)
                    )
                  );
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
            const x = paddingLeft + wi * (CELL + GAP);
            const y = paddingTop + di * (CELL + GAP);
            return `<rect x="${x}" y="${y}" width="${CELL}" height="${CELL}" rx="2" fill="${theme.levels[lvl]}"><title>${day.date}: ${day.contributionCount}</title></rect>`;
          })
          .join("")
      )
      .join("");

    // Format large numbers
    const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

    const statItems = [
      { label: "contributions", value: fmt(stats.totalContributions) },
      { label: "day streak", value: `${stats.longestStreak}d` },
      { label: "active days", value: String(stats.activeDays) },
    ];

    const statW = totalW / statItems.length;

    const statsRow = statItems
      .map(
        (s, i) => `
      <text x="${statW * i + statW / 2}" y="${paddingTop - 28}" 
        font-family="SFMono-Regular,Consolas,monospace" font-size="16" font-weight="700"
        fill="${theme.levels[4]}" text-anchor="middle">${s.value}</text>
      <text x="${statW * i + statW / 2}" y="${paddingTop - 12}" 
        font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="9"
        fill="#64748b" text-anchor="middle" text-transform="uppercase">${s.label}</text>`
      )
      .join("");

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}">
  <rect width="${totalW}" height="${totalH}" rx="12" fill="#0f0f23"/>
  
  <!-- Title bar -->
  <text x="${paddingLeft}" y="22" 
    font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="13" font-weight="700"
    fill="#f1f5f9">${escapeXml(username)}</text>
  <text x="${totalW - paddingLeft}" y="22"
    font-family="-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif" font-size="10"
    fill="#6366f1" text-anchor="end">&lt;/&gt; DevWrapped ${year}</text>
  
  <!-- Stats -->
  ${statsRow}

  <!-- Heatmap cells -->
  ${cells}

  <!-- Legend -->
  ${theme.levels
    .map(
      (c, i) =>
        `<rect x="${paddingLeft + i * (CELL + 2)}" y="${paddingTop + heatmapH + 12}" width="${CELL}" height="${CELL}" rx="2" fill="${c}"/>`
    )
    .join("")}
  <text x="${paddingLeft + theme.levels.length * (CELL + 2) + 6}" y="${paddingTop + heatmapH + 20}"
    font-family="-apple-system,sans-serif" font-size="9" fill="#475569">Less → More</text>
</svg>`;

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    // Error fallback SVG
    const errSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="80" viewBox="0 0 400 80">
  <rect width="400" height="80" rx="8" fill="#0f0f23"/>
  <text x="20" y="32" font-family="sans-serif" font-size="13" fill="#6366f1">&lt;/&gt; DevWrapped</text>
  <text x="20" y="56" font-family="sans-serif" font-size="12" fill="#64748b">Profile not found: ${escapeXml(username)}</text>
</svg>`;
    return new Response(errSvg, {
      headers: { "Content-Type": "image/svg+xml" },
    });
  }
}
