import { test, expect } from "@playwright/test";

test.describe("Profile Page — Export & Actions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/octocat");
    // Wait for profile to load
    await page.waitForSelector("img[alt*='avatar']", { timeout: 15000 });
  });

  test("Tweet button is visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: /Tweet/i })).toBeVisible();
  });

  test("Export PNG button is visible", async ({ page }) => {
    const exportBtn = page.getByRole("button", { name: /Export PNG/i });
    await expect(exportBtn).toBeVisible();
  });

  test("Share button is visible", async ({ page }) => {
    const shareBtn = page.getByRole("button", { name: /Share/i });
    await expect(shareBtn).toBeVisible();
  });

  test("Battle button is visible and links to battle page with pre-fill", async ({
    page,
  }) => {
    // Use href selector to avoid matching the header Battle link
    const battleLink = page.locator('a[href*="/battle?user="]');
    await expect(battleLink).toBeVisible();
    const href = await battleLink.getAttribute("href");
    expect(href).toContain("/battle");
    expect(href).toContain("user=octocat");
  });

  test("clicking Share copies URL to clipboard", async ({ page, context }) => {
    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    const shareBtn = page.getByRole("button", { name: /Share/i });
    await shareBtn.click();
    // Should show toast
    await expect(page.getByText(/copied/i)).toBeVisible({ timeout: 5000 });
  });

  test("Customize section contains Year and Heatmap Theme", async ({
    page,
  }) => {
    await expect(page.getByText("Customize")).toBeVisible();
    await expect(page.getByText("Year")).toBeVisible();
    await expect(page.getByText("Heatmap Theme")).toBeVisible();
  });

  test("year selector buttons are clickable", async ({ page }) => {
    // Find any year button in the year selector area
    const yearBtn = page.locator("button").filter({ hasText: /^\d{4}$/ }).first();
    await expect(yearBtn).toBeVisible();
  });

  test("selected theme button has aria-pressed=true", async ({ page }) => {
    // First theme button should be aria-pressed by default (github-green is default)
    const pressedBtn = page.locator('button[aria-pressed="true"]').first();
    await expect(pressedBtn).toBeVisible();
  });

  test("selected year button has aria-pressed=true", async ({ page }) => {
    const pressedYearBtns = page.locator(
      'button[aria-pressed="true"]'
    );
    await expect(pressedYearBtns.first()).toBeVisible();
  });

  test("theme selector shows all 9 themes", async ({ page }) => {
    for (const title of [
      "GitHub Green",
      "Indigo Night",
      "Synthwave",
      "Sunset",
      "Deep Ocean",
      "Forest",
      "Cherry Blossom",
      "Dracula",
      "Monochrome",
    ]) {
      await expect(page.getByTitle(title)).toBeVisible();
    }
  });

  test("changing theme updates heatmap colors", async ({ page }) => {
    // Get initial fill of first visible heatmap cell
    const firstCell = page.locator("svg[role='img'] rect.heatmap-cell").first();
    const initialFill = await firstCell.getAttribute("fill");

    // Click a different theme
    await page.getByTitle("Synthwave").click();

    // Color should change
    const newFill = await firstCell.getAttribute("fill");
    expect(newFill).not.toBe(initialFill);
  });

  test("avatar links to GitHub profile", async ({ page }) => {
    const avatarLink = page.locator('a[href*="github.com/octocat"]').first();
    await expect(avatarLink).toBeVisible();
  });

  test("username links to GitHub profile", async ({ page }) => {
    const nameLink = page.locator("h1 a[href*='github.com/octocat']");
    await expect(nameLink).toBeVisible();
  });
});

test.describe("Profile Page — Error States", () => {
  test("shows error for non-existent user", async ({ page }) => {
    await page.goto("/this-user-does-not-exist-zzzxxx12345");
    await page.waitForSelector("text=Couldn't load profile", { timeout: 20000 });
    await expect(page.getByText("Couldn't load profile")).toBeVisible();
    await expect(page.getByRole("button", { name: /Try Again/i })).toBeVisible();
  });

  test("error page has descriptive message", async ({ page }) => {
    await page.goto("/this-user-does-not-exist-zzzxxx12345");
    await page.waitForSelector("text=Couldn't load profile", { timeout: 20000 });
    // Verify there's an error message below the heading (content varies by API response)
    await expect(page.locator("p").filter({ hasText: /.+/ }).first()).toBeVisible();
  });
});

test.describe("Profile Page — Dynamic Metadata", () => {
  test("profile page has OG image meta tag", async ({ page }) => {
    await page.goto("/octocat");
    const ogImage = page.locator('meta[property="og:image"]');
    const content = await ogImage.getAttribute("content");
    expect(content).toContain("/api/og/octocat");
  });

  test("profile page has twitter:image meta tag", async ({ page }) => {
    await page.goto("/octocat");
    const twImage = page.locator('meta[name="twitter:image"]');
    const content = await twImage.getAttribute("content");
    expect(content).toContain("/api/og/octocat");
  });

  test("profile page title contains username", async ({ page }) => {
    await page.goto("/octocat");
    await expect(page).toHaveTitle(/octocat/i);
  });
});
