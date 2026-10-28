# Règles UX

À lire **avant tout nouvel écran ou toute modification d'interface**, avec [design-system.md](design-system.md) (jetons, composants) et [patterns.md](patterns.md) (gabarits à réutiliser). Ces règles décrivent l'interface telle qu'elle a été refondue et validée à l'écran (refonte « Registre », octobre 2026).

Principes : **une tâche par écran, le chiffre juste toujours visible, rien de caché sur mobile.** Les utilisateurs saisissent des documents qui engagent de l'argent, parfois sur téléphone, sur le terrain.

## 1. Choisir le bon conteneur

| Besoin | Conteneur | Exemples |
|---|---|---|
| Créer ou modifier un **document de vente** (proforma, facture, BDC, BDL, contrat) | **page dédiée** `/x/nouveau` et `/x/[id]/modifier`, formulaire sur une page | `/proformas/nouveau` |
| Saisir un objet complet, à plusieurs sections | **page dédiée** | réception de stock, modèle de document AO |
| Consulter un document | **page détail** (« feuille » : le document à gauche, le suivi à droite) | `/factures/[id]` |
| Créer ou modifier rapidement une **fiche courte** (client, produit, fournisseur, dépense, utilisateur, employé) | **`Sheet`** à droite, **480 px maximum** | `ClientFormSheet` |
| Aperçu ou filtres secondaires | `Sheet` 480 px | détail d'une réception |
| Confirmer une action, ou saisir 1 à 4 champs | **`Dialog`** `size="sm"` (440 px) ou `"md"` (640 px) | paiement, versement de TVA, relance |
| Confirmer une action **destructive** | `AlertDialog` (bouton `destructive`, libellé explicite : « Supprimer la facture ») | suppression, annulation |
| Retour d'une action | **toast Sonner** (succès, erreur), jamais une alerte bloquante | |

Règles :
- **Un formulaire de document n'est jamais dans un `Sheet` ni un `Dialog`.**
- Pas de `Dialog` empilé sur un `Dialog`. Un `Sheet` peut ouvrir un `Dialog` de confirmation.
- Un `Sheet` ne dépasse pas 480 px : si le contenu ne tient pas, c'est une page.

## 2. Formulaires de document sur une page

