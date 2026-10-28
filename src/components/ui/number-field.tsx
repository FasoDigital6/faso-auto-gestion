import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Champ numérique (quantités, prix, pourcentages...).
 *
 * Corrige deux irritants récurrents des formulaires B2B :
 *  - une valeur par défaut (0, 1...) qui oblige à la sélectionner/effacer
 *    avant de saisir le vrai montant → sélection automatique de tout le
 *    contenu au focus, le premier chiffre tapé la remplace directement
 *  - des champs trop étroits pour des montants GNF à 7-8 chiffres → largeur
 *    minimale garantie (les classes `w-*` passées par l'appelant restent
 *    acceptées, mais ne peuvent plus rendre le champ inutilisable)
 *
 * Compatible avec `register()` de react-hook-form (ref transmise via ...props,
 * React 19 la propage sans forwardRef) — remplacement direct de
 * `<Input type="number" />`.
 */
function NumberField({
  className,
  onFocus,
  ...props
}: React.ComponentProps<"input">) {
  return (
    <Input
      type="number"
      onFocus={(e) => {
        e.target.select();
        onFocus?.(e);
      }}
      className={cn("min-w-[7.5rem] text-right", className)}
      {...props}
    />
  );
}

export { NumberField };
