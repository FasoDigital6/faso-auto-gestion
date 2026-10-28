import { formaterDateSaisie, lireDateSaisie } from "@/lib/dates-saisie";
import type { FilterValue } from "@/components/patterns/filters/use-data-filters";

/**
 * Sérialise les filtres en paramètres URL
 */
export function serializeFiltersToParams(filters: FilterValue): URLSearchParams {
  const params = new URLSearchParams();

  // Statut
  if (filters.status) {
    params.set("status", filters.status);
  }

  // Client
  if (filters.client) {
    params.set("client", filters.client);
  }

  // Période
  if (filters.period?.startDate && filters.period?.endDate) {
    const startDate = formaterDateSaisie(filters.period.startDate);
    const endDate = formaterDateSaisie(filters.period.endDate);
    params.set("period", `${startDate},${endDate}`);
  }

  // Search
  if (filters.search) {
    params.set("search", filters.search);
  }

  return params;
}

/**
 * Parse les paramètres URL en objet FilterValue
 */
export function parseFiltersFromParams(params: URLSearchParams): FilterValue {
  const filters: FilterValue = {};

  // Statut
  const status = params.get("status");
  if (status) {
    filters.status = status;
  }

  // Client
  const client = params.get("client");
  if (client) {
    filters.client = client;
  }

  // Période
  const period = params.get("period");
  if (period) {
    const [startDateStr, endDateStr] = period.split(",");
    try {
      const startDate = lireDateSaisie(startDateStr) ?? new Date(NaN);
      const endDate = lireDateSaisie(endDateStr) ?? new Date(NaN);

      // Vérifier que les dates sont valides
      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        filters.period = {
          type: "custom",
          startDate,
          endDate,
        };
      } else {
        console.warn(`Invalid period parameter: ${period}. Expected format: YYYY-MM-DD,YYYY-MM-DD`);
      }
    } catch (error) {
      console.warn(`Error parsing period parameter: ${period}`, error);
    }
  }

  // Search
  const search = params.get("search");
  if (search) {
    filters.search = search;
  }

  return filters;
}
