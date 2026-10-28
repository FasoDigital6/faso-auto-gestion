import { test, expect } from "@playwright/test";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { mkdir } from "node:fs/promises";
import { ADMIN, EMPLOYE, PROJECT_ID, creerCompte, emulatorApp, idToken, lireFirestore, login } from "./fixtures";

// Un seul worker : les fixtures du socle sont partagées, la limite de comptes est testée en dernier.

test("les pages privées exigent une connexion", async ({ browser }) => {
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();
  await page.goto("/utilisateurs");
  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("Email", { exact: true }).fill(ADMIN.email);
  await page.getByLabel("Mot de passe", { exact: true }).fill("mauvais-mot-de-passe");
  await page.getByRole("button", { name: "Se connecter", exact: true }).click();
  await expect(page.getByText("Email ou mot de passe incorrect.")).toBeVisible();
  await context.close();
});

test("un employé ne voit pas l'administration et ne lit pas ses données", async ({ browser }) => {
  const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const page = await context.newPage();
  await login(page, EMPLOYE.email);
  await expect(page.getByRole("link", { name: "Utilisateurs", exact: true })).toHaveCount(0);
  await page.goto("/parametres");
  await expect(page.getByText("Accès réservé aux administrateurs.", { exact: true })).toBeVisible();
  const token = await idToken();
  expect((await lireFirestore(token, `users/${EMPLOYE.uid}`)).status).toBe(200);
  expect((await lireFirestore(token, `users/${ADMIN.uid}`)).status).toBe(403);
  expect((await lireFirestore(token, "parametres/general")).status).toBe(403);
  const write = await fetch(`http://127.0.0.1:8080/v1/projects/${PROJECT_ID}/databases/(default)/documents/users/${EMPLOYE.uid}`, {
    method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields: { role: { stringValue: "admin" } } }),
  });
  expect(write.status).toBe(403);
  await context.close();
});

