import { test as setup, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { login } from "./fixtures";

setup("connexion administrateur", async ({ page }) => {
  await login(page);
  await expect(page.getByRole("heading", { name: "Bonjour, Amadou" })).toBeVisible();
  await mkdir("tests/e2e/.auth", { recursive: true });
  await page.context().storageState({ path: "tests/e2e/.auth/admin.json" });
});
