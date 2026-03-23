import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page title is correct", async ({ page }) => {
    await expect(page).toHaveTitle(/DevWrapped/);
  });

  test("hero heading is visible", async ({ page }) => {
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
    await expect(heading).toContainText("unwrapped");
  });

  test("hero subtitle is visible", async ({ page }) => {
    await expect(
      page.getByText("Beautiful contribution heatmaps")
    ).toBeVisible();
  });

  test("search input is present and focused", async ({ page }) => {
    const input = page.getByPlaceholder("Enter GitHub username");
    await expect(input).toBeVisible();
    await expect(input).toBeFocused();
  });

  test("Generate button is present and initially disabled", async ({ page }) => {
    const btn = page.getByRole("button", { name: /Generate/i });
    await expect(btn).toBeVisible();
    await expect(btn).toBeDisabled();
  });

  test("Generate button enables when username typed", async ({ page }) => {
    await page.getByPlaceholder("Enter GitHub username").fill("torvalds");
    const btn = page.getByRole("button", { name: /Generate/i });
    await expect(btn).toBeEnabled();
  });

  test("suggestion chips are all visible", async ({ page }) => {
    for (const user of ["torvalds", "gaearon", "sindresorhus", "tj"]) {
      await expect(page.getByRole("button", { name: user })).toBeVisible();
    }
  });

  test("feature cards all rendered", async ({ page }) => {
    await expect(page.getByText("Beautiful Heatmaps")).toBeVisible();
    await expect(page.getByText("Instant Stats")).toBeVisible();
    await expect(page.getByText("Battle Friends")).toBeVisible();
  });

  test("header logo is visible", async ({ page }) => {
    await expect(page.getByText("DevWrapped").first()).toBeVisible();
  });

  test("header has GitHub link", async ({ page }) => {
    const ghLink = page.locator("header").getByRole("link", { name: /GitHub/i });
    await expect(ghLink).toBeVisible();
    await expect(ghLink).toHaveAttribute("href", /github\.com/);
  });

  test("header has Buy me a coffee link", async ({ page }) => {
    const coffeeLink = page.getByRole("link", { name: /coffee/i });
    await expect(coffeeLink).toBeVisible();
    await expect(coffeeLink).toHaveAttribute("href", /buymeacoffee/);
  });

  test("footer is visible with correct content", async ({ page }) => {
    await expect(page.getByText("KrishMaaya")).toBeVisible();
    await expect(page.getByText(/GitHub GraphQL API/)).toBeVisible();
    await expect(page.getByRole("link", { name: "Privacy" })).toBeVisible();
  });

  test("100% Free badge is visible", async ({ page }) => {
    await expect(page.getByText("100% Free · No Sign-in Required")).toBeVisible();
  });

  test("page has no console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Filter out known extension-injected noise
    const realErrors = errors.filter(
      (e) => !e.includes("fdprocessedid") && !e.includes("extension")
    );
    expect(realErrors).toHaveLength(0);
  });
});
