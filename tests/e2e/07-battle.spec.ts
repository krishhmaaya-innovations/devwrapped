import { test, expect } from "@playwright/test";

test.describe("Battle Page — Entry Form", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/battle");
  });

  test("page renders with correct heading", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Dev Battle");
  });

  test("has two username input fields", async ({ page }) => {
    await expect(page.getByPlaceholder("First GitHub username")).toBeVisible();
    await expect(page.getByPlaceholder("Second GitHub username")).toBeVisible();
  });

  test("first input is auto-focused", async ({ page }) => {
    await expect(page.getByPlaceholder("First GitHub username")).toBeFocused();
  });

  test("Start Battle button is disabled when inputs are empty", async ({
    page,
  }) => {
    const btn = page.getByRole("button", { name: /Start Battle/i });
    await expect(btn).toBeVisible();
    await expect(btn).toBeDisabled();
  });

  test("Start Battle button enables when both usernames are filled", async ({
    page,
  }) => {
    await page.getByPlaceholder("First GitHub username").fill("torvalds");
    await page.getByPlaceholder("Second GitHub username").fill("gaearon");
    const btn = page.getByRole("button", { name: /Start Battle/i });
    await expect(btn).toBeEnabled();
  });

  test("VS divider is visible between inputs", async ({ page }) => {
    // The form has a styled VS divider between the two inputs ("vs" also appears in example battles)
    const divider = page.locator("span.uppercase, span[class*='uppercase']").filter({ hasText: /^vs$/i }).first();
    await expect(divider).toBeVisible();
  });

  test("example battles are displayed", async ({ page }) => {
    await expect(page.getByText("Example battles")).toBeVisible();
    // Check at least one example battle is visible
    await expect(page.getByText("torvalds")).toBeVisible();
    await expect(page.getByText("gaearon")).toBeVisible();
  });

  test("clicking an example battle navigates to battle result", async ({
    page,
  }) => {
    const exampleBtn = page.locator("button").filter({ hasText: "torvalds" }).filter({ hasText: "gaearon" });
    await exampleBtn.click();
    await expect(page).toHaveURL(/\/battle\/torvalds\/gaearon/);
  });

  test("submitting form navigates to battle result page", async ({ page }) => {
    await page.getByPlaceholder("First GitHub username").fill("octocat");
    await page.getByPlaceholder("Second GitHub username").fill("torvalds");
    await page.getByRole("button", { name: /Start Battle/i }).click();
    await expect(page).toHaveURL(/\/battle\/octocat\/torvalds/);
  });

  test("Swords icon is visible", async ({ page }) => {
    // The icon container
    const iconContainer = page.locator("div").filter({ has: page.locator("svg") }).first();
    await expect(iconContainer).toBeVisible();
  });

  test("description text is displayed", async ({ page }) => {
    await expect(
      page.getByText("Compare two GitHub profiles head-to-head")
    ).toBeVisible();
  });

  test("pre-fills user1 from URL query param", async ({ page }) => {
    await page.goto("/battle?user=torvalds");
    const input = page.getByPlaceholder("First GitHub username");
    await expect(input).toHaveValue("torvalds");
  });
});

test.describe("Battle Page — Result", () => {
  test("battle result page loads for valid users", async ({ page }) => {
    await page.goto("/battle/octocat/torvalds");
    // Wait for data to load
    await page.waitForSelector("img", { timeout: 20000 });
    // Should show both usernames (may appear multiple times — title + card)
    await expect(page.getByText("octocat").first()).toBeVisible();
    await expect(page.getByText("torvalds").first()).toBeVisible();
  });

  test("shows VS text between users", async ({ page }) => {
    await page.goto("/battle/octocat/torvalds");
    await page.waitForSelector("img", { timeout: 20000 });
    // The large "VS" divider between user cards (exact match to avoid matching lowercase "vs" in title)
    await expect(page.getByText("VS", { exact: true })).toBeVisible();
  });

  test("shows stat comparison rows", async ({ page }) => {
    await page.goto("/battle/octocat/torvalds");
    await page.waitForSelector("img", { timeout: 20000 });
    for (const label of [
      "Total Contributions",
      "Longest Streak",
      "Current Streak",
      "Active Days",
      "Daily Average",
    ]) {
      await expect(page.getByText(label)).toBeVisible();
    }
  });

  test("shows winner or tie label", async ({ page }) => {
    await page.goto("/battle/octocat/torvalds");
    await page.waitForSelector("img", { timeout: 20000 });
    // Either a winner badge or "tie"
    const hasWinner = await page.getByText(/wins|tie/i).isVisible();
    expect(hasWinner).toBe(true);
  });

  test("has Tweet Result and Copy Link share buttons", async ({ page }) => {
    await page.goto("/battle/octocat/torvalds");
    await page.waitForSelector("img", { timeout: 20000 });
    await expect(page.getByRole("button", { name: /Tweet Result/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Copy Link/i })).toBeVisible();
  });

  test("Copy Link button copies battle URL to clipboard", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/battle/octocat/torvalds");
    await page.waitForSelector("img", { timeout: 20000 });
    await page.getByRole("button", { name: /Copy Link/i }).click();
    await expect(page.getByText(/copied/i)).toBeVisible({ timeout: 5000 });
  });

  test("has Change users back link", async ({ page }) => {
    await page.goto("/battle/octocat/torvalds");
    await page.waitForSelector("img", { timeout: 20000 });
    const backLink = page.getByRole("link", { name: /Change users/i });
    await expect(backLink).toBeVisible();
    await expect(backLink).toHaveAttribute("href", "/battle");
  });

  test("has links to view individual profiles", async ({ page }) => {
    await page.goto("/battle/octocat/torvalds");
    await page.waitForSelector("img", { timeout: 20000 });
    await expect(page.getByRole("link", { name: /View octocat/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /View torvalds/i })).toBeVisible();
  });

  test("page has correct title metadata", async ({ page }) => {
    await page.goto("/battle/octocat/torvalds");
    await expect(page).toHaveTitle(/octocat vs torvalds/i);
  });

  test("battle with non-existent user shows error", async ({ page }) => {
    await page.goto("/battle/octocat/this-user-does-not-exist-zzzxxx12345");
    // Should show error state
    await page.waitForSelector("text=Try Again", { timeout: 20000 });
    await expect(page.getByRole("button", { name: /Try Again/i })).toBeVisible();
  });

  test("avatars link to GitHub profiles", async ({ page }) => {
    await page.goto("/battle/octocat/torvalds");
    await page.waitForSelector("img", { timeout: 20000 });
    const avatarLinks = page.locator('a[href*="github.com/"]');
    const count = await avatarLinks.count();
    expect(count).toBeGreaterThanOrEqual(2);
  });
});
