import { NextRequest, NextResponse } from "next/server";
import { fetchUserData } from "@/lib/github";
import { apiRateLimiter, getClientIP } from "@/lib/rate-limit";
import { cache, cacheKeys } from "@/lib/cache";
import type { GitHubUserData } from "@/lib/github";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");
  const yearParam = searchParams.get("year");

  // ── Validate params first ────────────────────────────────────────
  if (!username) {
    return NextResponse.json(
      { error: "Missing 'username' parameter" },
      { status: 400 }
    );
  }

  if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/.test(username)) {
    return NextResponse.json(
      { error: "Invalid GitHub username format" },
      { status: 400 }
    );
  }

  const year = yearParam ? parseInt(yearParam, 10) : undefined;
  if (year && (isNaN(year) || year < 2008 || year > new Date().getFullYear())) {
    return NextResponse.json(
      { error: "Invalid year. Must be between 2008 and current year." },
      { status: 400 }
    );
  }

  // ── Serve from cache before rate limiting ────────────────────────
  // Cached responses don't count against rate limits — only real GitHub API
  // calls should be rate-limited.
  const targetYear = year || new Date().getFullYear();
  const cacheKey = cacheKeys.contributions(username, targetYear);
  const cached = await cache.get<GitHubUserData>(cacheKey);

  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        "X-Cache": "HIT",
      },
    });
  }

  // ── Rate limit (only uncached/real API requests) ─────────────────
  const ip = getClientIP(request.headers);
  const limit = apiRateLimiter.check(ip);

  if (!limit.success) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.ceil((limit.resetAt - Date.now()) / 1000)
          ),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  // ── Fetch from GitHub ────────────────────────────────────────────
  try {
    const data = await fetchUserData(username, year);

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        "X-RateLimit-Remaining": String(limit.remaining),
        "X-Cache": "MISS",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch data";

    // Map GitHub's error messages to proper HTTP status codes
    const isNotFound =
      message.includes("not found") ||
      message.includes("Could not resolve") ||
      message.includes("user with the login");

    if (isNotFound) {
      return NextResponse.json(
        { error: `GitHub user "${username}" not found` },
        { status: 404 }
      );
    }

    console.error("[GitHub API]", message);
    return NextResponse.json(
      { error: "Failed to fetch GitHub data. Please try again." },
      { status: 500 }
    );
  }
}
