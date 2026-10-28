import { dirname } from "path";
import { readdirSync } from "fs";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// ---------------------------------------------------------------------------
// Frontières d'import (voir docs/architecture.md).
// Sens des dépendances : app → features → components / data → domain, lib.
// Chaque couche a son propre bloc, sur des fichiers disjoints : en flat config,
// un bloc postérieur remplace les options d'une même règle au lieu de les fusionner.
// ---------------------------------------------------------------------------

const features = readdirSync(`${__dirname}/src/features`, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name);

// Chaque interdiction est une expression régulière sur le spécificateur d'import.
const interdit = (regex, message) => ({ regex, message });
const regles = (...patterns) => ({ "no-restricted-imports": ["error", { patterns }] });

const versFeatureInterne = interdit(
  "^@/features/[^/]+/(?!pdf$).+",
  "Importer une feature par son API publique : @/features/<x> (index.ts) ou @/features/<x>/pdf.",
);
const versFeature = interdit("^@/features(/|$)", "Cette couche ne dépend d'aucune feature.");
const versData = interdit("^@/data(/|$)", "Cette couche n'accède pas aux données : passer par une feature.");
const versServer = interdit("^@/server(/|$)", "Code serveur : réservé à src/server, aux routes API et aux layouts racine.");
const versServerHorsActions = interdit(
  "^@/server(/(?!actions/)|$)",
  "Côté client, n'appeler que des actions serveur (@/server/actions).",
);
const versApp = interdit("^@/app(/|$)", "src/app ne contient que des routes ; rien ne l'importe.");
const versComposants = interdit("^@/components(/|$)", "Cette couche n'importe pas de composants React.");

const LAYOUTS_RACINE = ["src/app/layout.tsx", "src/app/admin/layout.tsx", "src/app/(dashboard)/layout.tsx", "src/app/icon.tsx"];

const frontieres = [
  // domain : logique métier pure. Ni React, ni Next, ni Firebase (sauf `import type`), ni le reste de src.
  {
    files: ["src/domain/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            interdit("^(react|react-dom|next)(/|$)", "src/domain est pur : pas de React ni de Next."),
            {
              group: ["firebase", "firebase/*", "firebase-admin", "firebase-admin/*"],
              allowTypeImports: true,
              message: "src/domain est pur : Firebase seulement en `import type`.",
            },
            interdit("^@/(?!domain(/|$))", "src/domain n'importe que src/domain."),
          ],
        },
      ],
    },
  },
  // lib : utilitaires techniques génériques.
  { files: ["src/lib/**/*.{ts,tsx}"], rules: regles(interdit("^@/(?!lib/)", "src/lib est générique : il n'importe rien d'autre de src.")) },
  // data : accès Firestore côté client ; appelle les actions serveur, jamais l'UI.
  { files: ["src/data/**/*.{ts,tsx}"], rules: regles(versFeature, versComposants, versServerHorsActions, versApp) },
  // server : n'utilise des features que leurs gabarits PDF.
  {
    files: ["src/server/**/*.{ts,tsx}"],
    rules: regles(
      interdit("^@/features/(?![^/]+/pdf$)", "src/server n'utilise des features que leurs gabarits PDF (@/features/<x>/pdf)."),
      versData,
      versApp,
    ),
  },
  // components/ui et components/pdf : design system, sans données ni feature.
  { files: ["src/components/ui/**/*.{ts,tsx}", "src/components/pdf/**/*.{ts,tsx}"], rules: regles(versFeature, versData, versServer, versApp) },
  // components/patterns : gabarits réutilisables ; ils peuvent lire des données, jamais une feature.
  { files: ["src/components/patterns/**/*.{ts,tsx}"], rules: regles(versFeature, versServer, versApp) },
  // components/layout : structure de l'application ; assemble des widgets de features par leur API publique.
  { files: ["src/components/layout/**/*.{ts,tsx}"], rules: regles(versFeatureInterne, versServer, versApp) },
  // features : une feature n'entre pas dans une autre, seulement par son index.ts ou son pdf.ts.
  ...features.map((f) => ({
    files: [`src/features/${f}/**/*.{ts,tsx}`],
    rules: regles(
      interdit(
        `^@/features/(?!${f}/)[^/]+/(?!pdf$).+`,
        "Importer une autre feature par son API publique : @/features/<x> (index.ts) ou @/features/<x>/pdf.",
      ),
      interdit("^\\.\\./\\.\\./", "Pas d'import relatif qui sort de la feature : utiliser @/…"),
      versServerHorsActions,
      versApp,
    ),
  })),
  // app : des routes minces. Une page ou un layout de route ré-exporte une page de feature.
  {
    files: ["src/app/**/*.{ts,tsx}"],
    ignores: ["src/app/api/**", ...LAYOUTS_RACINE],
    rules: regles(
      interdit("^@/features/[^/]+(/(?!pages/).*)?$", "Une route ré-exporte une page : @/features/<x>/pages/<page>."),
      versData,
      versServer,
    ),
  },
  // Routes API : ré-exportent un handler de src/server/api.
  {
    files: ["src/app/api/**/*.{ts,tsx}"],
    rules: regles(interdit("^@/(?!server/api/)", "Une route API ré-exporte un handler de @/server/api.")),
  },
  // Layouts racine et icône : composition (fournisseurs de session, lecture de l'utilisateur côté serveur).
  {
    files: LAYOUTS_RACINE,
    rules: regles(
      versFeatureInterne,
      interdit("^@/data/(?!session/|query-provider$)", "Un layout racine n'utilise de data que les fournisseurs (session, React Query)."),
      interdit("^@/server/(?!auth/|firebase/)", "Un layout racine ne lit côté serveur que la session (server/auth, server/firebase)."),
    ),
  },
];

