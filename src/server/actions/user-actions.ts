"use server";

import { FieldValue, type DocumentData } from "firebase-admin/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { randomBytes } from "node:crypto";
import { authAdmin, dbAdmin } from "@/server/firebase/admin";
import { auth } from "@/server/auth/config";
import { requireAdmin } from "@/server/auth/session";
import { USERS_COLLECTION_NAME, SYSTEME_COLLECTION_NAME } from "@/domain/collections";
import { createUserSchema, updateUserSchema, type CreateUserInput, type UpdateUserInput } from "@/domain/schemas/user-schema";
import { MAX_UTILISATEURS, type Utilisateur } from "@/domain/types/utilisateur";

const users = () => dbAdmin.collection(USERS_COLLECTION_NAME);
const lock = () => dbAdmin.collection(SYSTEME_COLLECTION_NAME).doc("comptes");

function claimsPour(data: CreateUserInput, accessVersion: string) {
  return data.role === "admin" ? { role: "admin", accessVersion } : {
    role: "user", accessVersion,
    droits: [...new Set(data.droits ?? [])],
    speciales: [...new Set(data.speciales ?? [])],
    sites: [...new Set(data.sites ?? [])],
  };
}

function erreur(error: unknown) {
  console.error("Gestion des comptes", error);
  const code = (error as { code?: string }).code;
  if (code === "auth/email-already-exists") return { error: "Cette adresse email est déjà utilisée." };
  if (code === "auth/phone-number-already-exists") return { error: "Ce numéro de téléphone est déjà utilisé." };
  return { error: error instanceof Error ? error.message : "Impossible d'enregistrer le compte." };
}

function valider(data: unknown) {
  const result = createUserSchema.safeParse(data);
  if (!result.success) throw new Error(result.error.issues[0].message);
  if (result.data.role === "user" && !result.data.sites?.length) {
    throw new Error("Attribuez au moins un site à cet employé.");
  }
  return result.data;
}

async function inviter(userId: string, email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
    await users().doc(userId).update({ invitationEnvoyee: true });
    return undefined;
  } catch {
    // Le compte existe : un échec d'email ne doit pas faire croire que la création a échoué.
    return "Compte enregistré, mais l'invitation n'a pas été envoyée. Utilisez « Renvoyer l'invitation ».";
  }
}

export async function listUsersAction(): Promise<Utilisateur[]> {
  await requireAdmin();
  const snapshot = await users().get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Utilisateur))
    .sort((a, b) => `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`, "fr"));
}

export async function createUserAction(formData: CreateUserInput): Promise<{ error: string } | { success: true; userId: string; warning?: string }> {
  let reservation: string | undefined;
  let authCree = false;
  try {
    await requireAdmin();
    const data = valider(formData);
    const ref = users().doc();
    const accessVersion = randomBytes(8).toString("hex");
    const claims = claimsPour(data, accessVersion);
    await dbAdmin.runTransaction(async (tx) => {
      // Le verrou commun sérialise aussi les requêtes concurrentes sur une collection vide.
      await tx.get(lock());
      const snapshot = await tx.get(users());
      if (snapshot.size >= MAX_UTILISATEURS) throw new Error(`Limite atteinte : ${MAX_UTILISATEURS} comptes au maximum.`);
      if (snapshot.docs.some((doc) => doc.data().email === data.email)) throw new Error("Cette adresse email est déjà utilisée.");
      tx.set(lock(), { revision: FieldValue.increment(1) }, { merge: true });
      tx.create(ref, { email: data.email, nom: data.nom, prenom: data.prenom,
        telephone: data.telephone ?? "", poste: data.poste ?? "", ...claims,
        disabled: true, statut: "creation", invitationEnvoyee: false, createdAt: new Date().toISOString() });
    });
    reservation = ref.id;
    await authAdmin.createUser({ uid: ref.id, email: data.email, displayName: `${data.prenom} ${data.nom}`,
      password: randomBytes(24).toString("base64url") + "Aa1!", disabled: true,
      ...(data.telephone ? { phoneNumber: data.telephone } : {}) });
    authCree = true;
    await authAdmin.setCustomUserClaims(ref.id, claims);
    await authAdmin.updateUser(ref.id, { disabled: false });
    await ref.update({ disabled: false, statut: "actif" });
    reservation = undefined;
    const warning = await inviter(ref.id, data.email);
    return { success: true, userId: ref.id, warning };
  } catch (error) {
    if (reservation) {
      // Conserver le créneau si le nettoyage Auth échoue : ne jamais produire un compte orphelin actif.
      try {
        if (authCree) await authAdmin.deleteUser(reservation);
        await users().doc(reservation).delete();
      } catch (cleanup) { console.error("Nettoyage du compte incomplet", cleanup); }
    }
    return erreur(error);
  }
}

