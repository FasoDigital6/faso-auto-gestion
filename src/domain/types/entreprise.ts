/** Compte bancaire imprimé en pied de document. */
export type CompteBancaire = {
  banque: string;
  numero: string;
};

/**
 * Identité de Sacko-Vert Inc. sur les documents (factures, reçus, dossiers).
 * Un seul document de paramètres : il n'y a qu'une entreprise.
 */
export type Entreprise = {
  nom: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  telephone?: string;
  email?: string;
  /** Numéro d'inscription à la TPS, ex. 718120223RT0001. */
  numTps?: string;
  /** Numéro d'inscription à la TVQ, ex. 1232329960TQ0001. */
  numTvq?: string;
  logoUrl?: string;
  headerUrl?: string;
  piedDePage?: string;
  piedDePageImageUrl?: string;
  comptesBancaires?: CompteBancaire[];
  couleurPrimaire?: string;
  couleurImpression?: string;
};
