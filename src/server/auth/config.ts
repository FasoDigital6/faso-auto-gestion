import { getApps, initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";

const serverConfig = {
    useSecureCookies: process.env.USE_SECURE_COOKIES === "true",
    firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    serviceAccount: process.env.SERVICE_ACCOUNT_PRIVATE_KEY
        ? {
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
            clientEmail: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL!,
            privateKey: process.env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(
                /\\n/g,
                "\n"
            )!,
        }
        : undefined,
};

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

//verify if the the app is already initialized
let app = getApps().length > 0 ? getApps()[0] : null;
if (!app) {
    app = initializeApp(firebaseConfig);
}
export const auth = getAuth(app);

// Tests E2E : le login côté serveur passe aussi par l'émulateur Auth.
if (process.env.NEXT_PUBLIC_EMULATOR === "true" && !auth.emulatorConfig) {
  const host = process.env.NEXT_PUBLIC_EMULATOR_HOST || "127.0.0.1";
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
}

export const authConfig = {
    apiKey: serverConfig.firebaseApiKey,
    cookieName: process.env.AUTH_COOKIE_NAME!,
    cookieSignatureKeys: [
        process.env.COOKIE_SECRET_CURRENT!,
        process.env.COOKIE_SECRET_PREVIOUS!,
    ],
    cookieSerializeOptions: {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production" || serverConfig.useSecureCookies,
        sameSite: "lax" as const,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
    },
    serviceAccount: serverConfig.serviceAccount,
    // Génère un custom token stocké dans le cookie de session, afin que le SDK
    // client Firebase puisse se ré-authentifier (signInWithCustomToken) et que
    // les lectures Firestore client portent les claims du tenant.
    enableCustomToken: true,
    debug: process.env.NODE_ENV !== "production",
};

