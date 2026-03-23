# Testing Guide

DevWrapped uses **Playwright** for E2E tests. All tests run against a real dev server (auto-started by Playwright).

---

## Running Tests

```bash
# Run all 118 tests (headless, fastest)
npm test

# Interactive UI — click through tests visually
npm run test:ui

# Watch the browser while tests run
npm run test:headed

# Run a single spec file
npx playwright test tests/e2e/01-homepage.spec.ts

# Run tests matching a name pattern
npx playwright test --grep "Battle"

# Run in debug mode (step-by-step)
npx playwright test --debug
```

---

## Test Files

| File | Tests | What it covers |
|------|-------|----------------|
| `01-homepage.spec.ts` | 14 | Page loads, search form, metadata, dark mode toggle |
| `02-navigation.spec.ts` | 5 | Links work, 404 page, battle nav |
| `03-profile.spec.ts` | ~13 | Stats load, heatmap renders, year selector, theme selector |
| `04-api.spec.ts` | 12 | `/api/github` endpoint — validation, caching, errors |
| `05-theme-toggle.spec.ts` | 6 | Dark/light mode toggle, persistence |
| `06-seo-accessibility.spec.ts` | ~10 | OG tags, canonical URLs, aria labels |
| `07-battle.spec.ts` | 24 | Battle form, result page, winner label, Tweet Result, Copy Link |
| `08-privacy.spec.ts` | 10 | Privacy page content |
| `09-api-og-embed.spec.ts` | 19 | `/api/og` and `/api/embed` endpoints |
| `10-profile-actions.spec.ts` | 18 | Tweet, Share, Export PNG, themes, aria-pressed, OG meta |
| `11-routing-seo-security.spec.ts` | 17 | Security headers, sitemap, robots.txt, CSP |

---

## Writing New Tests

Tests use Playwright's `test` and `expect`. All files go in `tests/e2e/`.

### Basic structure

```ts
import { test, expect } from "@playwright/test";

test.describe("My Feature", () => {
  test("does the thing", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "DevWrapped" })).toBeVisible();
  });
});
```

### Using the test fixtures

The project has helpers in `tests/helpers/`:

```ts
import { loadProfile } from "../helpers/profile";

test("profile stats appears", async ({ page }) => {
  await loadProfile(page, "torvalds"); // navigates + waits for stats to load
  await expect(page.getByTestId("stats-cards")).toBeVisible();
});
```

### Rules for good tests

1. **No `page.waitForTimeout()`** — use `await expect(locator).toBeVisible()` instead
2. **Prefer role/label selectors** over CSS classes — `getByRole("button", { name: "Tweet" })`
3. **One thing per test** — don't test 5 features in one `test()` block
4. **Use `test.describe` groups** to organize related tests
5. **Mock nothing** — tests run against the real app and real GitHub API via a test PAT

### Adding a test for a new feature

Example: Adding tests for a new "Copy Embed" button:

```ts
// In tests/e2e/10-profile-actions.spec.ts, add to the existing describe block:

test("Copy Embed button copies embed markdown", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/torvalds");
  await page.waitForSelector("[data-testid='stats-cards']");

  await page.getByRole("button", { name: "Copy Embed" }).click();
  
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain("devwrapped.com/api/embed/torvalds");
});
```

---

## CI Behaviour

Tests run automatically on GitHub Actions on every push and PR:

- **Retries**: 2 retries on CI (flaky network calls can occasionally fail once)
- **Workers**: 1 (sequential — avoids GitHub API rate limit from parallel calls)
- **On failure**: Playwright HTML report + screenshots + traces are uploaded as GitHub Actions artifacts for 7 days

To view a failure report locally after a run:
```bash
npx playwright show-report tests/report
```

---

## Rate Limiting in Tests

Tests call the real GitHub API. The test GitHub PAT (`GITHUB_TOKEN_1`) has 5000 points/hour. The test suite uses ~200 points per full run. No concern unless running many times in a short period.

---

## Debugging a Failing Test

```bash
# Run just the failing file in headed mode
npx playwright test tests/e2e/03-profile.spec.ts --headed

# Open the last HTML report
npx playwright show-report tests/report

# Run with Playwright Inspector (step through page actions)
npx playwright test tests/e2e/03-profile.spec.ts --debug
```
