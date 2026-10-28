import type { UserInfo } from "firebase/auth";

/** Utilisateur connecté : identité Firebase plus les droits portés par les claims JWT. */
export interface User extends UserInfo {
  idToken: string;
  customToken: string;
  role: string;
  /** Droits `MODULE:action` (absents pour un admin, qui a tout). */
  droits?: string[];
  /** Permissions spéciales : VOIR_COUTS, APPROUVER_PLANCHER, ANNULER. */
  speciales?: string[];
  /** Sites accessibles : CA, GN. */
  sites?: string[];
}

/** Document `users/{uid}` : fiche de l'employé, miroir des claims pour l'affichage. */
export interface userData {
  id: string;
  email: string;
  name: string;
  nom?: string;
  prenom?: string;
  telephone?: string;
  poste?: string;
  photoUrl?: string;
  role: string;
  droits?: string[];
  speciales?: string[];
  sites?: string[];
  disabled?: boolean;
  createdAt?: string;
}
