import { LayoutDashboard } from "lucide-react";

import { ItemNav } from "./nav-types";
import { Module } from "@/domain/permissions/permissions";

type NavSection = {
  name: string;
  items: ItemNav[];
};

/**
 * Navigation principale. Chaque entrée est une page et porte le module qui
 * l'ouvre : un compte ne voit que ce qu'il peut ouvrir. Chaque étape de
 * docs/decisions.md (section 13) ajoute ici les entrées de ses pages.
 */
export const navItems: NavSection[] = [
  {
    name: "",
    items: [
      {
        name: "Tableau de bord",
        slug: "",
        description: "Achats, ventes, stock, conteneurs en mer et créances.",
        icon: LayoutDashboard,
        module: Module.TABLEAU_DE_BORD,
      },
    ],
  },
];

/** Zone d'administration de la barre latérale (réservée aux admins). */
export const navFooterItems: ItemNav[] = [];
