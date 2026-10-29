import { ADMIN, EMPLOYE, PROJECT_ID, creerCompte } from "./fixtures";

export default async function globalSetup() {
  for (const url of [
    `http://127.0.0.1:9099/emulator/v1/projects/${PROJECT_ID}/accounts`,
    `http://127.0.0.1:8080/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`,
  ]) {
    const response = await fetch(url, { method: "DELETE" });
    if (!response.ok) throw new Error(`Échec de la remise à zéro des émulateurs : ${response.status}`);
  }
  await creerCompte({ ...ADMIN, role: "admin", prenom: "Amadou", nom: "Admin" });
  await creerCompte({ ...EMPLOYE, prenom: "Mariama", nom: "Employée" });
}