export async function updateUserAction(userId: string, formData: UpdateUserInput): Promise<{ error: string } | { success: true; userId: string; warning?: string }> {
  const mutationId = randomBytes(8).toString("hex");
  let avant: DocumentData | undefined;
  let mutationReservee = false;
  try {
    await requireAdmin();
    const patch = updateUserSchema.parse(formData);
    const ref = users().doc(userId);
    const changeAcces = [patch.role, patch.droits, patch.speciales, patch.sites, patch.disabled].some((v) => v !== undefined);
    const nouvelleVersion = randomBytes(8).toString("hex");
    const data = await dbAdmin.runTransaction(async (tx) => {
      await tx.get(lock());
      const snapshot = await tx.get(users());
      const courant = snapshot.docs.find((doc) => doc.id === userId)?.data();
      if (!courant || courant.statut === "creation") throw new Error("Compte introuvable ou création inachevée.");
      if (courant.mutationEnCours) throw new Error("Ce compte est en cours de modification. Réessayez dans un instant.");
      const merged = valider({ ...courant, ...patch });
      const disabled = patch.disabled ?? courant.disabled;
      const actifs = snapshot.docs.filter((doc) => {
        const data = doc.data();
        return data.role === "admin" && !data.disabled && !data.mutationEnCours && data.statut !== "creation";
      });
      if (courant.role === "admin" && !courant.disabled && (merged.role !== "admin" || disabled) && actifs.length <= 1) {
        throw new Error("Le dernier administrateur actif ne peut pas être désactivé ni devenir employé.");
      }
      // Une modification d'identité conserve la version lue dans cette transaction,
      // pas une version Auth potentiellement antérieure à une autre modification.
      const claims = claimsPour(merged, changeAcces ? nouvelleVersion : (courant.accessVersion ?? "0"));
      tx.set(lock(), { revision: FieldValue.increment(1) }, { merge: true });
      // Version d'abord : toute ancienne session est refusée avant la modification Auth.
      tx.set(ref, { ...merged, telephone: merged.telephone ?? "", poste: merged.poste ?? "", ...claims,
        disabled, mutationEnCours: mutationId, updatedAt: new Date().toISOString(),
        droits: merged.role === "admin" ? FieldValue.delete() : claims.droits,
        speciales: merged.role === "admin" ? FieldValue.delete() : claims.speciales,
        sites: merged.role === "admin" ? FieldValue.delete() : claims.sites,
      }, { merge: true });
      return { merged, disabled, claims, avant: courant };
    });
    avant = data.avant;
    mutationReservee = true;
    await authAdmin.updateUser(userId, { email: data.merged.email, displayName: `${data.merged.prenom} ${data.merged.nom}`,
      phoneNumber: data.merged.telephone || null, disabled: data.disabled });
    if (changeAcces) {
      await authAdmin.setCustomUserClaims(userId, data.claims);
      await authAdmin.revokeRefreshTokens(userId);
    }
    await ref.update({ mutationEnCours: FieldValue.delete() });
    return { success: true, userId };
  } catch (error) {
    if (mutationReservee && avant) {
      try {
        // Auth et Firestore ne partagent pas de transaction. Après un échec,
        // réconcilier la fiche avec l'état Auth effectivement enregistré.
        const actual = await authAdmin.getUser(userId);
        const actualClaims = actual.customClaims ?? {};
        await dbAdmin.runTransaction(async (tx) => {
          await tx.get(lock());
          const ref = users().doc(userId);
          const doc = await tx.get(ref);
          if (doc.data()?.mutationEnCours !== mutationId) return;
          const profile: DocumentData = { ...avant, ...actualClaims, email: actual.email, disabled: actual.disabled,
            accessVersion: actualClaims.accessVersion ?? "0", updatedAt: new Date().toISOString() };
          delete profile.mutationEnCours;
          // Un admin ne conserve pas les anciennes listes de droits.
          if (actualClaims.role === "admin") {
            delete profile.droits; delete profile.sites; delete profile.speciales;
          }
          tx.set(ref, profile);
          tx.set(lock(), { revision: FieldValue.increment(1) }, { merge: true });
        });
      } catch (recovery) { console.error("Compte bloqué en attente de réconciliation", recovery); }
    }
    return erreur(error);
  }
}

export async function resendInvitationAction(userId: string): Promise<{ error: string } | { success: true }> {
  try {
    await requireAdmin();
    const record = await authAdmin.getUser(userId);
    if (record.disabled || !record.email) throw new Error("Le compte doit être actif pour recevoir une invitation.");
    const warning = await inviter(userId, record.email);
    if (warning) return { error: warning };
    return { success: true };
  } catch (error) { return erreur(error); }
}
