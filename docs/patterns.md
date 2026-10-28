# Gabarits réutilisables

> **Repris de Faso Gestion le 28 octobre 2026.** Les exemples citent encore ses écrans (clients, factures, proformas). Deux briques décrites ici n'ont pas encore été copiées dans ce dépôt : la **liste paginée côté serveur** (`chargerPage`, `useListePaginee`) et le **formulaire de document sur une page** (`src/components/patterns/document-form`). Les reprendre depuis `FasoDigital6/faso-gestion` quand une étape en a besoin (clients et commandes à l'étape 4), sans la couche multi-entreprises (`eid`, `tenantCol`).

**Réutiliser un gabarit existant avant d'en créer un.** Les gabarits vivent dans [`src/components/patterns/`](../src/components/patterns/) (et les blocs de structure dans [`src/components/layout/`](../src/components/layout/)). Ils ne dépendent d'aucune feature (règle ESLint). Quand utiliser quoi : [ux-guidelines.md](ux-guidelines.md).

| Gabarit | Fichiers | Implémentation de référence |
|---|---|---|
| [Structure de page](#structure-de-page) | `layout/page-container`, `page-header`, `page-back-link` | toutes les pages |
| [Page de liste](#page-de-liste) | `patterns/data-table/`, `patterns/filters/`, `patterns/etats/` | [`features/clients/pages/liste-page.tsx`](../src/features/clients/pages/liste-page.tsx), [`features/factures/pages/liste-page.tsx`](../src/features/factures/pages/liste-page.tsx) |
| [Formulaire de document sur une page](#formulaire-de-document-sur-une-page) | `patterns/document-form/` | [`features/proformas/components/proforma-form.tsx`](../src/features/proformas/components/proforma-form.tsx) + [`hooks/use-proforma-form.ts`](../src/features/proformas/hooks/use-proforma-form.ts) |
| [Récapitulatif des totaux](#récapitulatif-des-totaux) | `patterns/document-form/recap-totaux`, `pied-totaux` | formulaires de document, fiches détail |
| [Page détail (« feuille »)](#page-détail-feuille) | composition | [`features/factures/pages/detail-page.tsx`](../src/features/factures/pages/detail-page.tsx), [`features/proformas/pages/detail-page.tsx`](../src/features/proformas/pages/detail-page.tsx) |
| [États vide, chargement, erreur](#états) | `patterns/etats/` | listes |
| [Fiche courte en Sheet](#fiche-courte-en-sheet) | `ui/sheet` + `Champ` | [`features/clients/components/client-form-sheet.tsx`](../src/features/clients/components/client-form-sheet.tsx) |
| Sélection d'un produit avec stock | `patterns/document-form/product-select`, `product-form-sheet`, `stock-hint` | `LignesEditor` |
| `RemiseGlobale` | remise sur le total du document, en % ou en GNF, après les remises de ligne ; avec `champsRemiseGlobale` (schéma), `remiseSelonMode`, `remiseDepasseTotal` dans `remise-globale-saisie.ts` (testables sans JSX) | `document` (texte du message d'erreur) |

## Structure de page

```tsx
import { PageHeader } from "@/components/layout"
import { PageContainer } from "@/components/layout/page-container"

<PageHeader
  title="Clients"                                   // font-serif, 24/30 px
  description="Gérez votre base clients et consultez leur historique"
  action={canManage && <Button onClick={ouvrir}><Plus /> Nouveau client</Button>}
/>
```

`PageContainer` donne les marges et l'espacement vertical standard (`gap-6`, `lg:gap-8`) ; le layout du tableau de bord l'applique déjà. `PageBackLink` (« ← Factures ») se place en haut des pages détail et de saisie.

## Page de liste

**Quand** : toute collection consultable (documents, référentiels). Tableau à partir de 768 px, cartes en dessous, sans défilement horizontal.

Composition :
1. `PageHeader` avec l'action de création (si l'utilisateur en a le droit) ;
2. éventuellement un `StatStrip` d'indicateurs ;
3. `DataTable` avec ses `filters` ;
4. les états : `ListeChargement`, `ListeErreur`, `EmptyState`.

```tsx
// features/<x>/components/columns-wrapper.tsx — colonnes typées
export const createColumns = (onEdit: (c: Client) => void, canManage: boolean): ColumnDef<Client>[] => [
  { accessorKey: "nom", header: "Client" },
  { accessorKey: "telephone", header: "Téléphone", meta: { hideBelow: "md" } },      // secondaire : masquée < md
  {
    accessorKey: "totalDu",
    header: "Reste dû",
    cell: ({ row }) => <Montant valeur={row.original.totalDu} />,
    meta: { className: "num" },
  },
  { id: "actions", meta: { label: "Actions" }, cell: ({ row }) => canManage && <ClientActions client={row.original} onEdit={onEdit} /> },
]

// features/<x>/pages/liste-page.tsx
const { data, isLoading, error, refetch } = useClients()
const columns = useMemo(() => createColumns(edit, canManage), [canManage])

if (isLoading) return <ListeChargement />
if (error) return <ListeErreur onRetry={refetch} />

return (
  <>
    <PageHeader title="Clients" action={…} />
    {data?.length ? (
      <DataTable columns={columns} data={data} onRowClick={(c) => router.push(`/clients/${c.id}`)}
                 filters={<Filtres />} />
    ) : (
      <EmptyState icon={Users} title="Aucun client" description="Ajoutez votre premier client pour créer des proformas."
                  action={canManage && <Button onClick={ouvrir}>Nouveau client</Button>} />
    )}
  </>
)
```

### Liste paginée côté serveur

**Toute liste d'une collection qui grossit avec l'activité** (documents de vente, paiements, clients, produits) est paginée par Firestore et non chargée en entier. Référence : `/factures` ([`liste-page.tsx`](../src/features/factures/pages/liste-page.tsx)).

```tsx
// data/api/<entite>.ts
export const getFacturesPage = (eid, filtres, curseur) =>
  chargerPage(tenantCol(eid, FACTURES_COLLECTION_NAME), "dateFacturation", filtres, curseur, mapFactureDoc)

// data/queries/use-<entite>.ts — clé sous l'entité : invalidée avec elle
export const useFacturesPage = (filtres: FiltresPage) => useListePaginee("factures", filtres, getFacturesPage)

// page
const [recherche, setRecherche] = useState("")
const rechercheEnvoyee = useValeurDifferee(recherche)            // pas une requête par frappe
const filtresPage = useMemo(() => ({
  termes: termesDeRecherche(rechercheEnvoyee),                    // champ motsCles (ADR 0007)
  egalites: { clientId: filters.client, statut: … },             // un tableau = « in »
  periode: filters.period ? { debut: filters.period.startDate, fin: filters.period.endDate } : null,
}), [rechercheEnvoyee, filters…])
const liste = useFacturesPage(filtresPage)

<DataTable data={liste.lignes} serveur={{ recherche, onRechercheChange: setRecherche,
  aSuivant: !!liste.hasNextPage, chargerSuivant: () => liste.fetchNextPage(), chargementSuivant: liste.isFetchingNextPage }} … />
```

Règles : le tri et la période portent sur **le même champ** (`champTri`) ; chaque combinaison de filtres a son index composite dans `firestore.indexes.json` (égalités, puis `motsCles` `CONTAINS`, puis `champTri` `DESCENDING`) ; la collection doit être dans `CHAMPS_RECHERCHE` pour être cherchable. Un compteur ou un total sur toute la collection ne se calcule pas sur les lignes chargées : `getCountFromServer` ou un agrégat.

Colonnes : chaque colonne a un `header` texte ou un `meta.label` (libellé de la carte mobile). `meta.hideBelow: "sm" | "md" | "lg"` masque une colonne secondaire ; `meta.className: "num"` aligne un montant.

### Filtres

```tsx
import { DataTableFilters, ClientFilter, StatusFilter, PeriodFilter, SearchFilter } from "@/components/patterns/filters"
import { useDataFilters } from "@/components/patterns/filters/use-data-filters"
import { FACTURE_STATUS_OPTIONS } from "@/components/patterns/filters/status-options"

const { filters, setFilter, clearAllFilters, hasActiveFilters, activeFiltersCount } =
  useDataFilters({ syncWithUrl: true })                 // filtres conservés dans l'URL (retour arrière)

<DataTableFilters onClearAll={clearAllFilters} hasActiveFilters={hasActiveFilters} activeFiltersCount={activeFiltersCount}>
  <ClientFilter clients={clients ?? []} value={filters.client ?? null} onChange={(v) => setFilter("client", v)} />
  <StatusFilter options={FACTURE_STATUS_OPTIONS} value={filters.status ?? null} onChange={(v) => setFilter("status", v)} />
  <PeriodFilter value={filters.period ?? null} onChange={(v) => setFilter("period", v)} />
</DataTableFilters>
```

Sur mobile, `DataTableFilters` se replie derrière un bouton « Filtres » qui affiche le nombre de filtres actifs. Sur une liste paginée, les filtres partent dans la requête (voir plus haut) ; sur une petite liste chargée en entier (catégories, modèles), le filtrage se fait dans la page (`useMemo` sur `filters`). Avec `syncWithUrl`, le hook **réécrit l'URL sans conserver d'autres paramètres** : garder en état local tout autre état de vue (exemple : la bascule « Par bon de commande » de `/factures`).

## Formulaire de document sur une page

**Quand** : créer ou modifier un proforma, une facture, un BDC, un BDL, un contrat, ou tout nouveau type de document de vente. Toujours une **page** (`/x/nouveau`, `/x/[id]/modifier`), **sans étapes** : les sections sont empilées et le bouton d'enregistrement reste dans le récapitulatif ([ADR 0009](decisions/0009-formulaires-sur-une-page.md)). Skill : [`nouveau-document-vente`](../.claude/skills/nouveau-document-vente/SKILL.md).

Découpage :
- `hooks/use-x-form.ts` : schéma Zod, valeurs par défaut (reprises du document source), champs par section (`CHAMPS_X_PAR_SECTION` ou `SECTIONS`), `erreursParSection`, `submitCount`, totaux via **`calculerTotauxDocument`**, `useFiscaliteSync` pour les taux par défaut de l'entreprise, enregistrement par le hook de mutation de `src/data/queries`.
- `components/x-form.tsx` : la mise en page, ci-dessous.
- `pages/nouveau-page.tsx` et `modifier-page.tsx` : lisent les paramètres d'URL, vérifient la permission et rendent le formulaire.

Sections standard : **1. Informations** (client, numéros, date, lieu, pièce jointe ; puis « Autres informations » repliées : délai, paiement, objet, signataire), **2. Lignes**, **3. Fiscalité**. BDL : Informations, Articles.

```tsx
const SECTIONS = [{ id: "informations", titre: "Informations" }, { id: "lignes", titre: "Lignes" }, { id: "fiscalite", titre: "Fiscalité" }]
const erreurs = listerErreurs(SECTIONS.map((s) => s.id), f.erreursParSection)
useDefilementVersErreur(f.submitCount, erreurs[0]?.sectionId)          // enregistrement refusé → première section en erreur

<DocumentFormLayout
  titre="Nouveau proforma" enTete={<Combobox id="typeAO" … className="w-auto" />}   // réglage court à côté du titre
  retourHref="/proformas" retourLibelle="Proformas"
  recap={<RecapTotaux document="Proforma" infos={…} lignes={…} totaux={f.totaux} …
                      alertes={<AlertesErreurs erreurs={erreurs} />}
                      action={<ActionEnregistrer formId="form-proforma" enCours={f.isSubmitting}
                                                 libelle="Créer le proforma" libelleCourt="Créer" retourHref="/proformas" />} />}
>
  <FormulaireDocument id="form-proforma" onSubmit={(e) => void f.enregistrer(e)}>   {/* Entrée ne soumet pas */}
    <SectionFormulaire id="informations" numero={1} titre="Informations" enErreur={…}>
      …client, N° PR, date, lieu…
      <AutresInformations resume={resumer([["Délai", v.dateLivraison], ["Paiement", v.conditionPaiement]])}
                          forcerOuverture={!!errors.dateLivraison}>…</AutresInformations>
    </SectionFormulaire>
    <SectionFormulaire id="lignes" numero={2} titre="Lignes"><LignesEditor … disposition="rangees" /></SectionFormulaire>
    <SectionFormulaire id="fiscalite" numero={3} titre="Fiscalité"><FiscaliteFields … /></SectionFormulaire>
  </FormulaireDocument>
</DocumentFormLayout>
```

Blocs disponibles :

| Bloc | Rôle | Props notables |
|---|---|---|
| `DocumentFormLayout` | page de saisie : titre, retour, sections, récapitulatif collant | `enTete` : réglage court à côté du titre (type de proforma) |
| `page-unique` : `FormulaireDocument`, `SectionFormulaire`, `AutresInformations`, `AlertesErreurs`, `ActionEnregistrer`, `listerErreurs`, `resumer`, `useDefilementVersErreur` | briques de la page unique | `AutresInformations.forcerOuverture` : se déplie si un champ replié est en erreur |
| `LignesEditor` | lignes : produit du catalogue ou saisie libre, quantité, prix, remise ; alerte de stock | `disposition="rangees"` (compact, « Ajouter une ligne » collant, Entrée = ligne suivante), `onToggleManuel`, `quantiteLivree` |
| `FiscaliteFields` | régime standard par défaut, marché public dans une liste ; TVA, précompte, précompte de TVA, ARMP sur une ligne | `tvaAvecInterrupteur={false}` pour les factures et BDC ; `sansMarchePublic` pour les contrats |
| `useFiscaliteSync` | applique les taux par défaut de l'entreprise quand une option s'active, remet 0 quand elle se désactive | `synchroniserTva=false` pour les factures |
| `Champ` | libellé, aide, erreur accessibles | `optionnel` affiche « (facultatif) » |
| `ProductSelect` + `ProductFormSheet` + `StockHint` | choix d'un produit, création rapide, stock disponible | |

## Récapitulatif des totaux

- **`RecapTotaux`** (et `RecapLivraison` pour le BDL) : l'aperçu en direct du document pendant la saisie (informations, lignes, totaux, net). Il prend directement le résultat de `calculerTotauxDocument`. `action` et `alertes` (facultatifs) y placent le bouton d'enregistrement et les erreurs, toujours visibles. `netAvecRetenues` remplace le libellé « Total » par « Net à payer » dès qu'un précompte ou le marché public s'applique.
- **`PiedTotaux`** : le pied de tableau d'un document enregistré (fiche détail) : sous-total, remise, HT, TVA, précompte ou RS-TVA et ARMP, net. Il n'affiche que les lignes non nulles.

Ni l'un ni l'autre ne calcule : ils affichent des montants fournis.

## Page détail (« feuille »)

**Quand** : consulter un document. Pas de composant unique : une composition éprouvée.

```
PageBackLink « ← Factures »
En-tête : numéro, StatusBadge, client, dates            actions (ActionMenu, bouton principal)
┌────────────────────────────────────┬───────────────────────────┐
│ Le document, comme imprimé :       │ Suivi :                    │
│  tableau des lignes (x-lignes-     │  encaissement / livraison  │
│  table) + PiedTotaux               │  preuves, documents liés   │
│                                    │  (BDL, factures, BDC…)     │
└────────────────────────────────────┴───────────────────────────┘
```

Sur mobile, la colonne de suivi passe sous le document. Les actions principales (émettre, enregistrer un paiement, télécharger le PDF) sont des boutons ; les secondaires vont dans l'`ActionMenu`.

## États

```tsx
import { ListeChargement, ListeErreur } from "@/components/patterns/etats/liste-etats"
import { EmptyState } from "@/components/patterns/etats/empty-state"

<ListeChargement lignes={6} />                         // Skeleton à la forme d'une liste
<ListeErreur onRetry={refetch} />                       // message + « Réessayer »
<EmptyState icon={FileText} title="Aucune facture" description="…" action={<Button>…</Button>} />
```

Une page détail ou un formulaire affiche un `Skeleton` à la forme de son contenu pendant le chargement.

## Fiche courte en Sheet

**Quand** : créer ou modifier un objet simple (client, produit, fournisseur, dépense, utilisateur, employé), y compris depuis un autre écran (option « Créer… » d'un `Combobox`). `Sheet` de 480 px maximum, champs en `Champ`, pied avec « Annuler » et le bouton principal. Si le contenu déborde, ce n'est plus une fiche courte : faire une page.

```tsx
<Sheet open={open} onOpenChange={setOpen}>
  <SheetContent>
    <SheetHeader><SheetTitle>Nouveau client</SheetTitle></SheetHeader>
    <form onSubmit={…} className="space-y-4">
      <Champ label="Nom" htmlFor="nom" erreur={errors.nom?.message}><Input id="nom" {...register("nom")} /></Champ>
      <Champ label="Téléphone" htmlFor="telephone" optionnel><Input id="telephone" {...register("telephone")} /></Champ>
      <SheetFooter><Button type="submit">Créer le client</Button></SheetFooter>
    </form>
  </SheetContent>
</Sheet>
```

## Créer un nouveau gabarit

Seulement si **aucun** gabarit existant ne convient et que le besoin revient sur au moins deux écrans :
1. le placer dans `src/components/patterns/<nom>/` : il ne doit dépendre d'aucune feature ;
2. le documenter ici (quand l'utiliser, exemple, implémentation de référence) dans le même commit ;
3. l'utiliser à la place de la version ad hoc dans les écrans concernés.
