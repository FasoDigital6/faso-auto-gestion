"use client";

import clsx from "clsx";
import type { ElementType } from "react";

export type StatStripTone = "brand" | "success" | "warning" | "destructive" | "neutral";

export type StatStripItem = {
  key: string;
  label: string;
  value: number | string;
  icon: ElementType;
  tone?: StatStripTone;
  /** Valeur du filtre `status` associée : la tuile devient cliquable (re-clic = retire le filtre). */
  filterValue?: string;
};

const TONE_BAR: Record<StatStripTone, string> = {
  brand: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  neutral: "bg-border",
};

/**
 * Chiffres clés d'une liste : une tuile par statut, le chiffre en grand et le
 * libellé dessous. Une tuile avec `filterValue` filtre la liste au clic.
 */
export function StatStrip({
  items,
  activeFilter,
  onFilterChange,
}: {
  items: StatStripItem[];
  activeFilter?: string | null;
  onFilterChange?: (value: string | null) => void;
}) {
  return (
    <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-[repeat(auto-fit,minmax(10rem,1fr))] sm:overflow-visible sm:px-0">
      {items.map((item) => {
        const tone = item.tone ?? "neutral";
        const clickable = item.filterValue !== undefined && !!onFilterChange;
        const isActive = clickable && activeFilter === item.filterValue;
        const contenu = (
          <>
            <span aria-hidden className={clsx("absolute inset-y-3 left-0 w-1 rounded-r-full", TONE_BAR[tone])} />
            <span className="num !text-left font-serif text-2xl font-semibold">{item.value}</span>
            <span className="text-sm text-muted-foreground">{item.label}</span>
          </>
        );
        const classes = clsx(
          "relative flex w-full flex-col gap-0.5 rounded-lg border bg-card py-3 pl-5 pr-3 text-left transition-colors",
          isActive && "border-primary ring-1 ring-primary"
        );

        return (
          <li key={item.key} className="min-w-36 shrink-0 snap-start sm:min-w-0">
            {clickable ? (
              <button
                type="button"
                onClick={() => onFilterChange!(isActive ? null : item.filterValue!)}
                aria-pressed={isActive}
                title={isActive ? "Retirer le filtre" : `Filtrer : ${item.label}`}
                className={clsx(classes, !isActive && "hover:bg-accent/40")}
              >
                {contenu}
              </button>
            ) : (
              <div className={classes}>{contenu}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
