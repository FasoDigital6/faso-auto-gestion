"use client";

import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { signInWithCustomToken, signOut } from "firebase/auth";
import { useQueryClient } from "@tanstack/react-query";

import { User } from "@/domain/types/session";
import { auth_client } from "@/data/firebase/client";

interface AuthProviderProps {
  user: User | null;
  children: React.ReactNode;
}

export const AuthProvider: React.FunctionComponent<AuthProviderProps> = ({
  user,
  children,
}) => {
  const queryClient = useQueryClient();

  // Ré-authentifie le SDK client Firebase à partir du custom token porté par la
  // session serveur (cookie). Sans ça, les requêtes Firestore côté client sont
  // anonymes et refusées par les règles (request.auth == null). Tant que
  // `signInWithCustomToken` n'a pas abouti, le SDK client est anonyme : les hooks
  // de données attendent ce drapeau (`useClientAuthReady`) plutôt que de tirer
  // une première salve vouée à échouer.
  const [isClientAuthReady, setIsClientAuthReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const customToken = user?.customToken;

    if (!user || !customToken) {
      // Pas de session serveur → s'assurer que le client est déconnecté.
      if (auth_client.currentUser) {
        signOut(auth_client).catch(() => {});
      }
      setIsClientAuthReady(true);
      return;
    }

    // Le SDK restaure sa session depuis IndexedDB de façon asynchrone : sans
    // attendre `authStateReady`, `currentUser` vaut toujours null au premier
    // rendu et la reconnexion (1 à 2 allers-retours vers Google) était refaite
    // à chaque chargement de page. On ne la saute que si la session restaurée
    // porte le même compte ET les mêmes droits que la session serveur : un
    // changement de rôle ou de droits par l'admin est pris au rechargement.
    sessionClientAJour(user)
      .then((aJour) => {
        if (cancelled) return;
        if (aJour) return;
        return signInWithCustomToken(auth_client, customToken).then(() => {
          if (cancelled) return;
          // Les requêtes lancées avant l'authentification client ont pu échouer :
          // on refetch tout une fois le client authentifié.
          queryClient.invalidateQueries();
        });
      })
      .catch((error) => {
        console.error("Échec de l'authentification du SDK client:", error);
      })
      .finally(() => {
        // Même en échec : on débloque les hooks pour que l'erreur remonte à
        // l'écran au lieu de laisser un chargement infini.
        if (!cancelled) setIsClientAuthReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [user, queryClient]);

  return (
    <AuthContext.Provider value={user}>
      <ClientAuthReadyContext.Provider value={isClientAuthReady}>
        {children}
      </ClientAuthReadyContext.Provider>
    </AuthContext.Provider>
  );
};

/** Claims qui portent les droits (voir `firestore.rules`). */
const CLAIMS_DROITS = ["role", "droits", "speciales", "sites"];

/** Charge utile d'un JWT (sans vérification : le serveur l'a déjà vérifié). */
function chargeDuJeton(jeton: string): Record<string, unknown> {
  const base64 = jeton.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "=")));
}

/**
 * La session restaurée par le SDK client correspond-elle à la session serveur :
 * même compte et mêmes claims de droits que le jeton vérifié par le serveur ?
 * Lit le jeton client en cache ; un appel réseau seulement s'il a expiré.
 */
async function sessionClientAJour(user: User): Promise<boolean> {
  await auth_client.authStateReady();
  const courant = auth_client.currentUser;
  if (!courant || courant.uid !== user.uid || !user.idToken) return false;
  const serveur = chargeDuJeton(user.idToken);
  const { claims } = await courant.getIdTokenResult();
  return CLAIMS_DROITS.every(
    (c) => JSON.stringify(claims[c] ?? null) === JSON.stringify(serveur[c] ?? null)
  );
}

const AuthContext = createContext<User | null>(null);

export const useAuth = () => useContext(AuthContext);

/** Le SDK client Firebase a fini sa ré-authentification (succès ou échec). */
const ClientAuthReadyContext = createContext(false);

export const useClientAuthReady = () => useContext(ClientAuthReadyContext);
