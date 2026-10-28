import { getApps, initializeApp } from "firebase/app";

import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import configuration from "@/lib/configuration";

const { firebase } = configuration;

const app = getApps().length > 0 ? getApps()[0] : initializeApp(firebase);

export const db = getFirestore(app);
export const auth_client = getAuth(app);
export const storage = getStorage(app);

// Tests E2E : bascule sur les émulateurs locaux (NEXT_PUBLIC_EMULATOR=true).
// Sans cette variable, le comportement est inchangé.
if (configuration.emulator) {
  const host = configuration.emulatorHost || "127.0.0.1";
  if (!auth_client.emulatorConfig) {
    connectAuthEmulator(auth_client, `http://${host}:9099`, { disableWarnings: true });
  }
  try {
    connectFirestoreEmulator(db, host, 8080);
  } catch {
    // déjà connecté (rechargement à chaud)
  }
}
