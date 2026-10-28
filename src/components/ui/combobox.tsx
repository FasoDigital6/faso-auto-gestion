"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
  /** Texte secondaire affiché sous le libellé (référence, prix, adresse…). */
  hint?: string
  /** Mots supplémentaires pris en compte par la recherche (sans être affichés). */
  keywords?: string
  disabled?: boolean
}

export interface ComboboxProps {
  options: ComboboxOption[]
  value?: string | null
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  /** Si fourni, propose « Créer … » quand la saisie ne correspond à aucune option. */
  onCreate?: (saisie: string) => void
  createLabel?: (saisie: string) => string
  disabled?: boolean
  loading?: boolean
  invalid?: boolean
  id?: string
  className?: string
  "aria-label"?: string
}

/**
 * Sélecteur unique de l'application : recherche, option « Créer… » intégrée,
 * liste rendue en portail (jamais coupée par un conteneur à overflow), largeur
 * alignée sur le champ, lignes de 40 px (44 px en tactile).
 */
function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Sélectionner",
  searchPlaceholder = "Rechercher…",
  emptyText = "Aucun résultat",
  onCreate,
  createLabel = (saisie) => `Créer « ${saisie} »`,
  disabled,
  loading,
  invalid,
  id,
  className,
  "aria-label": ariaLabel,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [saisie, setSaisie] = React.useState("")
  const selected = options.find((o) => o.value === value)
  const saisieNette = saisie.trim()
  // Petite liste (statuts, périodes, pages…) : pas de champ de recherche, la liste suffit.
  const avecRecherche = options.length > 7 || !!onCreate
  const peutCreer =
    !!onCreate &&
    saisieNette.length > 0 &&
    !options.some((o) => o.label.toLowerCase() === saisieNette.toLowerCase())

  function fermer() {
    setOpen(false)
    setSaisie("")
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setSaisie("")
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid || undefined}
          aria-label={ariaLabel}
          disabled={disabled || loading}
          className={cn(
            "w-full justify-between px-3 font-normal",
            !selected && "text-muted-foreground",
            className
          )}
        >
          <span className="truncate">
            {loading ? "Chargement…" : selected ? selected.label : placeholder}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        collisionPadding={16}
        className="w-(--radix-popover-trigger-width) min-w-56 p-0"
      >
        <Command>
          {avecRecherche && (
            <CommandInput
              value={saisie}
              onValueChange={setSaisie}
              placeholder={searchPlaceholder}
            />
          )}
          {/* Dans un Dialog modal, la molette est bloquée : on la laisse passer à la liste. */}
          <CommandList className="max-h-64" onWheel={(e) => e.stopPropagation()}>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={`${option.label} ${option.hint ?? ""} ${option.keywords ?? ""}`}
                  disabled={option.disabled}
                  onSelect={() => {
                    onValueChange(option.value)
                    fermer()
                  }}
                >
                  <Check
                    className={cn(
                      "size-4 shrink-0",
                      option.value === value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{option.label}</span>
                    {option.hint && (
                      <span className="block truncate text-xs text-muted-foreground">
                        {option.hint}
                      </span>
                    )}
                  </span>
                </CommandItem>
              ))}
              {peutCreer && (
                <CommandItem
                  value={`__creer__ ${saisieNette}`}
                  forceMount
                  onSelect={() => {
                    onCreate?.(saisieNette)
                    fermer()
                  }}
                  className="text-brand-ink font-medium"
                >
                  <Plus className="size-4 shrink-0" />
                  <span className="truncate">{createLabel(saisieNette)}</span>
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export { Combobox }