Gabarit : `DocumentFormLayout` + `page-unique` + `RecapTotaux` ([patterns.md](patterns.md#formulaire-de-document-sur-une-page)). Les étapes à « Suivant » ont été abandonnées en octobre 2026 : les utilisateurs se lassaient de les enchaîner ([ADR 0009](decisions/0009-formulaires-sur-une-page.md)).

- **Tout sur une page**, en sections numérotées : **Informations → Lignes → Fiscalité** (BDL : Informations → Articles). Pas de page « Révision » : l'aperçu du récapitulatif en tient lieu.
- **Ce qui est presque toujours la valeur par défaut est replié** sous « Autres informations » (délai, condition de paiement, objet, signataire) avec un résumé des valeurs ; le bloc se déplie seul si l'un de ses champs obligatoires est en erreur.
- **Les choix à deux options prennent peu de place** : une petite liste (`Combobox` étroit), pas de grandes cartes. Le type de proforma est à côté du titre ; le régime fiscal est « standard » par défaut, « marché public » se choisit dans la liste.
- **Le bouton d'enregistrement est toujours visible** dans le récapitulatif (colonne de droite sur ordinateur, barre du bas sur mobile, libellé court « Créer »). Les erreurs y sont listées ; un clic amène à la section. Un enregistrement refusé ramène à la première section en erreur.
- **« Ajouter une ligne » reste à portée** : barre collante en haut de la liste des lignes et bouton en bas ; le curseur va sur la nouvelle ligne ; Entrée dans un champ de ligne passe à la suivante (ou en crée une sur la dernière). Entrée ne soumet jamais le formulaire.
- **Le récapitulatif est toujours visible** : colonne de droite sur ordinateur, barre repliable en bas sur mobile. Il montre l'aperçu du document et le net à payer.
- Un document **créé depuis un autre** (proforma → BDC, BDC → facture) reprend le client, les lignes et le régime fiscal. Le régime n'est **pas** ressaisi : il est affiché en lecture seule quand il est hérité.
- Calculs : uniquement `calculerTotauxDocument`. Un composant n'écrit jamais de formule ([fiscalite.md](fiscalite.md)).
- Pages de saisie : la barre de navigation du bas est masquée (classe `immersive`), un lien « Retour » ramène à la liste ou au document source.
- Paramètres d'URL documentés en tête de la page (`?proforma=`, `?bdc=`, `?client=`, `?dupliquer=`…).

## 3. Champs

- Chaque champ est enveloppé dans `Champ` : libellé visible au-dessus (jamais un placeholder seul), `htmlFor` qui pointe sur l'`id` du contrôle, mention « (facultatif) » plutôt qu'un astérisque sur les obligatoires, aide sous le champ, erreur en `text-destructive-ink` avec `role="alert"`.
- Libellés en phrase, sans majuscules de titre ni MAJUSCULES.
- Un seul sélecteur : `Combobox`. Il propose « Créer… » quand l'objet peut être créé sur place (client, produit, catégorie).
- Montants : `MoneyInput` en saisie, `Montant` en affichage (aligné à droite, GNF). Pourcentages : `PercentInput`. Quantités : `QuantityInput`.
- Dates : `DatePicker`. Une date saisie se lit et s'écrit **uniquement** avec `lireDateSaisie` / `formaterDateSaisie` (`src/lib/dates-saisie.ts`) : `new Date("2026-10-13")` donne la veille hors du fuseau UTC.
- Les placeholders sont neutres et ne citent pas de vraie entreprise.

## 4. Listes : tableaux et cartes

Gabarit : `DataTable` ([patterns.md](patterns.md#page-de-liste)).

- **Tableau à partir de 768 px, cartes en dessous.** Jamais de défilement horizontal pour une liste principale.
- Chaque colonne a un en-tête texte ou un `meta.label` (repris comme libellé dans la carte mobile). Les colonnes secondaires se masquent par `meta.hideBelow` ; identifiant, montant et actions restent visibles.
- Les montants sont alignés à droite (`num`).
- Un clic sur la ligne ouvre le détail ; les actions secondaires sont dans un `ActionMenu` (« ⋯ »).
- Filtres au-dessus de la liste (`DataTableFilters`), **repliés derrière un bouton « Filtres »** sur mobile, avec le nombre de filtres actifs et « Tout effacer ».
- Indicateurs de synthèse en `StatStrip` au-dessus de la liste, cliquables pour filtrer quand c'est pertinent.

## 5. États à prévoir sur chaque écran

| État | Rendu |
|---|---|
| Chargement | `Skeleton` à la forme du contenu (`ListeChargement` pour une liste). Pas de texte « Chargement... » seul ni de spinner plein écran |
| Erreur | `ListeErreur` : message clair et bouton « Réessayer » |
| Vide | `EmptyState` : icône, titre, explication, **action principale** (« Créer un client ») si l'utilisateur en a le droit |
| Vide après filtrage | « Aucun résultat » et « Effacer les filtres » |
| Désactivé | bouton `disabled` **avec** l'explication à côté ou en infobulle (« Facture déjà payée ») |
| Droits insuffisants | l'action n'est pas affichée ; la page redirige vers l'accueil |
| Module non souscrit | la section ou l'entrée de menu n'apparaît pas |
| Succès et échec d'une action | toast ; le bouton montre un état de chargement pendant la requête et n'est pas cliquable deux fois |

## 6. Accessibilité

- Focus visible partout (anneau global `:focus-visible`), ordre de tabulation logique, aucun piège au clavier ; `Dialog` et `Sheet` rendent le focus à leur déclencheur.
- Contraste AA : texte courant et encres à 4,5:1 (vérifié par test). Ne pas poser de texte courant sur une surface sémantique pleine.
- Une information n'est **jamais portée par la couleur seule** : un statut a toujours un libellé (`StatusBadge`).
- Bouton icône sans texte : `aria-label` obligatoire.
- Messages d'erreur reliés au champ (`role="alert"` dans `Champ`).
- Respect de `prefers-reduced-motion` (géré globalement ; une animation en JavaScript doit le tester elle-même).
- Les tests E2E ciblent des **rôles et des libellés** (`getByRole`, `getByLabel`). Un écran difficile à tester ainsi est souvent mal étiqueté.

## 7. Tailles minimales

| Élément | Minimum |
|---|---|
| Texte | 13 px (`text-xs`) ; corps 15 px (`text-sm`) |
| Contrôle (bouton, champ, sélecteur) | 40 px de haut sur ordinateur, **44 px sous 1024 px** (`--control-h`) |
| Cible tactile (bouton icône, case) | 44 × 44 px sous 1024 px |
| Largeurs de test | 390 px (téléphone), 820 px (tablette), 1440 px (ordinateur) : `tests/e2e/visuel.spec.ts` produit les captures |

## 8. Navigation

- Organisée **par flux de travail** ([`nav-data.ts`](../src/components/layout/nav-data.ts)) : Tableau de bord, Stock & achats, Ventes, Finances (factures, paiements, dépenses, situation, taxes, rapports), Appels d'offres, Administration.
- Sur mobile : barre du bas (Accueil, Ventes, Encaisser, Plus), masquée sur les pages de saisie.
- La page active est mise en évidence par un bloc de la couleur de marque.
- Ajouter un écran = ajouter son entrée (avec permission) dans `nav-data.ts`, ou l'onglet d'un hub (`VentesHubTabs`, `StockHubTabs`, `AoHubTabs`).

## 9. Textes

- Français, vouvoiement, phrases courtes. Verbes d'action sur les boutons (« Émettre la facture », pas « OK »).
- Montants avec le suffixe GNF ; dates au format français.
- Les messages d'erreur disent quoi faire (« Le montant ne peut pas dépasser le solde restant (400 000 GNF) »).

## Checklist avant de livrer un écran

- [ ] Conteneur conforme au §1 ; gabarit de [patterns.md](patterns.md) réutilisé
- [ ] Jetons uniquement (lint vert), lisible en clair et en sombre
- [ ] États chargement, erreur, vide et désactivé
- [ ] Vérifié à 390, 820 et 1440 px ; pas de défilement horizontal
- [ ] Clavier : focus visible, ordre logique ; libellés et `aria-label`
- [ ] Permissions et modules vérifiés (interface **et** règles)
- [ ] Test E2E du parcours principal si c'est un nouveau parcours
- [ ] Documentation et changelog mis à jour dans le même commit
