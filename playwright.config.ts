import { defineConfig, devices } from "@playwright/test";
import { readFileSync } from "node:fs";

/**
 * Tests E2E sur émulateurs Firebase (Auth + Firestore) : aucune donnée n'est
 * écrite sur sackogreen-dev ni sackogreen-prod. Les clés de session et le
 * compte de service du .env.local ne servent qu'à signer des jetons locaux.
 */
const PROJECT_ID = "demo-sacko-green";
const PORT = 3100;

function envLocal(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const file of [".env", ".env.local"]) {
    try {
      for (const line of readFileSync(new URL(file, `file://${process.cwd()}/`), "utf8").split("\n")) {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
        if (m) out[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
      }
    } catch {
      // fichier absent (CI) : les valeurs par défaut ci-dessous suffisent
    }
  }
  return out;
}

const base = envLocal();

export const E2E_ENV: Record<string, string> = {
  ...base,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_API_KEY: base.NEXT_PUBLIC_FIREBASE_API_KEY || "e2e-api-key",
  NEXT_PUBLIC_EMULATOR: "true",
  NEXT_PUBLIC_EMULATOR_HOST: "127.0.0.1",
  FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
  FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
  GCLOUD_PROJECT: PROJECT_ID,
  AUTH_COOKIE_NAME: "e2e_session",
  COOKIE_SECRET_CURRENT: base.COOKIE_SECRET_CURRENT || "e2e-secret-current-0123456789",
  COOKIE_SECRET_PREVIOUS: base.COOKIE_SECRET_PREVIOUS || "e2e-secret-previous-0123456789",
  NEXT_DIST_DIR: ".next-e2e",
  NEXT_PUBLIC_SITE_URL: `http://localhost:${PORT}`,
  NEXT_PUBLIC_APP_URL: `http://localhost:${PORT}`,
  RESEND_API_KEY: "",
};

if (!E2E_ENV.NEXT_PUBLIC_FIREBASE_PROJECT_ID.startsWith("demo-")) {
  throw new Error("Les tests E2E ne tournent que sur un projet émulé (demo-*).");
}

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
      command: `pnpm exec firebase emulators:start --only auth,firestore --project ${PROJECT_ID}`,
      port: 9099,
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      // Build de production : les NEXT_PUBLIC_* (émulateurs) sont figées au build,
      // et les pages sont déjà compilées (le mode dev recompile à chaque première visite).
      command: `pnpm exec next build --turbopack && pnpm exec next start -p ${PORT}`,
      url: `http://localhost:${PORT}/login`,
      reuseExistingServer: !process.env.CI,
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
