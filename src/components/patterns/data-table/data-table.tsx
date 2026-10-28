"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Combobox } from "@/components/ui/combobox";
import { Columns3, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Loader2, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Meta attendu sur chaque `ColumnDef` : `className` pour le style de cellule,
 * et `hideBelow` pour masquer une colonne secondaire sous un certain
 * breakpoint plutôt que de forcer un défilement horizontal pour tout voir.
 * Les colonnes essentielles (identifiant, montant, actions) doivent rester
 * visibles à toutes les tailles.
 */
type DataTableColumnMeta = {
  className?: string;
  hideBelow?: "sm" | "md" | "lg";
  /** Libellé affiché dans la carte mobile (sinon déduit de l'en-tête de colonne). */
  label?: string;
};

const hideBelowClass: Record<NonNullable<DataTableColumnMeta["hideBelow"]>, string> = {
  sm: "hidden sm:table-cell",
  md: "hidden md:table-cell",
  lg: "hidden lg:table-cell",
};

function getColumnMetaClassName(meta: unknown): string {
  const m = meta as DataTableColumnMeta | undefined;
  return cn(m?.hideBelow && hideBelowClass[m.hideBelow], m?.className);
}


/** Texte brut d'un nœud React (pour retrouver le libellé d'un en-tête défini par une fonction). */
function texteDe(node: React.ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(texteDe).join(" ").trim();
  if (React.isValidElement(node)) return texteDe((node.props as { children?: React.ReactNode }).children);
  return "";
}

function libelleColonne<TData>(column: { id: string; columnDef: ColumnDef<TData, unknown> }, headerContext: unknown): string {
  const meta = column.columnDef.meta as DataTableColumnMeta | undefined;
  if (meta?.label) return meta.label;
  const header = column.columnDef.header;
  if (typeof header === "string") return header;
  if (typeof header === "function") {
    try {
      return texteDe((header as (ctx: unknown) => React.ReactNode)(headerContext));
    } catch {
      return "";
    }
  }
  return "";
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumn?: string;
  filterPlaceholder?: string;
  filters?: React.ReactNode;
  onRowClick?: (row: TData) => void;
  initialColumnVisibility?: VisibilityState;
  globalFilterFn?: (row: TData, filterValue: string) => boolean;
  useGlobalFilter?: boolean;
  /**
   * Pagination côté serveur : la page tient la recherche (envoyée à
   * Firestore) et charge la suite à la demande. `data` contient toutes les
   * lignes déjà chargées ; la pagination locale est remplacée par « Charger plus ».
   */
  serveur?: {
    recherche: string;
    onRechercheChange: (valeur: string) => void;
    aSuivant: boolean;
    chargerSuivant: () => void;
    chargementSuivant: boolean;
  };
}

export function DataTable<TData, TValue>({
  columns,
  data,
  filterColumn,
  filterPlaceholder = "Rechercher...",
  filters,
  onRowClick,
  initialColumnVisibility = {},
  globalFilterFn,
  useGlobalFilter = false,
  serveur,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>(initialColumnVisibility);
  const [rowSelection, setRowSelection] = React.useState({});

  // Filtrer les données avec la fonction de filtre globale personnalisée
  const filteredData = React.useMemo(() => {
    if (!useGlobalFilter || !globalFilter || !globalFilterFn) {
      return data;
    }
    return data.filter((row) => globalFilterFn(row, globalFilter));
  }, [data, globalFilter, globalFilterFn, useGlobalFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    ...(serveur ? {} : { getPaginationRowModel: getPaginationRowModel() }),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    initialState: {
      pagination: {
        pageSize: 10, // Taille de page par défaut
      },
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      <div className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:flex-wrap sm:gap-2">
        {serveur ? (
          <Input
            type="search"
            placeholder={filterPlaceholder}
            value={serveur.recherche}
            onChange={(event) => serveur.onRechercheChange(event.target.value)}
            className="w-full sm:max-w-sm"
          />
        ) : useGlobalFilter ? (
          <Input
            placeholder={filterPlaceholder}
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="w-full sm:max-w-sm"
          />
        ) : (
          filterColumn && (
            <Input
              placeholder={filterPlaceholder}
              value={
                (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table.getColumn(filterColumn)?.setFilterValue(event.target.value)
              }
              className="w-full sm:max-w-sm"
            />
          )
        )}
        {filters}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="ml-auto hidden sm:inline-flex" aria-label="Colonnes affichées">
              <Columns3 />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile : une carte par ligne, jamais de défilement horizontal */}
      <ul className="space-y-3 md:hidden">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const cellules = row.getVisibleCells().filter((c) => c.column.id !== "select");
            const [principale, ...autres] = cellules.filter((c) => c.column.id !== "actions");
            const actions = cellules.find((c) => c.column.id === "actions");
            const entetes = table.getHeaderGroups()[0]?.headers ?? [];
            return (
              <li
                key={row.id}
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.closest('button, a, [role="menuitem"], [role="button"], input, select')) return;
                  onRowClick?.(row.original);
                }}
                className={cn("rounded-lg border bg-card p-4", onRowClick && "cursor-pointer active:bg-accent/40")}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 font-semibold">
                    {principale && flexRender(principale.column.columnDef.cell, principale.getContext())}
                  </div>
                  {actions && (
                    <div className="shrink-0">{flexRender(actions.column.columnDef.cell, actions.getContext())}</div>
                  )}
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  {autres.map((cell) => {
                    const entete = entetes.find((h) => h.column.id === cell.column.id);
                    const libelle = entete
                      ? libelleColonne(cell.column as never, entete.getContext())
                      : "";
                    return (
                      <div key={cell.id} className="min-w-0">
                        {libelle && <dt className="text-muted-foreground">{libelle}</dt>}
                        <dd className="min-w-0 break-words">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </li>
            );
          })
        ) : (
          <li className="flex flex-col items-center gap-3 rounded-lg border bg-card px-6 py-12 text-center">
            <SearchX className="size-6 text-muted-foreground" />
            <div>
              <p className="font-semibold">Aucun résultat</p>
              <p className="mt-1 text-muted-foreground">
                Aucune ligne ne correspond à votre recherche ou à vos filtres.
              </p>
            </div>
          </li>
        )}
      </ul>

      <div className="hidden overflow-x-auto rounded-lg border bg-card md:block">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className={getColumnMetaClassName(header.column.columnDef.meta)}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={(e) => {
                    // Ne pas déclencher si on clique sur un bouton ou un autre élément interactif
                    // Cela évite la navigation intempestive lors de la suppression ou du changement de statut
                    const target = e.target as HTMLElement;
                    if (target.closest('button, a, [role="menuitem"], [role="button"], input, select')) {
                      return;
                    }
                    onRowClick?.(row.original);
                  }}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={getColumnMetaClassName(cell.column.columnDef.meta)}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="p-0">
                  <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                      <SearchX className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Aucun résultat</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Aucune ligne ne correspond à votre recherche ou à vos filtres.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {serveur ? (
        <div className="flex flex-col items-center gap-2 px-2 py-4">
          <p className="text-sm text-muted-foreground">
            {data.length} ligne{data.length > 1 ? "s" : ""} affichée{data.length > 1 ? "s" : ""}
          </p>
          {serveur.aSuivant && (
            <Button variant="outline" onClick={serveur.chargerSuivant} disabled={serveur.chargementSuivant}>
              {serveur.chargementSuivant && <Loader2 className="animate-spin" />}
              Charger plus
            </Button>
          )}
        </div>
      ) : (
      /* Pagination améliorée */
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-2 py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length > 0 && (
            <span>
              {table.getFilteredSelectedRowModel().rows.length} sur{" "}
              {table.getFilteredRowModel().rows.length} ligne(s) sélectionnée(s).
            </span>
          )}
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <p className="hidden sm:block text-sm font-medium">Lignes par page</p>
            <Combobox
              options={[
                ...[10, 20, 30, 40, 50].map((pageSize) => ({ value: `${pageSize}`, label: String(pageSize) })),
              ]}
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
              placeholder={String(table.getState().pagination.pageSize)}
              className="w-20"
            />
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="outline"
              size="icon" className="hidden md:inline-flex"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Aller à la première page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Page précédente</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="num whitespace-nowrap px-1 text-sm font-medium">
              {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Page suivante</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon" className="hidden md:inline-flex"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Aller à la dernière page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
