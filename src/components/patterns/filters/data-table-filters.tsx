"use client";

import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { ListFilter, X } from "lucide-react";

interface DataTableFiltersProps {
  children: ReactNode;
  onClearAll?: () => void;
  hasActiveFilters?: boolean;
  activeFiltersCount?: number;
}

/**
 * Barre de filtres. Sur mobile elle se replie derrière un bouton « Filtres »
 * (avec le nombre de filtres actifs) pour laisser la place à la liste.
 */
export function DataTableFilters({
  children,
  onClearAll,
  hasActiveFilters = false,
  activeFiltersCount = 0,
}: DataTableFiltersProps) {
  const [ouvert, setOuvert] = useState(false);

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
      <Button
        type="button"
        variant="outline"
        className="justify-between sm:hidden"
        aria-expanded={ouvert}
        onClick={() => setOuvert((o) => !o)}
      >
        <span className="flex items-center gap-2">
          <ListFilter className="size-4" />
          Filtres
          {activeFiltersCount > 0 && <span className="text-muted-foreground">({activeFiltersCount})</span>}
        </span>
      </Button>

      <div className={`${ouvert ? "flex" : "hidden"} flex-col gap-2 sm:flex sm:flex-row sm:flex-wrap sm:items-center`}>
        {children}
        {hasActiveFilters && onClearAll && (
          <Button variant="ghost" onClick={onClearAll} className="w-full sm:w-auto">
            <X className="mr-2 size-4" />
            Réinitialiser
            {activeFiltersCount > 0 && <span className="ml-1 text-muted-foreground">({activeFiltersCount})</span>}
          </Button>
        )}
      </div>
    </div>
  );
}
