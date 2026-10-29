import { getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { randomUUID } from "node:crypto";
import type { Page } from "@playwright/test";

export const PROJECT_ID = "demo-sacko-green";
export const ADMIN = { uid: "e2e-admin", email: "admin@sacko.test", password: "SackoTest123!" };
export const EMPLOYE = { uid: "e2e-employe", email: "employe@sacko.test", password: "SackoTest123!" };

export function emulatorApp() {
  // Le SDK de test n'a jamais de credentials de production.
  if (process.env.FIREBASE_AUTH_EMULATOR_HOST !== "127.0.0.1:9099" || process.env.FIRESTORE_EMULATOR_HOST !== "127.0.0.1:8080") {
    throw new Error("Les fixtures exigent les émulateurs locaux Auth et Firestore.");
  }
  return getApps().find((app) => app.name === "e2e") ?? initializeApp({ projectId: PROJECT_ID }, "e2e");
}

export async function creerCompte(input: { uid?: string; email: string; role?: "admin" | "user"; prenom?: string; nom?: string }) {
  const app = emulatorApp();
  const uid = input.uid ?? randomUUID();
  const accessVersion = randomUUID();
  const claims = input.role === "admin" ? { role: "admin", accessVersion } : {
    role: "user", accessVersion, droits: ["TABLEAU_DE_BORD:voir", "VEHICULES:voir"], sites: ["CA"], speciales: [],
  };
  await getAuth(app).createUser({ uid, email: input.email, password: ADMIN.password, displayName: `${input.prenom ?? "Équipe"} ${input.nom ?? "Test"}` });
  await getAuth(app).setCustomUserClaims(uid, claims);
  await getFirestore(app).collection("users").doc(uid).set({ email: input.email, prenom: input.prenom ?? "Équipe", nom: input.nom ?? "Test",
    ...claims, disabled: false, statut: "actif", createdAt: new Date().toISOString() });
  return uid;
}

export async function login(page: Page, email = ADMIN.email, password = ADMIN.password) {
  await page.goto("/login");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Mot de passe", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await page.waitForURL("http://localhost:3100/");
}

export async function idToken(email = EMPLOYE.email) {
  const response = await fetch("http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=demo-local-api-key", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: ADMIN.password, returnSecureToken: true }),
  });
  if (!response.ok) throw new Error(await response.text());
  return (await response.json()).idToken as string;
}

export async function lireFirestore(token: string, path: string) {
  return fetch(`http://127.0.0.1:8080/v1/projects/${PROJECT_ID}/databases/(default)/documents/${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
