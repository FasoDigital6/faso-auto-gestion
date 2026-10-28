import { cookies } from "next/headers";


import { User } from "@/domain/types/session";
import { authConfig } from "@/server/auth/config";
import { authAdmin } from "@/server/firebase/admin";
import { getTokens } from "next-firebase-auth-edge";

import { getUserDataById } from "./user-queries";

import { Tokens } from "next-firebase-auth-edge";
import { filterStandardClaims } from "next-firebase-auth-edge/lib/auth/claims";



const toUser = async ({ token, decodedToken }: Tokens): Promise<User> => {
    const {
        uid,
        email,
        picture: photoURL,
        email_verified: emailVerified,
        phone_number: phoneNumber,
        name: displayName,
        source_sign_in_provider: signInProvider,
    } = decodedToken;

    const customClaims = filterStandardClaims(decodedToken);

    // On régénère toujours le customToken côté serveur à partir des claims du
    // idToken vérifié, plutôt que de faire confiance au customToken du cookie :
    // lors du refresh automatique de l'idToken (next-firebase-auth-edge), la
    // lib régénère ce customToken SANS recopier les custom claims (role/droits/
    // speciales/sites), ce qui désauthentifie silencieusement le SDK client
    // Firestore ("Missing or insufficient permissions") après ~1h de session.
    const customToken = await authAdmin.createCustomToken(uid, customClaims);

    return {
        uid,
        email: email ?? null,
        displayName: displayName ?? null,
        photoURL: photoURL ?? null,
        phoneNumber: phoneNumber ?? null,
        providerId: signInProvider,
        idToken: token,
        customToken,
        role: customClaims.role as string,
        droits: customClaims.droits as string[] | undefined,
        speciales: customClaims.speciales as string[] | undefined,
        sites: customClaims.sites as string[] | undefined,
    };
};


/**
 * Gets the currently authenticated user with merged auth and database data
 * @returns Combined user information or null if not authenticated
 */
export async function getCurrentUser(): Promise<
    (User) | null
> {
    const tokens = await getTokens(await cookies(), {
        ...authConfig,
    });

    const user = tokens ? await toUser(tokens) : null;

    if (!user) {
        return null;
    }

    const userData = await getUserDataById(user.uid);

    // Merge auth user with database user data
    // Use the database email if the auth email is null
    return {
        ...user,
        ...userData,
        // Ensure email is never null after merging
        email: user.email || userData.email,
    };
}


