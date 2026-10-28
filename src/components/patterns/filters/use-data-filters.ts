import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  serializeFiltersToParams,
  parseFiltersFromParams,
} from "@/components/patterns/filters/url-filters";

export interface FilterValue {
  client?: string | null;
  status?: string | null;
  period?: {
    type: "week" | "month" | "year" | "custom";
    startDate?: Date;
    endDate?: Date;
  } | null;
  search?: string;
}

interface UseDataFiltersOptions {
  syncWithUrl?: boolean;
  initialFilters?: FilterValue;
}

interface UseDataFiltersResult {
  filters: FilterValue;
  setFilter: (key: keyof FilterValue, value: FilterValue[keyof FilterValue]) => void;
  clearFilter: (key: keyof FilterValue) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
  activeFiltersCount: number;
}

export function useDataFilters(
  options: UseDataFiltersOptions = {}
): UseDataFiltersResult {
  const { syncWithUrl = false, initialFilters = {} } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isUpdatingUrl = useRef(false);

  // Initialiser les filtres depuis l'URL si syncWithUrl est activé
  const [filters, setFilters] = useState<FilterValue>(() => {
    if (syncWithUrl && searchParams) {
      const urlFilters = parseFiltersFromParams(searchParams);
      return { ...initialFilters, ...urlFilters };
    }
    return initialFilters;
  });

  // Synchroniser les changements de searchParams avec l'état local
  // Uniquement pour la navigation navigateur (back/forward)
  useEffect(() => {
    if (!syncWithUrl || !searchParams || isUpdatingUrl.current) {
      isUpdatingUrl.current = false;
      return;
    }

    const urlFilters = parseFiltersFromParams(searchParams);
    const currentJson = JSON.stringify(filters);
    const urlJson = JSON.stringify(urlFilters);

    if (currentJson !== urlJson) {
      setFilters(urlFilters);
    }
  }, [searchParams, syncWithUrl]);

  // Fonction pour mettre à jour l'URL
  const updateUrl = (newFilters: FilterValue) => {
    if (!syncWithUrl) return;

    isUpdatingUrl.current = true;
    const params = serializeFiltersToParams(newFilters);
    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    router.replace(newUrl, { scroll: false });
  };

  const setFilter = (key: keyof FilterValue, value: FilterValue[keyof FilterValue]) => {
    const newFilters = {
      ...filters,
      [key]: value,
    };
    setFilters(newFilters);
    updateUrl(newFilters);
  };

  const clearFilter = (key: keyof FilterValue) => {
    const newFilters = { ...filters };
    delete newFilters[key];
    setFilters(newFilters);
    updateUrl(newFilters);
  };

  const clearAllFilters = () => {
    const newFilters = {};
    setFilters(newFilters);
    updateUrl(newFilters);
  };

  const activeFiltersCount = useMemo(() => {
    return Object.keys(filters).filter((key) => {
      const value = filters[key as keyof FilterValue];
      return value !== null && value !== undefined && value !== "";
    }).length;
  }, [filters]);

  const hasActiveFilters = activeFiltersCount > 0;

  return {
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters,
    activeFiltersCount,
  };
}
