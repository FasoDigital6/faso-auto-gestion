import { generateKeyPairSync } from "node:crypto";

// Valeurs locales indépendantes de .env.local : aucune clé ni donnée réelle.
const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048,
  privateKeyEncoding: { type: "pkcs8", format: "pem" }, publicKeyEncoding: { type: "spki", format: "pem" } });

export const E2E_ENV = {
  NEXT_TELEMETRY_DISABLED: "1",
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: "demo-sacko-green",
  NEXT_PUBLIC_FIREBASE_API_KEY: "demo-local-api-key",
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: "demo-sacko-green.firebaseapp.com",
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: "demo-sacko-green.appspot.com",
  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: "123456789",
  NEXT_PUBLIC_FIREBASE_APP_ID: "1:123456789:web:e2e",
  NEXT_PUBLIC_EMULATOR: "true",
  NEXT_PUBLIC_EMULATOR_HOST: "127.0.0.1",
  FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9099",
  FIRESTORE_EMULATOR_HOST: "127.0.0.1:8080",
  GCLOUD_PROJECT: "demo-sacko-green",
  SERVICE_ACCOUNT_CLIENT_EMAIL: "local@demo-sacko-green.iam.gserviceaccount.com",
  SERVICE_ACCOUNT_PRIVATE_KEY: privateKey,
  AUTH_COOKIE_NAME: "e2e_session",
  COOKIE_SECRET_CURRENT: "e2e-secret-current-0123456789abcdef",
  COOKIE_SECRET_PREVIOUS: "e2e-secret-previous-0123456789abcdef",
  NEXT_DIST_DIR: ".next-e2e",
  NEXT_PUBLIC_SITE_URL: "http://localhost:3100",
  RESEND_API_KEY: "",
  RESEND_FROM_EMAIL: "",
};
