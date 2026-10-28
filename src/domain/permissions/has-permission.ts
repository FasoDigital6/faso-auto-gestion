import {
  ALL_SITES,
  Action,
  Module,
  Site,
  Speciale,
  droit,
} from "@/domain/permissions/permissions";

/** Ce qu'il faut savoir d'un compte pour décider d'un accès (claims JWT). */
export type AccesUtilisateur = {
  role: string;
  droits?: string[] | null;
  speciales?: string[] | null;
  sites?: string[] | null;
};

export function isAdmin(user: AccesUtilisateur | null | undefined): boolean {
  return user?.role === "admin";
}

/**
 * L'utilisateur peut-il faire `action` dans `module` ?
 *
 * Un admin peut tout. Pour un employé, « voir » est accordé dès qu'il a une
 * action quelconque sur le module : on ne modifie pas ce qu'on ne voit pas.
 */
export function peut(
  user: AccesUtilisateur | null | undefined,
  module: Module,
  action: Action
): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  const droits = user.droits ?? [];
  if (action === "voir") {
    return droits.some((d) => d.startsWith(`${module}:`));
  }
  return droits.includes(droit(module, action));
}

/** L'utilisateur a-t-il cette permission spéciale (voir les coûts, approuver, annuler) ? */
export function aSpeciale(
  user: AccesUtilisateur | null | undefined,
  speciale: Speciale
): boolean {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return (user.speciales ?? []).includes(speciale);
}

/** Sites auxquels l'utilisateur a accès. Un admin voit les deux. */
export function sitesDe(user: AccesUtilisateur | null | undefined): Site[] {
  if (!user) return [];
  if (isAdmin(user)) return ALL_SITES;
  return ALL_SITES.filter((site) => (user.sites ?? []).includes(site));
}

export function accedeAuSite(
  user: AccesUtilisateur | null | undefined,
  site: Site
): boolean {
  return sitesDe(user).includes(site);
}
