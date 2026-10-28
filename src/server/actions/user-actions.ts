"use server";

import { cookies } from "next/headers";
import { getTokens } from "next-firebase-auth-edge";
import { FieldValue } from "firebase-admin/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { randomBytes } from "crypto";

import { authAdmin, dbAdmin } from "@/server/firebase/admin";
import { auth, authConfig } from "@/server/auth/config";
import { USERS_COLLECTION_NAME } from "@/domain/collections";
import {
  createUserSchema,
  CreateUserInput,
  updateUserSchema,
  UpdateUserInput,
} from "@/domain/schemas/user-schema";

/** Plafond fixé au cadrage (Q12). */
const MAX_UTILISATEURS = 15;

/** Vérifie que l'appelant est admin, d'après son jeton (jamais d'après la requête). */
async function requireAdmin(): Promise<{ error: string } | { uid: string }> {
  const tokens = await getTokens(await cookies(), authConfig);
  if (!tokens) return { error: "Non authentifié" };
  const role = (tokens.decodedToken as { role?: string }).role;
  if (role !== "admin") return { error: "Accès refusé" };
  return { uid: tokens.decodedToken.uid };
}

type AccesDemande = Pick<CreateUserInput, "role" | "droits" | "speciales" | "sites">;

/**
 * Claims d'un compte. Un admin a tout implicitement : on ne stocke ni droits,
 * ni permissions spéciales, ni sites pour lui.
 */
function claimsPour({ role, droits, speciales, sites }: AccesDemande): Record<string, unknown> {
  if (role === "admin") return { role: "admin" };
  return {
    role: "user",
    droits: droits ?? [],
    speciales: speciales ?? [],
    sites: sites ?? [],
  };
}

function messageErreur(error: unknown, defaut: string) {
  console.error(defaut, error);
  return { error: error instanceof Error ? error.message : defaut };
}

export async function createUserAction(formData: CreateUserInput) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin;

  const result = createUserSchema.safeParse(formData);
  if (!result.success) return { error: "Données invalides" };
  const { email, nom, prenom, telephone, poste, ...acces } = result.data;

  try {
    const count = await dbAdmin.collection(USERS_COLLECTION_NAME).count().get();
    if (count.data().count >= MAX_UTILISATEURS) {
      return { error: `Limite atteinte : ${MAX_UTILISATEURS} comptes au maximum.` };
    }

    const existant = await authAdmin.getUserByEmail(email).catch(() => null);
    if (existant) return { error: "Un utilisateur avec cet email existe déjà" };

    const userRecord = await authAdmin.createUser({
      email,
      displayName: `${prenom} ${nom}`,
      // Mot de passe jetable : l'employé choisit le sien via l'email de réinitialisation.
      password: randomBytes(12).toString("base64url") + "Aa1!",
      emailVerified: false,
      ...(telephone ? { phoneNumber: telephone } : {}),
    });

    const claims = claimsPour(acces);
    await authAdmin.setCustomUserClaims(userRecord.uid, claims);

    await dbAdmin
      .collection(USERS_COLLECTION_NAME)
      .doc(userRecord.uid)
      .set({
        email,
        nom,
        prenom,
        telephone: telephone || "",
        poste: poste || "",
        ...claims,
        disabled: false,
        createdAt: new Date().toISOString(),
      });

    await sendPasswordResetEmail(auth, email);

    return {
      success: true,
      message: "Utilisateur créé. Un email lui a été envoyé pour choisir son mot de passe.",
      userId: userRecord.uid,
    };
  } catch (error: unknown) {
    return messageErreur(error, "Erreur lors de la création de l'utilisateur");
  }
}

export async function updateUserAction(userId: string, formData: UpdateUserInput) {
  const admin = await requireAdmin();
  if ("error" in admin) return admin;

  const result = updateUserSchema.safeParse(formData);
  if (!result.success) return { error: "Données invalides" };
  const { email, nom, prenom, telephone, poste, disabled, role, droits, speciales, sites } =
    result.data;

  try {
    const cible = await authAdmin.getUser(userId);
    const claimsActuels = (cible.customClaims ?? {}) as AccesDemande;

    await authAdmin.updateUser(userId, {
      ...(nom && prenom ? { displayName: `${prenom} ${nom}` } : {}),
      ...(email ? { email } : {}),
      ...(telephone !== undefined ? { phoneNumber: telephone || null } : {}),
      ...(disabled !== undefined ? { disabled } : {}),
    });

    const changeAcces = [role, droits, speciales, sites].some((v) => v !== undefined);
    const claims = changeAcces
      ? claimsPour({
          role: role ?? claimsActuels.role ?? "user",
          droits: droits ?? claimsActuels.droits,
          speciales: speciales ?? claimsActuels.speciales,
          sites: sites ?? claimsActuels.sites,
        })
      : null;

    if (claims) {
      await authAdmin.setCustomUserClaims(userId, claims);
      // Les nouveaux droits s'appliquent tout de suite, pas dans une heure.
      await authAdmin.revokeRefreshTokens(userId);
    }

    await dbAdmin
      .collection(USERS_COLLECTION_NAME)
      .doc(userId)
      .update({
        updatedAt: new Date().toISOString(),
        ...(email ? { email } : {}),
        ...(nom ? { nom } : {}),
        ...(prenom ? { prenom } : {}),
        ...(telephone !== undefined ? { telephone } : {}),
        ...(poste !== undefined ? { poste } : {}),
        ...(disabled !== undefined ? { disabled } : {}),
        ...(claims
          ? {
              role: claims.role,
              droits: claims.droits ?? FieldValue.delete(),
              speciales: claims.speciales ?? FieldValue.delete(),
              sites: claims.sites ?? FieldValue.delete(),
            }
          : {}),
      });

    return { success: true, message: "Utilisateur mis à jour" };
  } catch (error: unknown) {
    return messageErreur(error, "Erreur lors de la mise à jour de l'utilisateur");
  }
}
