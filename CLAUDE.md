# CLAUDE.md

Point d'entrée pour toute IA (et tout développeur) qui travaille sur ce dépôt. Réponses à l'utilisateur : en français, courtes.

## Le projet

Système de gestion sur mesure pour **Sacko-Green Inc** (nom légal Sacko-Vert Inc., Dorval, Québec) : achat de véhicules au Canada, vente sur place ou export en conteneur vers Conakry. Deux sites (Canada, Guinée), trois devises (CAD, USD, GNF), 15 utilisateurs au plus. Interface en français.

**Avant tout travail, lire [`docs/decisions.md`](docs/decisions.md).** Il fait foi : 57 décisions de cadrage, plus les modifications de la section 15 qui remplacent les décisions marquées « modifié ». Ce n'est pas un cahier des charges détaillé : quand un écran ou un champ n'y est pas décrit, proposer une solution à l'utilisateur avant de la coder, puis l'ajouter à `docs/decisions.md`.

## Ce qui est déjà en place (28 octobre 2026)

Le squelette a été repris de `FasoDigital6/faso-gestion`, sans la couche multi-entreprises :

- configuration (Next.js 15, TypeScript, ESLint et ses frontières, knip, Vitest, Playwright, Firebase) aux mêmes versions que Faso Gestion (`pnpm-lock.yaml`) ;
- design system (`src/components/ui`, `layout`, `patterns` sauf `document-form`), kit PDF (`src/components/pdf`), utilitaires (`src/lib`), e-mail Resend (`src/server/email`) ;
- **couleurs de Sacko-Green** : vert du logo `#015e07` dans `src/app/globals.css`, logo dans `public/sacko/` ;
- connexion Firebase par cookie (middleware, `src/server/auth`, `auth-context`), écran de connexion, tableau de bord vide ;
- permissions de Sacko-Green ([`docs/permissions.md`](docs/permissions.md)) : modules × actions, sites, permissions spéciales, modèles Vendeur et Agent Guinée, avec tests ;
- actions serveur de gestion des comptes (`src/server/actions/user-actions.ts`), sans écran pour l'instant ;
- règles Firestore et Storage fermées par défaut, sauf `users` ;
- script `scripts/creer-admin.mjs` pour créer le premier administrateur.

**Faso Gestion reste la référence** pour les briques pas encore reprises (liste paginée, formulaire de document, écrans de gestion des comptes et des paramètres) : si ce dépôt n'est pas dans la session et qu'une de ces briques est nécessaire, demander à l'ajouter. Ne jamais reprendre le multi-entreprises (`eid`, `tenantCol`, `tenantDoc`, `entreprise-provider`, superadmin, offres à la carte), les proformas, contrats, BDC, BDL, appels d'offres ni la fiscalité guinéenne.

## Carte

```
src/app/          routes minces : page.tsx = `export { default } from "@/features/<x>/pages/<page>"`
src/features/<x>/ pages/, components/, hooks/, pdf/ ; index.ts = API publique minimale
src/components/   ui/ · layout/ · patterns/ · pdf/
src/data/         api/<entité>.ts (Firestore) · queries/use-<entité>.ts · session/
src/server/       firebase-admin, auth, actions/ ("use server"), email/, pdf/
src/domain/       PUR : calculs/ (prix, marges, devises, taxes, soldes, fret), statuts/, permissions/, schemas/
functions/        Cloud Functions (soldes, vitrine, alertes, rappels)
tests/            unit/ (miroir de src) · e2e/ (Playwright, émulateurs)
docs/             decisions.md, puis modele-donnees.md, calculs.md, permissions.md au fil des étapes
```

## Règles obligatoires

1. **Calculs** : aucune formule hors de `src/domain`. Prix affiché et plancher, arrondis, conversions de devises (taux figés au jour de l'opération), TPS et TVQ, soldes, répartition du fret : chaque règle a son test chiffré dans `tests/unit/domain/`.
2. **Coûts cachés** : les coûts d'achat vivent dans `vehicules/{id}/prive/couts`, refusé par les règles Firestore sans la permission « voir les coûts ». Ne jamais mettre un coût dans le document principal du véhicule.
3. **Serveur d'abord** : prix plancher, approbations, paiements, annulations et dossiers de dédouanement passent par des actions serveur. Le rôle se lit dans le jeton, jamais dans la requête. Les règles Firestore et Storage sont la vraie barrière : toute nouvelle collection s'y ajoute dans le même commit.
4. **Argent immuable** : on ne modifie ni ne supprime une écriture du relevé client, un paiement ou une facture ; on ajoute une écriture d'annulation avec motif. Le solde est recalculé par Cloud Function.
5. **Vitrine** : la fiche publique et le site `FasoDigital6/sacko-green-vitrine` lisent uniquement `vitrine/{id}`, tenu à jour par Cloud Function, avec les seuls champs publics (type `Vehicle` de `lib/sacko/catalog.ts` dans ce dépôt). Ne jamais exposer un document privé au navigateur.
6. **Notifications** : par e-mail uniquement (Resend), derrière une interface d'envoi unique. Pas d'envoi automatisé WhatsApp.
7. **PDF** : gabarits construits avec le kit `src/components/pdf/common.tsx`, chargés au clic (`await import(...)`), jamais par import statique.
8. **Code mort** : knip doit rester vide. `knip.json` déclare les briques du kit (`src/components`, `src/lib`, `src/server`…) comme points d'entrée tant qu'elles ne sont pas toutes utilisées : retirer ces lignes quand les écrans les consomment.
9. **Documentation dans le même commit que le code** : collection ou champ → `docs/modele-donnees.md` ; calcul → `docs/calculs.md` ; permission → `docs/permissions.md` ; décision nouvelle ou changée → `docs/decisions.md`.
10. **Terminé = `pnpm check` vert** (lint, cycles, knip, typecheck, tests, build), et `pnpm test:e2e` si un parcours change (émulateurs uniquement, jamais les projets `sackogreen-dev` ou `-prod`).
11. Commits en français. Commit ou push seulement à la demande de l'utilisateur.

## Par où commencer

Suivre l'ordre de la section 13 de `docs/decisions.md`, une étape à la fois, chacune montrée à l'utilisateur avant la suivante.

**Étape 1, le socle** : la base technique, la connexion et les permissions sont faites. Il reste :

1. l'écran **Utilisateurs** (admin) : liste, création avec un modèle de départ, réglage des droits module par module, des sites et des permissions spéciales, désactivation. Les actions serveur existent déjà ;
2. l'écran **Paramètres** (admin) : taux de change modifiables et historisés (USD, CAD, GNF), taux de TPS et TVQ, pas d'arrondi du prix affiché, identité de l'entreprise pour les documents (type `Entreprise`) ;
3. les tests e2e de connexion sur émulateurs.

**Démarrer en local** : `pnpm install`, copier `.env.example` en `.env.local` et le remplir (projet `sackogreen-dev`), créer le premier admin avec `node --env-file=.env.local scripts/creer-admin.mjs email "Prénom" "Nom"`, puis `pnpm dev`. Le build a besoin de ces variables.

Région Firebase : `northamerica-northeast1` (Montréal), définitive à la création des projets.
