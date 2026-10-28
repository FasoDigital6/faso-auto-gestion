import { format } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Import et ré-export de la fonction de formatage depuis la configuration centralisée
 */
import { formatCurrency as formatMontant } from "@/domain/monnaie";

export { formatMontant };

/**
 * Formate une date en français
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "dd MMM yyyy", { locale: fr });
}

/**
 * Statistiques pour un type de document
 */
export interface DocumentStats {
  total: number;
  parStatut: Record<string, number>;
}
