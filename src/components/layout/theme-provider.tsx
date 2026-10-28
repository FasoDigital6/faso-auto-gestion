"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Préférence claire/sombre/système — personnelle à chaque utilisateur
 * (localStorage du navigateur), distincte de la couleur de marque de
 * l'entreprise qui elle est partagée par tous (cf. `couleurPrimaire`).
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
