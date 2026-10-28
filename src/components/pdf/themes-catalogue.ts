/**
 * Catalogue des modèles d'impression PDF : identifiants et libellés, sans
 * dépendance au moteur PDF. Les paramètres l'importent pour le sélecteur sans
 * charger `@react-pdf/renderer` ; les styles sont dans `themes.ts`.
 */

export type PdfThemeId = "sobre" | "moderne" | "classique" | "elegant";

type PdfThemeMeta = {
  id: PdfThemeId;
  nom: string;
  description: string;
};

/** Liste ordonnée pour le sélecteur dans les paramètres. */
export const PDF_THEMES: PdfThemeMeta[] = [
  {
    id: "sobre",
    nom: "Sobre",
    description: "En-tête avec bloc informations + destinataire, tableau bleu-gris, totaux encadrés.",
  },
  {
    id: "moderne",
    nom: "Moderne",
    description: "En-tête de tableau et total en couleur, lignes alternées.",
  },
  {
    id: "classique",
    nom: "Classique",
    description: "Cadres et bordures, palette feutrée. Formel et corporate.",
  },
  {
    id: "elegant",
    nom: "Élégant",
    description: "Beaucoup d'espace, typo aérée, un fin filet d'accent.",
  },
];

export const DEFAULT_PDF_THEME_ID: PdfThemeId = "sobre";

export function isPdfThemeId(value: unknown): value is PdfThemeId {
  return (
    value === "sobre" ||
    value === "moderne" ||
    value === "classique" ||
    value === "elegant"
  );
}
