import { spawnSync } from "node:child_process";
import { E2E_ENV } from "./local-environment.mjs";

// Vérification du code sans projet Firebase : clé RSA jetable, aucune donnée réelle.
const result = spawnSync("pnpm", ["check"], { stdio: "inherit", env: {
  ...process.env, ...E2E_ENV, NEXT_DIST_DIR: ".next", NEXT_PUBLIC_EMULATOR: "false",
  FIREBASE_AUTH_EMULATOR_HOST: "", FIRESTORE_EMULATOR_HOST: "",
} });
process.exit(result.status ?? 1);
