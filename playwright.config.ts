import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E configuration.
 *
 * Tests run against a locally served build of the app. The webServer block
 * starts `npm run dev` on port 3000 (reusing an already-running server if
 * present) before the suite, and the tests talk to the real Module 2 Flask API
 * through the app's own same-origin /api proxy routes.
 *
 * NODE_OPTIONS=--use-system-ca is forwarded so server-side fetches to the API
 * work behind a corporate TLS proxy (see README). Override the API with
 * NEXT_PUBLIC_API_BASE_URL in the environment if needed.
 */
const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  // Serialize tests: they share one live backend, so parallel writes could
  // interfere with assertions about counts/visibility.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  // The free-tier API can be slow under back-to-back writes, so give each test
  // generous headroom.
  timeout: 120_000,
  expect: { timeout: 20_000 },
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    // The free-tier API cold-starts slowly; give actions room.
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NODE_OPTIONS: "--use-system-ca",
    },
  },
});
