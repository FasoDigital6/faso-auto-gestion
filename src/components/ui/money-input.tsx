"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  className?: string;
  hideCurrency?: boolean;
}

/**
 * MoneyInput - Input formaté pour les montants monétaires
 *
 * Fonctionnalités:
 * - Formatage automatique avec séparateurs de milliers (espaces)
 * - Affichage du symbole de devise
 * - Accepte uniquement les chiffres
 * - Conversion automatique entre valeur affichée et valeur numérique
 *
 * @example
 * <MoneyInput
 *   value={1000000}
 *   onChange={(value) => setMontant(value)}
 *   currency="GNF"
 *   placeholder="Entrez le montant"
 * />
 */
export function MoneyInput({
  value,
  onChange,
  currency = "GNF",
  className,
  disabled,
  placeholder = "0",
  hideCurrency = false,
  ...props
}: MoneyInputProps) {
  const [displayValue, setDisplayValue] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);

  // Formater le nombre avec des espaces comme séparateurs de milliers
  const formatNumber = (num: number): string => {
    if (isNaN(num) || num === 0) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  // Retirer les espaces et convertir en nombre
  const parseNumber = (str: string): number => {
    const cleaned = str.replace(/\s/g, "");
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  };

  // Mettre à jour l'affichage quand la valeur change
  React.useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumber(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Permettre uniquement les chiffres et les espaces
    const cleaned = inputValue.replace(/[^\d\s]/g, "");

    // Mettre à jour l'affichage
    setDisplayValue(cleaned);

    // Convertir et envoyer la valeur numérique
    const numericValue = parseNumber(cleaned);
    onChange(numericValue);
  };

  const handleFocus = () => {
    // Le texte affiché ne change pas au focus : le remplacer annulait la
    // sélection posée par le navigateur (Tab, clic), et la saisie s'ajoutait
    // alors à l'ancien montant (500 000 → 500 000 600 000).
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Au blur, formater la valeur
    setDisplayValue(formatNumber(value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Permettre: backspace, delete, tab, escape, enter
    if (
      ["Backspace", "Delete", "Tab", "Escape", "Enter"].includes(e.key) ||
      // Permettre: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
      (e.ctrlKey && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) ||
      // Permettre: home, end, left, right
      ["Home", "End", "ArrowLeft", "ArrowRight"].includes(e.key)
    ) {
      return;
    }

    // Bloquer tout ce qui n'est pas un chiffre
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Input
          {...props}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "font-mono tabular-nums text-right",
            className
          )}
        />
      </div>
      {!hideCurrency && (
        <span className="text-sm text-muted-foreground font-medium shrink-0 min-w-[32px]">
          {currency}
        </span>
      )}
    </div>
  );
}
