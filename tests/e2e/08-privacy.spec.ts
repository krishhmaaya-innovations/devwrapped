import { test, expect } from "@playwright/test";

test.describe("Privacy Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/privacy");
  });

  test("page has correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/Privacy/i);
  });

  test("heading is Privacy Policy", async ({ page }) => {
    await expect(
      page.getByRole("heading", { level: 1, name: "Privacy Policy" })
    ).toBeVisible();
  });

  test("Last updated date is shown", async ({ page }) => {
    await expect(page.getByText(/Last updated/)).toBeVisible();
  });

  test("has Back to DevWrapped link", async ({ page }) => {
    const backLink = page.getByText("Back to DevWrapped");
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL("/");
  });

  test("all 6 privacy sections are visible", async ({ page }) => {
    for (const title of [
      "What we access",
      "What we store",
      "Cookies & local storage",
      "GitHub API token",
      "Third-party services",
      "Contact",
    ]) {
      await expect(page.getByText(title)).toBeVisible();
    }
  });

  test("has link to GitHub privacy policy", async ({ page }) => {
    const ghLink = page.getByRole("link", {
      name: /GitHub.*Privacy Policy/i,
    });
    await expect(ghLink).toBeVisible();
    await expect(ghLink).toHaveAttribute("href", /github\.com/);
  });

  test("has disclaimer about not being affiliated with GitHub", async ({
    page,
  }) => {
    // The privacy page has its own disclaimer (distinct from the global footer)
    await expect(
      page.locator("p.mt-12").filter({ hasText: "not affiliated with GitHub" })
    ).toBeVisible();
  });

  test("page is statically rendered (no loading skeleton)", async ({
    page,
  }) => {
    // Privacy page should render immediately without any loader
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toBeVisible({ timeout: 2000 });
  });

  test("privacy policy mentions no accounts/no tracking", async ({ page }) => {
    await expect(
      page.getByText("No accounts, no tracking", { exact: false })
    ).toBeVisible();
  });

  test("meta description is set correctly", async ({ page }) => {
    const desc = page.locator('meta[name="description"]');
    const content = await desc.getAttribute("content");
    expect(content).toContain("privacy");
  });
});
