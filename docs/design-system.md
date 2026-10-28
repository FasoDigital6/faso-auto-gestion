# Design system « Registre »

Interface sobre de registre comptable reprise de Faso Gestion : fond blanc, gris neutres, une seule couleur de marque (le vert du logo Sacko-Green), chiffres alignés. Les règles d'usage (quand utiliser quoi) sont dans [ux-guidelines.md](ux-guidelines.md) ; les gabarits d'écran dans [patterns.md](patterns.md).

> **La couleur de marque est le vert du logo Sacko-Green (`#015e07`)**, choisie par le client le 28 octobre 2026. Ne pas changer la palette sans demande explicite.

Source unique des jetons : [`src/app/globals.css`](../src/app/globals.css). **Aucune couleur ni taille n'est écrite en dur** dans un composant. ESLint interdit `text-[11px]`, `text-gray-500`, `bg-[#…]` et toute couleur de la palette Tailwind (règle « Jetons du design system » dans `eslint.config.mjs`).

## Couleurs

Valeurs en OKLCH (clair / sombre). La classe Tailwind correspondante est `bg-<jeton>`, `text-<jeton>`, `border-<jeton>`.

### Surfaces et texte

| Jeton | Clair | Sombre | Usage |
|---|---|---|---|
| `background` | `oklch(1 0 0)` blanc | `oklch(0.145 0 0)` | fond de page |
| `foreground` | `oklch(0.145 0 0)` | `oklch(0.985 0 0)` | texte courant |
| `card` / `popover` | blanc | `oklch(0.205 0 0)` | cartes, menus |
| `muted` / `secondary` / `accent` | `oklch(0.97 0 0)` | `oklch(0.269 0 0)` | fonds discrets, survol |
| `muted-foreground` | `oklch(0.556 0 0)` | `oklch(0.708 0 0)` | texte secondaire (**jamais `text-gray-*`**) |
| `border` / `input` | `oklch(0.922 0 0)` | blanc 10 % / 15 % | bordures, champs |
| `ring` | `oklch(0.708 0 0)` | `oklch(0.556 0 0)` | anneau |
| `sidebar` (+ `sidebar-*`) | `oklch(0.977 0.008 106.5)` ivoire | `oklch(0.205 0 0)` | barre latérale **claire** (le logo vert y reste lisible) : n'y poser que les jetons `sidebar-*` |
| `table-header`, `table-border`, `table-row-hover`, `section-divider`, `helper-text` | gris | gris | tableaux et formulaires |

### Marque et sémantique

| Jeton | Clair | Sombre | Usage |
|---|---|---|---|
| `brand` = `primary` | `oklch(0.418 0.139 143.1)` vert du logo (`#015e07`) | `oklch(0.6 0.15 143)` | bouton principal, état actif, panneau de connexion |
| `brand-foreground` | blanc | `oklch(0.985 0 0)` | texte posé sur `brand` |
| `success` | `oklch(0.65 0.18 142)` vert | idem | surface « payé, validé » |
| `warning` | `oklch(0.75 0.15 65)` orange | idem | surface « en attente » |
| `info` | `oklch(0.65 0.15 210)` cyan | idem | surface d'information |
| `destructive` | `oklch(0.577 0.245 27.3)` rouge | `oklch(0.704 0.191 22.2)` | **réservé** aux alertes, retards, erreurs, suppressions |

Chaque couleur sémantique a une variante **encre** pour le texte et les icônes sur fond de page : `text-brand-ink`, `text-success-ink`, `text-warning-ink`, `text-info-ink`, `text-destructive-ink`. Les jetons de surface (`bg-success`…) s'utilisent avec leur `text-*-foreground`. **Ne jamais écrire `text-brand` ni `text-success`** : sur fond blanc, ces teintes ne passent pas le contraste AA.

