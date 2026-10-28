"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface QuantityInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number;
  onChange: (value: number) => void;
  /** Valeur considérée comme "par défaut" : affichée en placeholder plutôt qu'en contenu réel. */
  defaultValue?: number;
  className?: string;
}

/**
 * QuantityInput - Input de quantité qui masque la valeur par défaut (1)
 * pour l'afficher en placeholder, comme MoneyInput le fait pour 0.
 * Évite d'avoir à sélectionner/effacer le "1" pré-rempli avant de saisir
 * la vraie quantité.
 *
 * @example
 * <QuantityInput value={1} onChange={(value) => setQuantite(value)} />
 */
export function QuantityInput({
  value,
  onChange,
  defaultValue = 1,
  className,
  disabled,
  placeholder,
  ...props
}: QuantityInputProps) {
  const [displayValue, setDisplayValue] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);

  const formatNumber = (num: number): string => {
    if (isNaN(num) || num === defaultValue) return "";
    return num.toString();
  };

  React.useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumber(value));
    }
  }, [value, isFocused]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setDisplayValue(inputValue);

    const numericValue = parseFloat(inputValue);
    onChange(isNaN(numericValue) ? defaultValue : numericValue);
  };

  const handleFocus = () => {
    setIsFocused(true);
    setDisplayValue(value !== defaultValue ? value.toString() : "");
  };

  const handleBlur = () => {
    setIsFocused(false);
    setDisplayValue(formatNumber(value));
  };

  return (
    <Input
      {...props}
      type="number"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      disabled={disabled}
      placeholder={placeholder ?? defaultValue.toString()}
      className={cn(className)}
    />
  );
}
