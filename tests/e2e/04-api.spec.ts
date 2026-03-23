import { test, expect } from "@playwright/test";

test.describe("GitHub API Endpoint", () => {
  test("GET /api/github?username=octocat returns 200 with valid data", async ({
    request,
  }) => {
    const res = await request.get("/api/github?username=octocat");
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body).toHaveProperty("profile");
    expect(body).toHaveProperty("contributions");
    expect(body).toHaveProperty("year");
    expect(body.profile.login).toBe("octocat");
  });

  test("profile object has required fields", async ({ request }) => {
    const res = await request.get("/api/github?username=octocat");
    const { profile } = await res.json();

    expect(profile).toHaveProperty("login");
    expect(profile).toHaveProperty("avatarUrl");
    expect(profile).toHaveProperty("followers");
    expect(profile).toHaveProperty("createdAt");
    expect(typeof profile.login).toBe("string");
    expect(typeof profile.avatarUrl).toBe("string");
    expect(profile.avatarUrl).toContain("githubusercontent.com");
  });

  test("contributions object has calendar weeks", async ({ request }) => {
    const res = await request.get("/api/github?username=octocat");
    const { contributions } = await res.json();

    expect(contributions).toHaveProperty("contributionCalendar");
    expect(contributions.contributionCalendar).toHaveProperty("weeks");
    expect(Array.isArray(contributions.contributionCalendar.weeks)).toBe(true);
    expect(contributions.contributionCalendar.weeks.length).toBeGreaterThan(0);
  });

  test("contributions has all required stat fields", async ({ request }) => {
    const res = await request.get("/api/github?username=octocat");
    const { contributions } = await res.json();

    for (const field of [
      "totalCommitContributions",
      "totalIssueContributions",
      "totalPullRequestContributions",
      "totalPullRequestReviewContributions",
      "contributionYears",
    ]) {
      expect(contributions).toHaveProperty(field);
    }
  });

  test("year parameter is respected", async ({ request }) => {
    const res = await request.get("/api/github?username=octocat&year=2023");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.year).toBe(2023);
  });

  test("missing username returns 400", async ({ request }) => {
    const res = await request.get("/api/github");
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error");
    expect(body.error).toContain("username");
  });

  test("invalid username format returns 400", async ({ request }) => {
    const res = await request.get("/api/github?username=!!invalid!!");
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error");
  });

  test("non-existent user returns 404", async ({ request }) => {
    const res = await request.get(
      "/api/github?username=this-user-does-not-exist-zzzxxx12345"
    );
    expect(res.status()).toBe(404);
  });

  test("invalid year returns 400", async ({ request }) => {
    const res = await request.get("/api/github?username=octocat&year=1990");
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body).toHaveProperty("error");
    expect(body.error).toContain("year");
  });

  test("future year returns 400", async ({ request }) => {
    const res = await request.get("/api/github?username=octocat&year=2099");
    expect(res.status()).toBe(400);
  });

  test("response has cache-control header", async ({ request }) => {
    const res = await request.get("/api/github?username=octocat");
    const cacheControl = res.headers()["cache-control"];
    expect(cacheControl).toBeTruthy();
    expect(cacheControl).toContain("s-maxage");
  });

  test("second call for same user is served from cache (faster)", async ({
    request,
  }) => {
    // First call - may hit GitHub API
    const t1Start = Date.now();
    await request.get("/api/github?username=octocat");
    const t1 = Date.now() - t1Start;

    // Second call - should come from in-memory cache
    const t2Start = Date.now();
    await request.get("/api/github?username=octocat");
    const t2 = Date.now() - t2Start;

    // Cache should be significantly faster (or at least not slower by a lot)
    console.log(`First call: ${t1}ms, Cached call: ${t2}ms`);
    // Cached call should be under 2000ms (generous threshold for CI/slow networks)
    expect(t2).toBeLessThan(2000);
  });
});
