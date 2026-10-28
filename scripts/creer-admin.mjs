// Crée (ou promeut) le premier administrateur de Sacko-Green.
//
//   node --env-file=.env.local scripts/creer-admin.mjs prenom.nom@exemple.com "Prénom" "Nom"
//
// Le compte reçoit le rôle admin dans ses claims et sa fiche `users/{uid}`.
// S'il n'existait pas, un mot de passe aléatoire est posé : utiliser ensuite
// « Mot de passe oublié » sur la page de connexion pour choisir le sien.

import { randomBytes } from "node:crypto";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const [email, prenom = "", nom = ""] = process.argv.slice(2);
if (!email) {
  console.error('Usage : node --env-file=.env.local scripts/creer-admin.mjs email "Prénom" "Nom"');
  process.exit(1);
}

initializeApp({
  credential: cert({
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
    privateKey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
});

const auth = getAuth();
const existant = await auth.getUserByEmail(email).catch(() => null);
const user =
  existant ??
  (await auth.createUser({
    email,
    displayName: `${prenom} ${nom}`.trim() || undefined,
    password: randomBytes(12).toString("base64url") + "Aa1!",
  }));

await auth.setCustomUserClaims(user.uid, { role: "admin" });
await getFirestore()
  .collection("users")
  .doc(user.uid)
  .set(
    { email, prenom, nom, role: "admin", disabled: false, createdAt: new Date().toISOString() },
    { merge: true }
  );

console.log(`${email} est administrateur (${existant ? "compte existant promu" : "compte créé"}).`);
