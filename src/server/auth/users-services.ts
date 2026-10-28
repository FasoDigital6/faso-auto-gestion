import { cache } from "react";
import type { User } from "@/domain/types/session";
import { authAdmin } from "@/server/firebase/admin";
import { getVerifiedSession } from "./session";

export const getCurrentUser = cache(async (): Promise<User | null> => {
  const session = await getVerifiedSession();
  if (!session) return null;
  const { decoded, profile, token } = session;
  return {
    uid: decoded.uid,
    email: decoded.email ?? null,
    displayName: [profile.prenom, profile.nom].filter(Boolean).join(" ") || decoded.name || null,
    photoURL: decoded.picture ?? null,
    phoneNumber: decoded.phone_number ?? null,
    providerId: decoded.firebase.sign_in_provider,
    idToken: token,
    // Aucun ancien claim injecté : Firebase applique les droits actuels du compte.
    customToken: await authAdmin.createCustomToken(decoded.uid),
    role: decoded.role,
    droits: decoded.droits,
    speciales: decoded.speciales,
    sites: decoded.sites,
    accessVersion: decoded.accessVersion ?? "0",
  };
});
