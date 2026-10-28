import { ElementType } from "react";

import { Module } from "@/domain/permissions/permissions";

export type ItemNav = {
  name?: string;
  slug: string;
  description?: string;
  icon?: ElementType;
  /** Module qui ouvre la page (droit « voir »). Absent = toujours visible. */
  module?: Module;
  /** Réservé aux administrateurs (utilisateurs, paramètres). */
  adminSeulement?: boolean;
};
