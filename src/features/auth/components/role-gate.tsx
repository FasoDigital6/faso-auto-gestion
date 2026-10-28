"use client";

import { useAuth } from "@/data/session/auth-context";
import { aSpeciale, isAdmin, peut } from "@/domain/permissions/has-permission";
import { Action, Module, Speciale } from "@/domain/permissions/permissions";

interface AccesGateProps {
  children: React.ReactNode;
  /** Réservé aux administrateurs. */
  adminSeulement?: boolean;
  /** Droit requis : module et action. */
  module?: Module;
  action?: Action;
  /** Permission spéciale requise. */
  speciale?: Speciale;
  /** Contenu affiché sans l'accès (rien par défaut). */
  fallback?: React.ReactNode;
}

/**
 * Affiche son contenu seulement si l'utilisateur a l'accès demandé. C'est un
 * confort d'interface : la vraie barrière reste les règles Firestore et les
 * actions serveur.
 */
export function AccesGate({
  children,
  adminSeulement,
  module,
  action = "voir",
  speciale,
  fallback = null,
}: AccesGateProps) {
  const user = useAuth();
  if (!user) return fallback;
  if (adminSeulement && !isAdmin(user)) return fallback;
  if (module && !peut(user, module, action)) return fallback;
  if (speciale && !aSpeciale(user, speciale)) return fallback;
  return <>{children}</>;
}
