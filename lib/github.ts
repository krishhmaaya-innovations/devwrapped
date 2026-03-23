import { cache, cacheKeys, CACHE_TTL } from "@/lib/cache";

// ─── Types ──────────────────────────────────────────────────────────
export interface ContributionDay {
  date: string;
  contributionCount: number;
  contributionLevel:
    | "NONE"
    | "FIRST_QUARTILE"
    | "SECOND_QUARTILE"
    | "THIRD_QUARTILE"
    | "FOURTH_QUARTILE";
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface GitHubProfile {
  login: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  followers: { totalCount: number };
  following: { totalCount: number };
  repositories: { totalCount: number };
  createdAt: string;
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface ContributionsData {
  totalCommitContributions: number;
  totalIssueContributions: number;
  totalPullRequestContributions: number;
  totalPullRequestReviewContributions: number;
  totalRepositoriesWithContributedCommits: number;
  totalRepositoriesWithContributedIssues: number;
  totalRepositoriesWithContributedPullRequests: number;
  totalRepositoriesWithContributedPullRequestReviews: number;
  contributionCalendar: ContributionCalendar;
  contributionYears: number[];
}

export interface GitHubUserData {
  profile: GitHubProfile;
  contributions: ContributionsData;
  year: number;
}

// ─── Token rotation ──────────────────────────────────────────────────
const tokens = [
  process.env.GITHUB_TOKEN_1,
  process.env.GITHUB_TOKEN_2,
  process.env.GITHUB_TOKEN_3,
].filter(Boolean) as string[];

let tokenIndex = 0;

function getToken(): string {
  if (tokens.length === 0) {
    throw new Error("No GitHub tokens configured. Set GITHUB_TOKEN_1 in .env.local");
  }
  const token = tokens[tokenIndex % tokens.length];
  tokenIndex++;
  return token;
}

// ─── GraphQL query ───────────────────────────────────────────────────
const CONTRIBUTIONS_QUERY = `
query($username: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $username) {
    login
    name
    avatarUrl
    bio
    company
    location
    followers { totalCount }
    following { totalCount }
    repositories(privacy: PUBLIC) { totalCount }
    createdAt
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      totalIssueContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      totalRepositoriesWithContributedCommits
      totalRepositoriesWithContributedIssues
      totalRepositoriesWithContributedPullRequests
      totalRepositoriesWithContributedPullRequestReviews
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
            contributionLevel
          }
        }
      }
    }
  }
}
`;

const CONTRIBUTION_YEARS_QUERY = `
query($username: String!) {
  user(login: $username) {
    contributionsCollection {
      contributionYears
    }
  }
}
`;

// ─── API calls ──────────────────────────────────────────────────────

async function graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
  const token = getToken();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  let res: Response;
  try {
    res = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "DevWrapped/1.0",
      },
      body: JSON.stringify({ query, variables }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error("GitHub API request timed out. Please try again.");
    }
    throw err;
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API error ${res.status}: ${text}`);
  }

  const json = await res.json();

  if (json.errors) {
    const msg = json.errors.map((e: { message: string }) => e.message).join(", ");
    throw new Error(`GitHub GraphQL error: ${msg}`);
  }

  return json.data as T;
}

/**
 * Fetch contribution years for a user
 */
export async function fetchContributionYears(username: string): Promise<number[]> {
  const data = await graphql<{
    user: { contributionsCollection: { contributionYears: number[] } };
  }>(CONTRIBUTION_YEARS_QUERY, { username });

  return data.user.contributionsCollection.contributionYears;
}

/**
 * Fetch full user data (profile + contributions for a specific year)
 */
export async function fetchUserData(
  username: string,
  year?: number
): Promise<GitHubUserData> {
  const targetYear = year || new Date().getFullYear();

  // Check cache
  const cacheKey = cacheKeys.contributions(username, targetYear);
  const cached = await cache.get<GitHubUserData>(cacheKey);
  if (cached) return cached;

  // Date range for the year
  const from = `${targetYear}-01-01T00:00:00Z`;
  const to = `${targetYear}-12-31T23:59:59Z`;

  const data = await graphql<{
    user: GitHubProfile & {
      contributionsCollection: Omit<ContributionsData, "contributionYears">;
    };
  }>(CONTRIBUTIONS_QUERY, { username, from, to });

  if (!data.user) {
    throw new Error(`GitHub user "${username}" not found`);
  }

  // Also fetch contribution years
  const years = await fetchContributionYears(username);

  const result: GitHubUserData = {
    profile: {
      login: data.user.login,
      name: data.user.name,
      avatarUrl: data.user.avatarUrl,
      bio: data.user.bio,
      company: data.user.company,
      location: data.user.location,
      followers: data.user.followers,
      following: data.user.following,
      repositories: data.user.repositories,
      createdAt: data.user.createdAt,
    },
    contributions: {
      ...data.user.contributionsCollection,
      contributionYears: years,
    },
    year: targetYear,
  };

  // Cache result
  await cache.set(cacheKey, result, CACHE_TTL);

  return result;
}

// ─── Derived stats ──────────────────────────────────────────────────

export interface DerivedStats {
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  busiestDay: { date: string; count: number };
  busiestMonth: { month: string; count: number };
  activeDays: number;
  averagePerDay: number;
  averagePerActiveDay: number;
  weekdayDistribution: Record<string, number>;
  monthlyDistribution: Record<string, number>;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function computeStats(contributions: ContributionsData): DerivedStats {
  const days: ContributionDay[] = contributions.contributionCalendar.weeks.flatMap(
    (w) => w.contributionDays
  );

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let busiestDay = { date: "", count: 0 };
  let activeDays = 0;

  const weekdayDistribution: Record<string, number> = {};
  const monthlyDistribution: Record<string, number> = {};

  WEEKDAYS.forEach((d) => (weekdayDistribution[d] = 0));
  MONTHS.forEach((m) => (monthlyDistribution[m] = 0));

  // Sort by date ascending
  const sortedDays = [...days].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  for (const day of sortedDays) {
    const d = new Date(day.date);
    const weekday = WEEKDAYS[d.getUTCDay()];
    const month = MONTHS[d.getUTCMonth()];

    weekdayDistribution[weekday] += day.contributionCount;
    monthlyDistribution[month] += day.contributionCount;

    if (day.contributionCount > 0) {
      activeDays++;
      tempStreak++;
      if (tempStreak > longestStreak) longestStreak = tempStreak;
    } else {
      tempStreak = 0;
    }

    if (day.contributionCount > busiestDay.count) {
      busiestDay = { date: day.date, count: day.contributionCount };
    }
  }

  // Current streak: count back from today, skip today if user hasn't committed yet
  currentStreak = 0;
  const today = new Date().toISOString().split("T")[0];
  const lastDay = sortedDays[sortedDays.length - 1];
  // If last day in calendar is today with 0 contributions, skip it so
  // yesterday's active streak still counts (user may not have committed yet today)
  let startIndex = sortedDays.length - 1;
  if (lastDay && lastDay.date === today && lastDay.contributionCount === 0) {
    startIndex = sortedDays.length - 2;
  }
  for (let i = startIndex; i >= 0; i--) {
    if (sortedDays[i].contributionCount > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Busiest month
  let busiestMonth = { month: "", count: 0 };
  for (const [month, count] of Object.entries(monthlyDistribution)) {
    if (count > busiestMonth.count) {
      busiestMonth = { month, count };
    }
  }

  const totalDays = sortedDays.length || 1;

  return {
    totalContributions: contributions.contributionCalendar.totalContributions,
    currentStreak,
    longestStreak,
    busiestDay,
    busiestMonth,
    activeDays,
    averagePerDay: Math.round(
      (contributions.contributionCalendar.totalContributions / totalDays) * 10
    ) / 10,
    averagePerActiveDay: activeDays
      ? Math.round(
          (contributions.contributionCalendar.totalContributions / activeDays) * 10
        ) / 10
      : 0,
    weekdayDistribution,
    monthlyDistribution,
  };
}
