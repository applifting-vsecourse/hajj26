import { defineConfig, devices } from "@playwright/test"

// End-to-end tests drive the running app in a real browser. Start it first
// (`pnpm dev`); E2E_BASE_URL points them elsewhere, e.g. a deployed preview.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: "list",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3050",
    // A missing button should fail in seconds, not after the 30 s test timeout.
    actionTimeout: 5_000,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
})
