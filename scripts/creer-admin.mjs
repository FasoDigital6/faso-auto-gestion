// Amorçage local : node --env-file=.env.local scripts/creer-admin.mjs email "Prénom" "Nom"
import { randomBytes } from "node:crypto";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const [emailSaisi, prenom = "", nom = ""] = process.argv.slice(2);
if (!emailSaisi) {
  console.error('Usage : node --env-file=.env.local scripts/creer-admin.mjs email "Prénom" "Nom"');
  process.exit(1);
}
const email = emailSaisi.trim().toLowerCase();
initializeApp({ credential: cert({ projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
  privateKey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
}) });
const auth = getAuth();
const db = getFirestore();
const users = db.collection("users");
const lock = db.collection("systeme").doc("comptes");
const existant = await auth.getUserByEmail(email).catch((error) => {
  if (error.code === "auth/user-not-found") return null;
  throw error;
});
const uid = existant?.uid ?? users.doc().id;
const accessVersion = randomBytes(8).toString("hex");
const ref = users.doc(uid);
let reservation = false;
let authCree = false;
try {
  await db.runTransaction(async (tx) => {
    await tx.get(lock);
    const snapshot = await tx.get(users);
    const courant = snapshot.docs.find((doc) => doc.id === uid);
    if (!courant && snapshot.size >= 15) throw new Error("Limite atteinte : 15 comptes au maximum.");
    tx.set(lock, { revision: FieldValue.increment(1) }, { merge: true });
    tx.set(ref, { email, prenom, nom, role: "admin", accessVersion, disabled: true, statut: "creation",
      createdAt: courant?.data().createdAt ?? new Date().toISOString(), updatedAt: new Date().toISOString(),
      droits: FieldValue.delete(), sites: FieldValue.delete(), speciales: FieldValue.delete(), mutationEnCours: FieldValue.delete(),
    }, { merge: true });
  });
  reservation = true;
  if (!existant) {
    await auth.createUser({ uid, email, displayName: `${prenom} ${nom}`.trim() || undefined,
      disabled: true, password: randomBytes(24).toString("base64url") + "Aa1!" });
    authCree = true;
  }
  await auth.setCustomUserClaims(uid, { role: "admin", accessVersion });
  await auth.revokeRefreshTokens(uid);
  await auth.updateUser(uid, { disabled: false });
  await ref.update({ disabled: false, statut: "actif" });
  console.log(`${email} est administrateur (${existant ? "compte existant promu" : "compte créé"}).`);
} catch (error) {
  // Un compte existant reste bloqué en cas d'échec partiel : relancer ce script pour le réparer.
  if (reservation && !existant) {
    try {
      if (authCree) await auth.deleteUser(uid);
      await ref.delete();
    } catch (cleanup) { console.error("Nettoyage incomplet :", cleanup.message); }
  }
  console.error(error.message);
  process.exitCode = 1;
}
