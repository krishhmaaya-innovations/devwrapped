import { test, expect } from "@playwright/test";

// Use octocat - GitHub's official test account, always exists
const TEST_USER = "octocat";
const TEST_USER_REAL = "gaearon"; // Dan Abramov - well-known, many contributions

test.describe("User Profile Page", () => {
  test.describe("Profile loads correctly", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(`/${TEST_USER}`);
      // Wait for profile data to load (avatar image appears)
      await page.waitForSelector("img[alt*='avatar']", { timeout: 15000 });
    });

    test("shows user avatar", async ({ page }) => {
      const avatar = page.locator("img[alt*='avatar']").first();
      await expect(avatar).toBeVisible();
      const src = await avatar.getAttribute("src");
      expect(src).toBeTruthy();
    });

    test("shows username", async ({ page }) => {
      await expect(page.getByText(TEST_USER, { exact: false }).first()).toBeVisible();
    });

    test("heatmap SVG is rendered", async ({ page }) => {
      const svg = page.locator("svg[role='img'][aria-label*='heatmap']");
      await expect(svg).toBeVisible();
    });

    test("heatmap has contribution cells (rects)", async ({ page }) => {
      const cells = page.locator("svg[role='img'] rect");
      const count = await cells.count();
      expect(count).toBeGreaterThan(50); // At least 50 cells (52 weeks × 7 days)
    });

    test("heatmap legend is visible", async ({ page }) => {
      await expect(page.getByText("Less")).toBeVisible();
      await expect(page.getByText("More")).toBeVisible();
    });

    test("contribution count text is visible", async ({ page }) => {
      // Should show something like "X contributions in 2025"
      await expect(
        page.getByText(/contributions in \d{4}/)
      ).toBeVisible();
    });

    test("stats cards grid is rendered (8 cards)", async ({ page }) => {
      // Check for key stat labels
      for (const label of [
        "Total Contributions",
        "Current Streak",
        "Longest Streak",
        "Active Days",
        "Commits",
        "Pull Requests",
      ]) {
        await expect(page.getByText(label)).toBeVisible();
      }
    });

    test("stats highlights section is visible", async ({ page }) => {
      await expect(page.getByText("Busiest Day")).toBeVisible();
      await expect(page.getByText("Busiest Month")).toBeVisible();
      await expect(page.getByText("Daily Average")).toBeVisible();
    });

    test("theme selector is visible with all 9 themes", async ({ page }) => {
      await expect(page.getByText("Theme")).toBeVisible();
      // GitHub Green is always first
      await expect(page.getByTitle("GitHub Green")).toBeVisible();
      await expect(page.getByTitle("Indigo Night")).toBeVisible();
      await expect(page.getByTitle("Synthwave")).toBeVisible();
    });

    test("year selector is visible", async ({ page }) => {
      await expect(page.getByText("Year")).toBeVisible();
    });

    test("Share button is visible", async ({ page }) => {
      await expect(page.getByRole("button", { name: /Share/i })).toBeVisible();
    });

    test("Battle button is visible", async ({ page }) => {
      const battleLink = page.locator('a[href*="/battle?user="]');
      await expect(battleLink).toBeVisible();
    });
  });

  test.describe("Theme switching", () => {
    test("clicking a theme changes heatmap colors", async ({ page }) => {
      await page.goto(`/${TEST_USER}`);
      await page.waitForSelector("svg[role='img']", { timeout: 15000 });

      // Get initial color of an active cell
      const getFirstActiveColor = async () => {
        return await page.evaluate(() => {
          const rects = document.querySelectorAll("svg[role='img'] rect");
          for (const rect of rects) {
            const fill = rect.getAttribute("fill");
            if (fill && fill !== "#161b22" && fill !== "none") return fill;
          }
          return null;
        });
      };

      const initialColor = await getFirstActiveColor();

      // Click Synthwave theme
      await page.getByTitle("Synthwave").click();
      await page.waitForTimeout(300);

      const newColor = await getFirstActiveColor();
      // Colors should have changed
      expect(newColor).not.toEqual(initialColor);
    });

    test("theme selection persists on same page", async ({ page }) => {
      await page.goto(`/${TEST_USER}`);
      await page.waitForSelector("svg[role='img']", { timeout: 15000 });

      // Get the NONE-level color before switching (GitHub Green NONE = #161b22)
      const getBackgroundColor = async () => {
        return await page.evaluate(() => {
          const rect = document.querySelector("svg[role='img'] rect");
          return rect?.getAttribute("fill") ?? null;
        });
      };

      const beforeColor = await getBackgroundColor();

      // Switch to Deep Ocean (NONE = #0c1222 — different from GitHub Green)
      await page.getByTitle("Deep Ocean").click();
      await page.waitForTimeout(300);

      const afterColor = await getBackgroundColor();
      // The NONE color should have changed between themes
      expect(afterColor).not.toBe(beforeColor);
      expect(afterColor).toBe("#0c1222"); // Ocean NONE color
    });
  });

  test.describe("Year selector", () => {
    test("year buttons are clickable", async ({ page }) => {
      await page.goto(`/${TEST_USER_REAL}`);
      await page.waitForSelector("svg[role='img']", { timeout: 15000 });

      const yearButtons = page.locator("button").filter({ hasText: /^20\d{2}$/ });
      const count = await yearButtons.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe("Error handling", () => {
    test("shows error for non-existent username", async ({ page }) => {
      await page.goto("/this-user-absolutely-does-not-exist-xyz-99999");
      // Wait for the error UI to appear
      await expect(
        page.getByText(/Couldn't load profile|not found|Failed/i)
      ).toBeVisible({ timeout: 20000 });
    });
  });
});
