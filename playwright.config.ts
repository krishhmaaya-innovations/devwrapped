import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [["list"], ["html", { outputFolder: "tests/report", open: "never" }]],
  timeout: 30000,
  use: {
    baseURL: process.env.CI ? "http://localhost:3000" : "http://localhost:4000",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: process.env.CI ? "npx next start -p 3000" : "npm run dev -- -p 4000",
    url: process.env.CI ? "http://localhost:3000" : "http://localhost:4000",
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
