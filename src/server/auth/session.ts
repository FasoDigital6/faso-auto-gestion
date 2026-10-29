import { cookies } from "next/headers";
import { getTokens } from "next-firebase-auth-edge";

import { authConfig } from "@/server/auth/config";
import { authAdmin, dbAdmin } from "@/server/firebase/admin";
import { USERS_COLLECTION_NAME } from "@/domain/collections";

/** Vérification fraîche, y compris dans les actions serveur. Jamais les seuls cookies. */
export async function getVerifiedSession() {
  const tokens = await getTokens(await cookies(), authConfig);
  if (!tokens) return null;
  try {
    const decoded = await authAdmin.verifyIdToken(tokens.token, true);
    const profile = await dbAdmin.collection(USERS_COLLECTION_NAME).doc(decoded.uid).get();
    const data = profile.data();
    // La version bloque aussi les jetons émis dans la seconde de la révocation.
    if (!data || data.disabled || data.statut === "creation" || data.mutationEnCours ||
        (decoded.accessVersion ?? "0") !== (data.accessVersion ?? "0") ||
        !["admin", "user"].includes(decoded.role)) return null;
    return { token: tokens.token, decoded, profile: data };
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code?.startsWith("auth/")) return null;
    throw error;
  }
}

export async function requireAdmin() {
  const session = await getVerifiedSession();
  if (!session || session.decoded.role !== "admin") {
    throw new Error("Accès refusé : un compte administrateur actif est requis.");
  }
  return session.decoded.uid;
}