// ---------------------------------------------------------------------------
// Jetons du design system (voir docs/design-system.md) : pas de taille de police
// arbitraire ni de couleur hors jetons dans les classes Tailwind.
// Les gabarits PDF (@react-pdf, StyleSheet) ne sont pas concernés.
// ---------------------------------------------------------------------------
const PALETTE =
  "(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)";
const PREFIXES = "(text|bg|border|ring|outline|fill|stroke|from|via|to|divide|decoration|placeholder|caret|accent|shadow)";
const messagesJetons = [
  [`text-\\[[0-9.]+(px|rem|em)\\]`, "Taille de police arbitraire interdite : utiliser l'échelle (text-xs = 13 px minimum, text-sm, text-base…)."],
  [`\\b${PREFIXES}-${PALETTE}-[0-9]{2,3}\\b`, "Couleur de palette Tailwind interdite : utiliser les jetons (bg-success, text-destructive-ink, text-muted-foreground…)."],
  [`\\b${PREFIXES}-\\[#[0-9a-fA-F]{3,8}\\]`, "Couleur hexadécimale interdite : utiliser les jetons de globals.css."],
];
const selecteursJetons = messagesJetons.flatMap(([re, message]) => [
  { selector: `Literal[value=/${re}/]`, message },
  { selector: `TemplateElement[value.raw=/${re}/]`, message },
]);

const jetons = {
  files: ["src/**/*.{ts,tsx}"],
  ignores: [
    "src/**/pdf/**",
    "src/components/pdf/**",
    "src/lib/theme/**",
    // Dette connue (docs/dette-technique.md) : couleurs/tailles antérieures à la règle,
    // les corriger changerait le rendu. À traiter dans un chantier dédié.
    "src/components/ui/calendar.tsx",
    "src/features/depenses/components/depense-columns.tsx",
    "src/features/parametres/components/entreprise-parametres-form.tsx",
    "src/components/patterns/filters/status-options.ts",
    "src/domain/statuts/facture.ts",
    "src/domain/statuts/paiement.ts",
  ],
  rules: { "no-restricted-syntax": ["error", ...selecteursJetons] },
};

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  ...frontieres,
  jetons,
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      ".next-e2e/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      // Package Cloud Functions : build CommonJS séparé, avec son propre
      // tsconfig et sa propre chaîne de vérification (npm run build).
      "functions/lib/**",
      "functions/node_modules/**",
    ],
  },
];

export default eslintConfig;