test("création avec modèle, modification et champs facultatifs vidés", async ({ page }) => {
  await page.goto("/utilisateurs");
  await page.getByRole("button", { name: "Nouvel utilisateur", exact: true }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByLabel("Prénom *", { exact: true }).fill("Jean");
  await sheet.getByLabel("Nom *", { exact: true }).fill("Test");
  await sheet.getByLabel("Email *", { exact: true }).fill("jean@sacko.test");
  await sheet.getByLabel("Téléphone", { exact: true }).fill("+15145551234");
  await sheet.getByRole("button", { name: "Agent Guinée", exact: true }).click();
  await expect(sheet.getByRole("checkbox", { name: "Guinée", exact: true })).toBeChecked();
  await sheet.getByRole("checkbox", { name: "Voir les coûts d'achat", exact: true }).check();
  await sheet.getByRole("button", { name: "Créer l’utilisateur", exact: true }).click();
  await expect(sheet).not.toBeVisible();
  await expect(page.getByText("jean@sacko.test", { exact: true })).toBeVisible();
  const record = await getAuth(emulatorApp()).getUserByEmail("jean@sacko.test");
  expect(record.customClaims?.sites).toEqual(["GN"]);
  expect(record.customClaims?.speciales).toEqual(["VOIR_COUTS"]);
  await page.getByRole("button", { name: "Modifier Jean Test", exact: true }).click();
  await getAuth(emulatorApp()).updateUser(EMPLOYE.uid, { phoneNumber: "+15145550000" });
  await sheet.getByLabel("Téléphone", { exact: true }).fill("+15145550000");
  await sheet.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(sheet.getByRole("alert")).toContainText("Ce numéro de téléphone est déjà utilisé.");
  const recovered = (await getFirestore(emulatorApp()).doc(`users/${record.uid}`).get()).data();
  expect(recovered?.accessVersion).toBe((await getAuth(emulatorApp()).getUser(record.uid)).customClaims?.accessVersion);
  expect(recovered?.mutationEnCours).toBeUndefined();
  await sheet.getByLabel("Téléphone", { exact: true }).fill("");
  await sheet.getByLabel("Poste", { exact: true }).fill("Responsable Guinée");
  await sheet.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(sheet).not.toBeVisible();
  expect((await getAuth(emulatorApp()).getUser(record.uid)).phoneNumber).toBeUndefined();
  expect((await getFirestore(emulatorApp()).doc(`users/${record.uid}`).get()).data()?.telephone).toBe("");
  await expect(page.getByText("Responsable Guinée", { exact: true })).toBeVisible();
});

test("les paramètres sont historisés et les modifications concurrentes sont refusées", async ({ page, context }) => {
  await page.goto("/parametres");
  await page.getByLabel("1 CAD en USD", { exact: true }).fill("0.72");
  await page.getByLabel("1 CAD en GNF", { exact: true }).fill("6300");
  await page.getByLabel("Numéro de TPS", { exact: true }).fill("TEST-TPS");
  await page.getByRole("button", { name: "Enregistrer les paramètres", exact: true }).click();
  await expect(page.getByText("Paramètres enregistrés et ajoutés à l’historique.", { exact: true })).toBeVisible();
  const other = await context.newPage();
  await other.goto("/parametres");
  await expect(other.getByLabel("1 CAD en USD", { exact: true })).toHaveValue("0.72");
  await page.getByLabel("1 CAD en USD", { exact: true }).fill("0.75");
  await page.getByRole("button", { name: "Enregistrer les paramètres", exact: true }).click();
  await expect(page.getByLabel("1 CAD en USD", { exact: true })).toHaveValue("0.75");
  await expect.poll(async () => (await getFirestore(emulatorApp()).doc("parametres/general").get()).data()?.revision).toBe(2);
  await other.getByLabel("1 CAD en USD", { exact: true }).fill("0.8");
  await other.getByRole("button", { name: "Enregistrer les paramètres", exact: true }).click();
  await expect(other.getByRole("alert").filter({ hasText: "Ces paramètres ont changé" })).toBeVisible();
  const history = await getFirestore(emulatorApp()).collection("parametres/general/historique").orderBy("revision").get();
  expect(history.docs.map((doc) => doc.data().taux.USD)).toEqual([0.72, 0.75]);
  expect(history.docs[0].data().taxes).toEqual({ tps: 5, tvq: 9.975 });
  await other.close();
});

test("un changement de droits invalide l'ancienne session et l'ancien accès Firestore", async ({ page, browser }) => {
  const employee = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const employeePage = await employee.newPage();
  await login(employeePage, EMPLOYE.email);
  const ancienToken = await idToken();
  expect((await lireFirestore(ancienToken, `users/${EMPLOYE.uid}`)).status).toBe(200);
  await page.goto("/utilisateurs");
  await page.getByRole("button", { name: "Modifier Mariama Employée", exact: true }).click();
  const sheet = page.getByRole("dialog");
  await sheet.getByRole("button", { name: "Agent Guinée", exact: true }).click();
  await sheet.getByRole("button", { name: "Enregistrer", exact: true }).click();
  await expect(sheet).not.toBeVisible();
  await employeePage.reload();
  await expect(employeePage).toHaveURL(/\/login$/);
  expect((await lireFirestore(ancienToken, `users/${EMPLOYE.uid}`)).status).toBe(403);
  await login(employeePage, EMPLOYE.email);
  expect((await lireFirestore(await idToken(), `users/${EMPLOYE.uid}`)).status).toBe(200);
  await employee.close();
});

test("désactivation immédiate puis réactivation du compte", async ({ page, browser }) => {
  const employee = await browser.newContext({ storageState: { cookies: [], origins: [] } });
  const employeePage = await employee.newPage();
  await login(employeePage, EMPLOYE.email);
  const ancienToken = await idToken();
  await page.goto("/utilisateurs");
  await page.getByRole("button", { name: "Désactiver Mariama Employée", exact: true }).click();
  await page.getByRole("button", { name: "Confirmer", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  expect((await lireFirestore(ancienToken, `users/${EMPLOYE.uid}`)).status).toBe(403);
  await employeePage.reload();
  await expect(employeePage).toHaveURL(/\/login$/);
  expect((await getAuth(emulatorApp()).getUser(EMPLOYE.uid)).disabled).toBe(true);
  await page.getByRole("button", { name: "Réactiver Mariama Employée", exact: true }).click();
  await page.getByRole("button", { name: "Confirmer", exact: true }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await login(employeePage, EMPLOYE.email);
  await employee.close();
});

test("le dernier administrateur actif est protégé", async ({ page }) => {
  await page.goto("/utilisateurs");
  await page.getByRole("button", { name: "Désactiver Amadou Admin", exact: true }).click();
  await page.getByRole("button", { name: "Confirmer", exact: true }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("Le dernier administrateur actif");
  expect((await getAuth(emulatorApp()).getUser(ADMIN.uid)).disabled).toBe(false);
});

test("les écrans restent utilisables sur mobile", async ({ page }) => {
  await mkdir("tests/e2e/captures", { recursive: true });
  await page.goto("/utilisateurs");
  await expect(page.getByText("jean@sacko.test", { exact: true })).toBeVisible();
  await page.screenshot({ path: "tests/e2e/captures/utilisateurs-desktop.png", fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "Nouvel utilisateur", exact: true }).click();
  await page.screenshot({ path: "tests/e2e/captures/utilisateur-formulaire.png", fullPage: true, animations: "disabled" });
  await page.getByRole("button", { name: "Annuler", exact: true }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/parametres");
  await expect(page.getByLabel("1 CAD en USD", { exact: true })).toHaveValue("0.75");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.screenshot({ path: "tests/e2e/captures/parametres-mobile.png", fullPage: true, animations: "disabled" });
  await page.goto("/utilisateurs");
  await expect(page.getByText("jean@sacko.test", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test("deux créations simultanées ne dépassent jamais 15 comptes", async ({ page, context }) => {
  const db = getFirestore(emulatorApp());
  const existing = await db.collection("users").get();
  for (let i = existing.size; i < 14; i++) await creerCompte({ email: `equipe-${i}@sacko.test`, prenom: `Équipe${i}` });
  const other = await context.newPage();
  for (const [index, target] of [page, other].entries()) {
    await target.goto("/utilisateurs");
    await target.getByRole("button", { name: "Nouvel utilisateur", exact: true }).click();
    await target.getByLabel("Prénom *", { exact: true }).fill(`Concurrent${index}`);
    await target.getByLabel("Nom *", { exact: true }).fill("Test");
    await target.getByLabel("Email *", { exact: true }).fill(`concurrent-${index}@sacko.test`);
  }
  await Promise.all([page, other].map((target) => target.getByRole("button", { name: "Créer l’utilisateur", exact: true }).click()));
  await expect.poll(async () => (await db.collection("users").get()).size).toBe(15);
  await expect.poll(async () => {
    return (await page.getByRole("dialog").count()) + (await other.getByRole("dialog").count());
  }).toBe(1);
  const loser = await page.getByRole("dialog").count() ? page : other;
  await expect(loser.getByRole("dialog").getByRole("alert")).toContainText("15 comptes au maximum");
  expect((await getAuth(emulatorApp()).listUsers()).users.length).toBe(15);
  await other.close();
});
