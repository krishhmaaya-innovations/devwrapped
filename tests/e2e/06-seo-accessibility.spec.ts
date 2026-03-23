import { test, expect } from "@playwright/test";

test.describe("SEO & Accessibility", () => {
  test.describe("Homepage meta", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
    });

    test("has correct og:title meta tag", async ({ page }) => {
      const ogTitle = page.locator('meta[property="og:title"]');
      const content = await ogTitle.getAttribute("content");
      expect(content).toContain("DevWrapped");
    });

    test("has description meta tag", async ({ page }) => {
      const desc = page.locator('meta[name="description"]');
      await expect(desc).toHaveCount(1);
      const content = await desc.getAttribute("content");
      expect(content!.length).toBeGreaterThan(20);
    });

    test("has Twitter card meta tag", async ({ page }) => {
      const twitterCard = page.locator('meta[name="twitter:card"]');
      const content = await twitterCard.getAttribute("content");
      expect(content).toBe("summary_large_image");
    });

    test("has JSON-LD structured data", async ({ page }) => {
      const ld = page.locator('script[type="application/ld+json"]');
      await expect(ld).toHaveCount(1);
      const content = await ld.textContent();
      const json = JSON.parse(content!);
      expect(json["@type"]).toBe("WebApplication");
      expect(json.name).toBe("DevWrapped");
    });

    test("heading hierarchy is correct (h1 exists)", async ({ page }) => {
      const h1 = page.locator("h1");
      await expect(h1).toHaveCount(1);
    });
  });

  test.describe("Profile page meta", () => {
    test("profile page has dynamic title", async ({ page }) => {
      await page.goto("/octocat");
      await expect(page).toHaveTitle(/octocat/i);
    });
  });

  test.describe("Interactive elements", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
    });

    test("theme toggle button has aria-label", async ({ page }) => {
      const toggle = page.getByRole("button", { name: /Switch to/i });
      await expect(toggle).toHaveAttribute("aria-label");
    });

    test("search input has placeholder text", async ({ page }) => {
      const input = page.getByPlaceholder("Enter GitHub username");
      await expect(input).toHaveAttribute("placeholder");
    });

    test("all external links have rel=noopener", async ({ page }) => {
      const externalLinks = page.locator('a[target="_blank"]');
      const count = await externalLinks.count();
      for (let i = 0; i < count; i++) {
        const rel = await externalLinks.nth(i).getAttribute("rel");
        expect(rel).toContain("noopener");
      }
    });

    test("feature card icons render correctly", async ({
      page,
    }) => {
      // One feature card (Battle Friends) is a link, others are static divs
      const featureSection = page.locator("section").last();
      const linkIcons = featureSection.locator("a svg");
      await expect(linkIcons).toHaveCount(1);
      // No buttons in feature cards
      const buttonIcons = featureSection.locator("button svg");
      await expect(buttonIcons).toHaveCount(0);
    });
  });

  test.describe("Profile page accessibility", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/octocat");
      await page.waitForSelector("img[alt*='avatar']", { timeout: 25000 });
    });

    test("avatar image has alt text", async ({ page }) => {
      const avatar = page.locator("img[alt*='avatar']").first();
      const alt = await avatar.getAttribute("alt");
      expect(alt).toBeTruthy();
      expect(alt).toContain("octocat");
    });

    test("heatmap SVG has aria-label", async ({ page }) => {
      const svg = page.locator("svg[role='img']");
      const ariaLabel = await svg.getAttribute("aria-label");
      expect(ariaLabel).toBeTruthy();
    });

    test("year buttons are focusable", async ({ page }) => {
      const yearBtn = page.locator("button").filter({ hasText: /^20\d{2}$/ }).first();
      await yearBtn.focus();
      await expect(yearBtn).toBeFocused();
    });
  });

  test.describe("OG image & canonical", () => {
    test("homepage has og:image meta tag", async ({ page }) => {
      await page.goto("/");
      const ogImage = page.locator('meta[property="og:image"]');
      const content = await ogImage.getAttribute("content");
      expect(content).toBeTruthy();
      expect(content).toContain("/api/og");
    });

    test("homepage has canonical link tag", async ({ page }) => {
      await page.goto("/");
      const canonical = page.locator('link[rel="canonical"]');
      const href = await canonical.getAttribute("href");
      expect(href).toBeTruthy();
      expect(href).toContain("devwrapped.com");
    });

    test("battle page has og:image meta tag", async ({ page }) => {
      await page.goto("/battle");
      const ogImage = page.locator('meta[property="og:image"]');
      const content = await ogImage.getAttribute("content");
      expect(content).toBeTruthy();
      expect(content).toContain("/api/og");
    });

    test("battle page has canonical link tag", async ({ page }) => {
      await page.goto("/battle");
      const canonical = page.locator('link[rel="canonical"]');
      const href = await canonical.getAttribute("href");
      expect(href).toBeTruthy();
      expect(href).toContain("/battle");
    });

    test("profile page has og:image pointing to user OG endpoint", async ({ page }) => {
      await page.goto("/octocat");
      await page.waitForSelector("img[alt*='avatar']", { timeout: 25000 });
      const ogImage = page.locator('meta[property="og:image"]');
      const content = await ogImage.getAttribute("content");
      expect(content).toBeTruthy();
      expect(content).toContain("/api/og/octocat");
    });

    test("profile page has canonical link tag", async ({ page }) => {
      await page.goto("/octocat");
      const canonical = page.locator('link[rel="canonical"]');
      const href = await canonical.getAttribute("href");
      expect(href).toBeTruthy();
      expect(href).toContain("octocat");
    });

    test("/api/og returns 200 and image/png", async ({ request }) => {
      const res = await request.get("/api/og");
      expect(res.status()).toBe(200);
      expect(res.headers()["content-type"]).toContain("image/png");
    });
  });
});
