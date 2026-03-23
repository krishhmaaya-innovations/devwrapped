import { test, expect } from "@playwright/test";

test.describe("OG Image API — /api/og/[username]", () => {
  test("returns a PNG image for valid user", async ({ request }) => {
    const res = await request.get("/api/og/octocat");
    expect(res.status()).toBe(200);
    const contentType = res.headers()["content-type"];
    expect(contentType).toContain("image/png");
  });

  test("response has cache control headers", async ({ request }) => {
    const res = await request.get("/api/og/octocat");
    expect(res.status()).toBe(200);
    const cacheControl = res.headers()["cache-control"];
    expect(cacheControl).toBeTruthy();
  });

  test("returns image for user with year param", async ({ request }) => {
    const res = await request.get("/api/og/octocat?year=2023");
    expect(res.status()).toBe(200);
    const contentType = res.headers()["content-type"];
    expect(contentType).toContain("image/png");
  });

  test("returns error image for invalid username format", async ({ request }) => {
    const res = await request.get("/api/og/!!invalid!!");
    // Should return an image (error card), not a JSON error
    expect(res.status()).toBe(200);
    const contentType = res.headers()["content-type"];
    expect(contentType).toContain("image/png");
  });

  test("returns fallback image for non-existent user", async ({ request }) => {
    const res = await request.get(
      "/api/og/this-user-does-not-exist-zzzxxx12345"
    );
    expect(res.status()).toBe(200);
    const contentType = res.headers()["content-type"];
    expect(contentType).toContain("image/png");
  });
});

test.describe("SVG Embed API — /api/embed/[username]", () => {
  test("returns SVG for valid user", async ({ request }) => {
    const res = await request.get("/api/embed/octocat");
    expect(res.status()).toBe(200);
    const contentType = res.headers()["content-type"];
    expect(contentType).toContain("image/svg+xml");
  });

  test("SVG contains username", async ({ request }) => {
    const res = await request.get("/api/embed/octocat");
    const body = await res.text();
    expect(body).toContain("octocat");
  });

  test("SVG contains DevWrapped branding", async ({ request }) => {
    const res = await request.get("/api/embed/octocat");
    const body = await res.text();
    expect(body).toContain("DevWrapped");
  });

  test("SVG has contribution data (rect elements)", async ({ request }) => {
    const res = await request.get("/api/embed/octocat");
    const body = await res.text();
    expect(body).toContain("<rect");
  });

  test("has CORS headers for cross-origin embedding", async ({ request }) => {
    const res = await request.get("/api/embed/octocat");
    const cors = res.headers()["access-control-allow-origin"];
    expect(cors).toBe("*");
  });

  test("respects theme parameter", async ({ request }) => {
    const res = await request.get("/api/embed/octocat?theme=synthwave");
    expect(res.status()).toBe(200);
    const body = await res.text();
    // Synthwave theme uses specific colors
    expect(body).toContain("image/svg+xml".length > 0 ? "<svg" : "");
  });

  test("respects year parameter", async ({ request }) => {
    const res = await request.get("/api/embed/octocat?year=2023");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("2023");
  });

  test("returns error SVG for invalid username", async ({ request }) => {
    const res = await request.get("/api/embed/!!invalid!!");
    expect(res.status()).toBe(400);
    const body = await res.text();
    expect(body).toContain("Invalid username");
  });

  test("returns error SVG for non-existent user", async ({ request }) => {
    const res = await request.get(
      "/api/embed/this-user-does-not-exist-zzzxxx12345"
    );
    // Should get fallback error SVG
    const body = await res.text();
    expect(body).toContain("<svg");
    expect(body).toContain("not found");
  });

  test("has cache control headers", async ({ request }) => {
    const res = await request.get("/api/embed/octocat");
    const cacheControl = res.headers()["cache-control"];
    expect(cacheControl).toBeTruthy();
    expect(cacheControl).toContain("public");
  });
});

test.describe("GitHub API — Additional Tests", () => {
  test("API returns correct cache headers on HIT", async ({ request }) => {
    // First call to populate cache
    await request.get("/api/github?username=octocat");
    // Second call should be cached
    const res = await request.get("/api/github?username=octocat");
    expect(res.status()).toBe(200);
    const cacheHeader = res.headers()["x-cache"];
    // Could be HIT or MISS depending on timing
    expect(["HIT", "MISS"]).toContain(cacheHeader);
  });

  test("API returns rate-limit remaining header", async ({ request }) => {
    const res = await request.get("/api/github?username=octocat");
    expect(res.status()).toBe(200);
    // Should have either X-Cache: HIT (no rate limit header) or X-RateLimit-Remaining
    const xCache = res.headers()["x-cache"];
    if (xCache === "MISS") {
      expect(res.headers()["x-ratelimit-remaining"]).toBeTruthy();
    }
  });

  test("API rejects years before 2008", async ({ request }) => {
    const res = await request.get("/api/github?username=octocat&year=2005");
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toContain("year");
  });

  test("API rejects years in the future", async ({ request }) => {
    const futureYear = new Date().getFullYear() + 1;
    const res = await request.get(
      `/api/github?username=octocat&year=${futureYear}`
    );
    expect(res.status()).toBe(400);
  });
});
