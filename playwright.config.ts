import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests against a running stack: the production web build (`npm start`) and
 * the API with Postgres and Redis. They create real enquiries and reviews, so point them
 * at a local or CI stack only, never at staging or production data you care about.
 *
 *   E2E_BASE_URL        website (default http://localhost:3000)
 *   E2E_ADMIN_EMAIL     an owner account on that stack
 *   E2E_ADMIN_PASSWORD
 */
export default defineConfig({
  testDir: "./e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3000",
    trace: "retain-on-failure",
  },
  projects: [
    // Tests tagged @phone check the stacked phone layout and run only on the phone project.
    { name: "desktop", use: { ...devices["Desktop Chrome"] }, grepInvert: /@phone/ },
    { name: "phone", use: { ...devices["Pixel 7"] }, grep: /@phone/ },
  ],
});
