import { defineConfig, devices } from "@playwright/test";
import { E2E_ENV } from "./scripts/local-environment.mjs";

// Émulateurs seulement. Aucune lecture de .env.local ni réutilisation d'un serveur réel.
Object.assign(process.env, E2E_ENV);
const PORT = 3100;

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "fr-FR",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  webServer: [
    {
      command: "pnpm emulators",
      stdout: "pipe",
      gracefulShutdown: { signal: "SIGTERM", timeout: 10_000 },
      port: 9099,
      env: E2E_ENV,
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      // Build de production : les NEXT_PUBLIC_* (émulateurs) sont figées au build,
      // et les pages sont déjà compilées (le mode dev recompile à chaque première visite).
      command: `pnpm exec next build --turbopack && pnpm exec next start -p ${PORT}`,
      gracefulShutdown: { signal: "SIGTERM", timeout: 10_000 },
      url: `http://localhost:${PORT}/login`,
      reuseExistingServer: false,
      timeout: 600_000,
      env: E2E_ENV,
    },
  ],
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "desktop",
      testMatch: /.*\.spec\.ts/,
      dependencies: ["setup"],
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        storageState: "tests/e2e/.auth/admin.json",
      },
    },
  ],
});
