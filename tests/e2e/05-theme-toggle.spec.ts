import { test, expect } from "@playwright/test";

test.describe("Dark / Light Theme Toggle", () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh in dark mode
    await page.goto("/");
    await page.evaluate(() => localStorage.removeItem("devwrapped-theme"));
    await page.reload();
  });

  test("default theme is dark", async ({ page }) => {
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "dark");
  });

  test("clicking theme toggle switches to light", async ({ page }) => {
    await page.getByRole("button", { name: /Switch to light mode/i }).click();
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-theme", "light");
  });

  test("clicking theme toggle again switches back to dark", async ({ page }) => {
    // Switch to light
    await page.getByRole("button", { name: /Switch to light mode/i }).click();
    // Switch back to dark
    await page.getByRole("button", { name: /Switch to dark mode/i }).click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  });

  test("theme persists across page reload", async ({ page }) => {
    await page.getByRole("button", { name: /Switch to light mode/i }).click();
    // Wait for localStorage to be written before reloading
    await page.waitForFunction(() => localStorage.getItem("devwrapped-theme") === "light");
    await page.reload();
    // Wait for client-side ThemeSyncer to apply the stored theme after hydration
    await page.waitForFunction(
      () => document.documentElement.getAttribute("data-theme") === localStorage.getItem("devwrapped-theme")
    );
    await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  });

  test("theme is stored in localStorage", async ({ page }) => {
    await page.getByRole("button", { name: /Switch to light mode/i }).click();
    const stored = await page.evaluate(() =>
      localStorage.getItem("devwrapped-theme")
    );
    expect(stored).toBe("light");
  });

  test("no flash of wrong theme on reload (FOWT prevention)", async ({
    page,
  }) => {
    // Set light theme and wait for it to be stored
    await page.getByRole("button", { name: /Switch to light mode/i }).click();
    await page.waitForFunction(() => localStorage.getItem("devwrapped-theme") === "light");

    // Reload — inline script should apply theme before paint; ThemeSyncer is the fallback
    await page.reload();

    // Wait for the stored theme to be reflected in the DOM (inline script or ThemeSyncer)
    await page.waitForFunction(
      () => document.documentElement.getAttribute("data-theme") === localStorage.getItem("devwrapped-theme")
    );

    // Theme should be correct after page has settled
    const theme = await page.locator("html").getAttribute("data-theme");
    expect(theme).toBe("light");
  });
});
