import { ItemNav } from "@/components/layout/nav-types";
import { AccesUtilisateur, isAdmin, peut } from "@/domain/permissions/has-permission";

/** L'entrée doit-elle apparaître pour ce compte ? */
export function isNavItemVisible(
  item: ItemNav,
  user: AccesUtilisateur | null | undefined
): boolean {
  if (!user) return false;
  if (item.adminSeulement) return isAdmin(user);
  return !item.module || peut(user, item.module, "voir");
}

/** Le lien correspond-il à la route active (ou l'une de ses sous-pages) ? */
function itemMatchesPath(item: ItemNav, pathname: string): boolean {
  if (item.slug === "") return pathname === "/";
  const href = `/${item.slug}`;
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Slug de l'entrée active : la correspondance la plus spécifique l'emporte. */
export function activeNavSlug(items: ItemNav[], pathname: string): string | null {
  let best: string | null = null;
  for (const item of items) {
    if (!itemMatchesPath(item, pathname)) continue;
    if (best === null || item.slug.length > best.length) best = item.slug;
  }
  return best;
}
