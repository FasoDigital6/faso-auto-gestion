# CLAUDE.md

Point d'entrée pour toute IA (et tout développeur) qui travaille sur ce dépôt. Réponses à l'utilisateur : en français, courtes.

## Le projet

Système de gestion sur mesure pour **Sacko-Green Inc** (nom légal Sacko-Vert Inc., Dorval, Québec) : achat de véhicules au Canada, vente sur place ou export en conteneur vers Conakry. Deux sites (Canada, Guinée), trois devises (CAD, USD, GNF), 15 utilisateurs au plus. Interface en français.

**Avant tout travail, lire [`docs/decisions.md`](docs/decisions.md).** Il fait foi : 57 décisions de cadrage, plus les modifications de la section 15 qui remplacent les décisions marquées « modifié ». Ce n'est pas un cahier des charges détaillé : quand un écran ou un champ n'y est pas décrit, proposer une solution à l'utilisateur avant de la coder, puis l'ajouter à `docs/decisions.md`.

## Projet de référence : Faso Gestion

Ce projet reprend la stack, l'architecture et les règles de `FasoDigital6/faso-gestion`. Si ce dépôt n'est pas dans la session, demander à l'ajouter avant de commencer.

**À copier de Faso Gestion** (en adaptant, sans dépendre de lui) :

- configuration : `package.json` (dépendances), `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `knip.json`, `vitest.config.mts`, `playwright.config.ts`, `components.json`, `firebase.json` ;
- design system : `src/components/ui/`, `src/components/layout/`, `src/components/patterns/` (data-table, document-form, états, filtres), et `docs/design-system.md`, `docs/ux-guidelines.md`, `docs/patterns.md` ;
- kit PDF : `src/components/pdf/` (`common.tsx`, `charger.ts`) ;
- permissions : `src/domain/permissions/` et le skill `.claude/skills/ajouter-permission` ;
- session et auth : `src/data/session/auth-context.tsx`, `src/server/auth/`, `src/server/firebase/` ;
- utilitaires : `src/lib/dates-saisie.ts`, `src/lib/utils.ts`, `src/lib/idempotence.ts` ;
- e-mail : `src/server/email/` (Resend).

**À ne pas copier** : le multi-entreprises (`eid`, `tenantCol`, `tenantDoc`, `entreprise-provider`, superadmin, offres à la carte), les proformas, contrats, BDC, BDL, appels d'offres et la fiscalité guinéenne (`src/domain/fiscalite/`).

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
8. **Documentation dans le même commit que le code** : collection ou champ → `docs/modele-donnees.md` ; calcul → `docs/calculs.md` ; permission → `docs/permissions.md` ; décision nouvelle ou changée → `docs/decisions.md`.
9. **Terminé = `pnpm check` vert** (lint, cycles, knip, tests, build), et `pnpm test:e2e` si un parcours change (émulateurs uniquement, jamais les projets `sackogreen-dev` ou `-prod`).
10. Commits en français. Commit ou push seulement à la demande de l'utilisateur.

## Par où commencer

Suivre l'ordre de la section 13 de `docs/decisions.md`, une étape à la fois, chacune montrée à l'utilisateur avant la suivante.

**Étape 1, le socle** :

1. initialiser le projet Next.js avec la configuration copiée de Faso Gestion, sans multi-entreprises ;
2. connexion (Firebase Auth), rôles `admin` / `utilisateur`, droits par module, rattachement à un site (Canada, Guinée ou les deux) et permissions spéciales (« voir les coûts », « approuver sous le plancher », « annuler ») ;
3. paramètres : taux de change modifiables par l'admin (historisés), taux de TPS et TVQ, pas d'arrondi du prix affiché ;
4. émulateurs Firebase pour les tests, `pnpm check` vert ;
5. rédiger `docs/modele-donnees.md` et `docs/permissions.md` pour ce socle.

Région Firebase : `northamerica-northeast1` (Montréal), définitive à la création des projets.
