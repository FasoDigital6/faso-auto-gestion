"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PercentInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
}

/**
 * PercentInput - Input formaté pour les pourcentages
 *
 * Fonctionnalités:
 * - Affichage automatique du symbole %
 * - Validation 0-100 par défaut (personnalisable)
 * - Accepte les décimales (ex: 19.5%)
 * - Formatage automatique
 *
 * @example
 * <PercentInput
 *   value={19.5}
 *   onChange={(value) => setTva(value)}
 *   placeholder="0"
 * />
 */
export function PercentInput({
  value,
  onChange,
  min = 0,
  max = 100,
  className,
  disabled,
  placeholder = "0",
  ...props
}: PercentInputProps) {
  const [displayValue, setDisplayValue] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);

  // Formater le nombre avec au maximum 2 décimales
  const formatNumber = (num: number): string => {
    if (isNaN(num) || num === 0) return "";
    // Arrondir à 2 décimales et retirer les zéros inutiles
    return parseFloat(num.toFixed(2)).toString();
  };

  // Convertir en nombre et valider
  const parseAndValidate = (str: string): number => {
    const num = parseFloat(str);
    if (isNaN(num)) return 0;

    // Valider les limites
    if (num < min) return min;
    if (num > max) return max;

    return num;
  };

  // Mettre à jour l'affichage quand la valeur change
  React.useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumber(value));
    }
  }, [value, isFocused]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    // Permettre uniquement les chiffres, point et virgule
    let cleaned = inputValue.replace(/[^\d.,]/g, "");

    // Remplacer virgule par point
    cleaned = cleaned.replace(",", ".");

    // Permettre un seul point décimal
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }

    // Limiter à 2 décimales
    if (parts.length === 2 && parts[1].length > 2) {
      cleaned = parts[0] + "." + parts[1].substring(0, 2);
    }

    // Mettre à jour l'affichage
    setDisplayValue(cleaned);

    // Convertir et envoyer la valeur numérique validée
    const numericValue = parseAndValidate(cleaned);
    onChange(numericValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    // En focus, afficher la valeur brute pour faciliter l'édition
    setDisplayValue(value > 0 ? value.toString() : "");
  };

  const handleBlur = () => {
    setIsFocused(false);
    // Au blur, formater et valider la valeur
    const validated = parseAndValidate(displayValue || "0");
    onChange(validated);
    setDisplayValue(formatNumber(validated));
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

    // Permettre le point et la virgule (pour les décimales)
    if (e.key === "." || e.key === ",") {
      // Vérifier qu'il n'y a pas déjà un point
      const input = e.currentTarget;
      if (input.value.includes(".")) {
        e.preventDefault();
      }
      return;
    }

    // Bloquer tout ce qui n'est pas un chiffre
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className="relative">
      <Input
        {...props}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        className={cn("pr-10", className)}
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <span className="text-sm text-muted-foreground font-medium">
          %
        </span>
      </div>
    </div>
  );
}
