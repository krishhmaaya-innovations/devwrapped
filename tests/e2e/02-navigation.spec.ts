import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("typing username and submitting form navigates to profile", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByPlaceholder("Enter GitHub username").fill("octocat");
    await page.getByRole("button", { name: /Generate/i }).click();
    await expect(page).toHaveURL(/\/octocat/);
  });

  test("pressing Enter in search field navigates to profile", async ({
    page,
  }) => {
    await page.goto("/");
    const input = page.getByPlaceholder("Enter GitHub username");
    await input.fill("octocat");
    await input.press("Enter");
    await expect(page).toHaveURL(/\/octocat/);
  });

  test("clicking a suggestion chip navigates to that profile", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "torvalds" }).click();
    await expect(page).toHaveURL(/\/torvalds/);
  });

  test("header logo links to homepage", async ({ page }) => {
    await page.goto("/torvalds");
    await page.waitForLoadState("domcontentloaded");
    await page.locator("header a").first().click();
    await expect(page).toHaveURL("/");
  });

  test("navigating directly to /username works", async ({ page }) => {
    await page.goto("/gaearon");
    await expect(page).toHaveURL("/gaearon");
    // Should not 404
    await expect(page.locator("body")).not.toContainText("404");
    await expect(page.locator("body")).not.toContainText("This page could not be found");
  });
});
