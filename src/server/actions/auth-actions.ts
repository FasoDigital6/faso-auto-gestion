"use server";

import { z } from "zod";
import { cookies, headers } from "next/headers";
import { signInWithEmailAndPassword, updatePassword } from "firebase/auth";
import { refreshCookiesWithIdToken } from "next-firebase-auth-edge/lib/next/cookies";
import { getVerifiedSession } from "@/server/auth/session";
import { auth, authConfig } from "@/server/auth/config";

const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(6),
});

export async function loginAction(formData: z.infer<typeof loginSchema>) {
    // 1. Validation
    const result = loginSchema.safeParse(formData);
    if (!result.success) return { error: "Données invalides" };

    const { email, password } = result.data;

    try {
        // 2. Authentification via Firebase Client SDK
        // Note: On utilise le SDK client ici car il gère le hachage du mot de passe
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // 3. Récupération du Token
        const idToken = await userCredential.user.getIdToken();

        // 4. Création du Cookie de Session (via next-firebase-auth-edge)
        await refreshCookiesWithIdToken(idToken, await headers(), await cookies(), authConfig);

        return { success: true };
    } catch (e) {
        return { error: "Email ou mot de passe incorrect." };
    }
}

const updatePasswordSchema = z.object({
    oldPassword: z.string().min(1, "L'ancien mot de passe est requis"),
    newPassword: z.string().min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères"),
    confirmPassword: z.string().min(1, "La confirmation du mot de passe est requise"),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
});

export async function updatePasswordAction(formData: z.infer<typeof updatePasswordSchema>) {
    const result = updatePasswordSchema.safeParse(formData);
    if (!result.success) {
        return { error: result.error.issues[0].message };
    }

    const { oldPassword, newPassword } = result.data;

    try {
        // 1. Récupérer l'utilisateur courant via les cookies
        const session = await getVerifiedSession();

        if (!session) {
            return { error: "Non authentifié" };
        }

        const email = session.decoded.email;
        if (!email) {
            return { error: "Impossible de récupérer l'email de l'utilisateur" };
        }

        // 2. Ré-authentifier l'utilisateur pour vérifier l'ancien mot de passe
        // On utilise le SDK client sur le serveur, ce qui est valide pour cette opération
        const userCredential = await signInWithEmailAndPassword(auth, email, oldPassword);

        // 3. Mettre à jour le mot de passe
        await updatePassword(userCredential.user, newPassword);

        return { success: true };
    } catch (e: unknown) {
        console.error("Erreur lors du changement de mot de passe:", e);
        const errorCode = (e as { code?: string }).code;
        if (errorCode === "auth/invalid-credential" || errorCode === "auth/wrong-password") {
            return { error: "L'ancien mot de passe est incorrect" };
        }
        if (errorCode === "auth/too-many-requests") {
            return { error: "Trop de tentatives échouées. Veuillez réessayer plus tard." };
        }
        return { error: "Une erreur est survenue lors du changement de mot de passe" };
    }
}
