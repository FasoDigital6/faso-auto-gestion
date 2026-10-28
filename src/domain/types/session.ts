import type { UserInfo } from "firebase/auth";

/** Utilisateur connecté : identité Firebase plus les droits portés par les claims JWT. */
export interface User extends UserInfo {
  idToken: string;
  customToken: string;
  accessVersion?: string;
  role: string;
  /** Droits `MODULE:action` (absents pour un admin, qui a tout). */
  droits?: string[];
  /** Permissions spéciales : VOIR_COUTS, APPROUVER_PLANCHER, ANNULER. */
  speciales?: string[];
  /** Sites accessibles : CA, GN. */
  sites?: string[];
}

