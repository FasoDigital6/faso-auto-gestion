/**
 * Droits d'accès de Sacko-Green (décisions Q21 et Q49).
 *
 * Deux rôles techniques : `admin` (tout, plus utilisateurs et paramètres) et
 * `user`. Un `user` reçoit, module par module, les actions qu'il peut faire,
 * un ou deux sites, et des permissions spéciales. Ces trois listes sont
 * stockées dans les custom claims JWT et relues telles quelles par les règles
 * Firestore : ne pas renommer une valeur sans migration.
 */

export type Role = "admin" | "user";

const ROLE_LABELS: Record<Role, string> = {
  admin: "Administrateur",
  user: "Employé",
};

/** Libellé d'affichage d'un rôle, « Employé » si absent ou inconnu. */
export function getRoleLabel(role?: string | null): string {
  return role === "admin" ? ROLE_LABELS.admin : ROLE_LABELS.user;
}

/** Modules métier attribuables à un employé. */
export enum Module {
  TABLEAU_DE_BORD = "TABLEAU_DE_BORD",
  VEHICULES = "VEHICULES",
  PRIX = "PRIX",
  CLIENTS = "CLIENTS",
  COMMANDES = "COMMANDES",
  PAIEMENTS = "PAIEMENTS",
  CONTENEURS = "CONTENEURS",
  DEDOUANEMENT = "DEDOUANEMENT",
  FINANCES = "FINANCES",
}

export const MODULE_LABELS: Record<Module, string> = {
  [Module.TABLEAU_DE_BORD]: "Tableau de bord",
  [Module.VEHICULES]: "Véhicules",
  [Module.PRIX]: "Prix et marges",
  [Module.CLIENTS]: "Clients",
  [Module.COMMANDES]: "Commandes",
  [Module.PAIEMENTS]: "Paiements",
  [Module.CONTENEURS]: "Conteneurs",
  [Module.DEDOUANEMENT]: "Dédouanement",
  [Module.FINANCES]: "Finances",
};

export const ALL_MODULES: Module[] = Object.values(Module);

/** Ce qu'un employé peut faire dans un module. */
export type Action = "voir" | "creer" | "modifier" | "supprimer";

export const ALL_ACTIONS: Action[] = ["voir", "creer", "modifier", "supprimer"];

export const ACTION_LABELS: Record<Action, string> = {
  voir: "Voir",
  creer: "Créer",
  modifier: "Modifier",
  supprimer: "Supprimer",
};

/** Droit stocké dans les claims : `MODULE:action`, par exemple `VEHICULES:modifier`. */
export type Droit = `${Module}:${Action}`;

export function droit(module: Module, action: Action): Droit {
  return `${module}:${action}`;
}

/** Permissions spéciales, hors modules. */
export enum Speciale {
  /** Voir les coûts d'achat et le coût de revient (Q50). */
  VOIR_COUTS = "VOIR_COUTS",
  /** Approuver une vente sous le prix plancher (Q20). */
  APPROUVER_PLANCHER = "APPROUVER_PLANCHER",
  /** Annuler un paiement, une vente ou une facture (Q38). */
  ANNULER = "ANNULER",
}

export const SPECIALE_LABELS: Record<Speciale, string> = {
  [Speciale.VOIR_COUTS]: "Voir les coûts d'achat",
  [Speciale.APPROUVER_PLANCHER]: "Approuver une vente sous le prix plancher",
  [Speciale.ANNULER]: "Annuler paiements, ventes et factures",
};

export const ALL_SPECIALES: Speciale[] = Object.values(Speciale);

/** Les deux sites de Sacko-Green (Q4). */
export type Site = "CA" | "GN";

export const ALL_SITES: Site[] = ["CA", "GN"];

export const SITE_LABELS: Record<Site, string> = {
  CA: "Canada",
  GN: "Guinée",
};

/** Ensemble des droits, permissions spéciales et sites d'un compte. */
export type Acces = {
  droits: Droit[];
  speciales: Speciale[];
  sites: Site[];
};

function tousLesDroits(modules: Module[], actions: Action[]): Droit[] {
  return modules.flatMap((module) => actions.map((action) => droit(module, action)));
}

/**
 * Modèles de départ proposés à la création d'un compte (Q21). L'admin peut
 * ensuite ajuster chaque droit.
 */
export const MODELES_ACCES = {
  vendeur: {
    libelle: "Vendeur",
    acces: {
      droits: [
        droit(Module.TABLEAU_DE_BORD, "voir"),
        droit(Module.VEHICULES, "voir"),
        ...tousLesDroits([Module.CLIENTS, Module.COMMANDES], ["voir", "creer", "modifier"]),
        ...tousLesDroits([Module.PAIEMENTS], ["voir", "creer"]),
      ],
      speciales: [],
      sites: ["CA"],
    },
  },
  agentGuinee: {
    libelle: "Agent Guinée",
    acces: {
      droits: [
        droit(Module.TABLEAU_DE_BORD, "voir"),
        ...tousLesDroits([Module.VEHICULES, Module.CONTENEURS, Module.DEDOUANEMENT], ["voir", "modifier"]),
        droit(Module.CLIENTS, "voir"),
      ],
      speciales: [],
      sites: ["GN"],
    },
  },
} as const satisfies Record<string, { libelle: string; acces: Acces }>;
