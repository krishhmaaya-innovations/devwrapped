import { test, expect } from "@playwright/test";

test.describe("Custom 404 Page", () => {
  // Use a multi-segment path so it does NOT match the [username] dynamic route
  const NOT_FOUND_PATH = "/definitely/not-a-valid-route";

  test("shows custom 404 for unknown routes", async ({ page }) => {
    const res = await page.goto(NOT_FOUND_PATH);
    expect(res?.status()).toBe(404);
    await expect(page.getByText("Page not found")).toBeVisible();
  });

  test("404 page has Search profiles link", async ({ page }) => {
    await page.goto(NOT_FOUND_PATH);
    const link = page.getByRole("link", { name: /Search profiles/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/");
  });

  test("404 page has Dev Battle link", async ({ page }) => {
    await page.goto(NOT_FOUND_PATH);
    const link = page.getByRole("link", { name: /Dev Battle/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/battle");
  });
});

test.describe("SEO Files", () => {
  test("sitemap.xml is accessible", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("<urlset");
    expect(body).toContain("/battle");
    expect(body).toContain("/privacy");
  });

  test("robots.txt is accessible", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toContain("User-Agent");
    expect(body).toContain("Sitemap");
    expect(body).toContain("Disallow: /api/");
  });
});

test.describe("Security Headers", () => {
  test("pages have X-Content-Type-Options header", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  });

  test("pages have X-Frame-Options header", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["x-frame-options"]).toBe("DENY");
  });

  test("pages have Referrer-Policy header", async ({ request }) => {
    const res = await request.get("/");
    expect(res.headers()["referrer-policy"]).toBe(
      "strict-origin-when-cross-origin"
    );
  });

  test("API endpoints don't leak server info", async ({ request }) => {
    const res = await request.get("/api/github?username=octocat");
    const headers = res.headers();
    // Should not expose sensitive server info
    expect(headers["server"] || "").not.toContain("Express");
    expect(headers["x-powered-by"]).toBeUndefined();
  });
});

test.describe("Routing", () => {
  test("homepage loads at /", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("/battle loads battle page", async ({ page }) => {
    await page.goto("/battle");
    await expect(page.getByText("Dev Battle")).toBeVisible();
  });

  test("/privacy loads privacy page", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: "Privacy Policy" })).toBeVisible();
  });

  test("/username loads profile page", async ({ page }) => {
    await page.goto("/octocat");
    await expect(page).toHaveURL("/octocat");
    // Should not show 404
    await expect(page.locator("body")).not.toContainText("Page not found");
  });

  test("/battle/user1/user2 loads battle result", async ({ page }) => {
    await page.goto("/battle/octocat/torvalds");
    await expect(page).toHaveURL("/battle/octocat/torvalds");
  });

  test("header and footer present on all pages", async ({ page }) => {
    for (const path of ["/", "/battle", "/privacy"]) {
      await page.goto(path);
      await expect(page.locator("header")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();
    }
  });

  test("header Battle link navigates to /battle", async ({ page }) => {
    await page.goto("/");
    const battleLink = page.locator("header").getByRole("link", { name: /Battle/i });
    await expect(battleLink).toBeVisible();
    await battleLink.click();
    await expect(page).toHaveURL("/battle");
  });

  test("footer Privacy link navigates to /privacy", async ({ page }) => {
    await page.goto("/");
    const privacyLink = page.locator("footer").getByRole("link", { name: /Privacy/i });
    await expect(privacyLink).toBeVisible();
    await privacyLink.click();
    await expect(page).toHaveURL("/privacy");
  });
});