Contraste à respecter (le vert du logo donne environ 8:1 avec le blanc, dans les deux sens) :
- texte courant et encres : **AA 4,5:1** en clair et en sombre ;
- texte posé sur une surface pleine (`success`, `info`, `destructive`) : **2,8:1 minimum** (palette d'origine conservée). En sombre, le blanc sur ces surfaces tombe vers 2,9:1 : on n'y pose pas de texte courant, seulement des libellés courts en gras.

## Couleur de marque

Une seule entreprise, une seule marque : le vert du logo est écrit directement dans les jetons `--brand`, `--brand-ink` et `--sidebar-primary` de `globals.css` (pas de thème par entreprise). L'encre de marque (`brand-ink`) est le même vert en clair, et un vert éclairci en sombre. Les PDF utilisent ce vert comme accent par défaut (`DEFAULT_ACCENT` dans `src/components/pdf/common.tsx`).

## Mode sombre

Géré par `next-themes` (`attribute="class"`, `defaultTheme="system"`) : la classe `.dark` sur `<html>` bascule les variables. Tout composant qui n'utilise que les jetons fonctionne dans les deux thèmes sans code spécifique. À vérifier pour chaque écran : lisibilité des encres, bordures visibles, absence de blanc en dur.

## Typographie

- **Source Sans 3** pour l'interface (`font-sans`), **Source Serif 4** pour les titres de page, les sections et les grands totaux (`font-serif`).
- Échelle **redéfinie** dans `globals.css` (plus grande que Tailwind par défaut) :

| Classe | Taille | Usage |
|---|---|---|
| `text-xs` | 13 px | **minimum absolu** : métadonnées, aides |
| `text-sm` | 15 px | corps (taille du `body`) |
| `text-base` | 16 px | |
| `text-lg` | 17 px | sous-titres d'étape |
| `text-xl` | 20 px | titre de section (`font-serif text-xl font-semibold`) |
| `text-2xl` / `text-3xl` | 24 / 30 px | titre de page (`font-serif text-2xl sm:text-3xl font-semibold`, via `PageHeader`) |

- Interdit : `text-[10px]`, `text-[11px]`, toute taille arbitraire. Pas de libellés en MAJUSCULES.
- **Montants** : composant [`Montant`](../src/components/ui/montant.tsx) ou classe utilitaire `num` (chiffres tabulaires, alignés à droite, sans retour à la ligne, suffixe GNF).

## Dimensions et espacements

| Élément | Valeur |
|---|---|
| Hauteur des contrôles `--control-h` | **40 px** sur ordinateur, **44 px** sous 1024 px (cible tactile). Déjà portée par `Button`, `Input`, `Combobox`, `DatePicker` : ne pas la redéclarer |
| Bouton `sm` (lignes de tableau) | 36 px sur ordinateur, 44 px en tactile |
| Espacements | 4 / 8 / 12 / 16 / 24 / 32 / 48 px ; sections `space-y-6` ou `gap-8` |
| Rayon | `--radius` 0,5 rem (`rounded-md`, `rounded-lg`) |
| Icônes (Lucide uniquement) | `size-4` en ligne, `size-5` navigation et boutons, `size-6` en-têtes |
| `Dialog` | `size="sm"` 440 px, `size="md"` 640 px (défaut) |
| `Sheet` | 480 px maximum |

## Mouvement

`globals.css` neutralise animations et transitions sous `prefers-reduced-motion: reduce`. La durée est ramenée à 0,01 ms plutôt qu'à `none`, pour que les composants Radix qui attendent `animationend` se démontent quand même. Une animation pilotée en JavaScript (`requestAnimationFrame`, bibliothèque tierce) échappe à cette règle et doit tester la media query elle-même. Le focus clavier est toujours visible : contour de 2 px couleur de marque sur `:focus-visible`.

## Composants (`src/components/ui`)

| Composant | Rôle |
|---|---|
| `Button` | variantes `default` (marque), `outline`, `secondary`, `ghost`, `link`, `destructive` ; tailles `default`, `sm`, `lg`, `icon`, `icon-sm` |
| `Input`, `Textarea`, `Checkbox`, `Label`, `Field` | saisie |
| `MoneyInput`, `PercentInput`, `QuantityInput`, `NumberField`, `Slider` | saisie numérique (séparateurs, bornes) |
| `Combobox` | **unique sélecteur** : recherche (masquée à 7 options ou moins), option « Créer… », rendu en portail. Pas de `react-select` ni de `<select>` natif stylé |
| `DatePicker`, `Calendar` | dates (saisie en heure locale, voir `src/lib/dates-saisie.ts`) |
| `Dialog`, `AlertDialog`, `Sheet`, `Popover`, `DropdownMenu`, `ActionMenu` | conteneurs et menus (quand utiliser lequel : [ux-guidelines.md](ux-guidelines.md)) |
| `Card`, `Tabs`, `Separator`, `Table`, `Alert`, `Badge`, `StatusBadge`, `Avatar`, `Progress`, `Skeleton` | présentation |
| `StatCard`, `StatStrip` | indicateurs en tuiles (tons `brand`, `success`, `warning`, `info`, `destructive`) |
| `Montant` | montant formaté et aligné |
| `PreuveUploadDialog` | dépôt d'une preuve (BDL, BDC, contrat) |

Primitives : Radix UI, style shadcn, Tailwind CSS v4. Icônes : **Lucide uniquement** (`react-icons` interdit).

## PDF

Les documents imprimés ont leur propre kit ([`src/components/pdf/common.tsx`](../src/components/pdf/common.tsx)) et quatre thèmes d'impression (`sobre`, `moderne`, `classique`, `elegant` ; [`themes.ts`](../src/components/pdf/themes.ts)), choisis dans les paramètres (`modeleImpressionId`). Les PDF utilisent des valeurs de style `@react-pdf` (hexadécimal autorisé) : la règle des jetons ne s'y applique pas. Tout nouveau gabarit **doit** utiliser `PdfLetterhead`, `PdfTableHeader`, `PdfTableRow`, `PdfFooterBlock` et `PdfLegalFooter`, qui gèrent la pagination. Le gabarit et le moteur PDF se chargent **au clic** (`chargerPdf()`, voir [architecture.md](architecture.md#rendu-pdf)).
