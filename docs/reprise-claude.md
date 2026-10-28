# Reprise par Claude

## Branche et périmètre

Branche : `codex/socle-administration`, destinée à une PR vers `main` de `FasoDigital6/sacko-gestion`.

Cette PR termine l'étape 1 du socle. Elle ne contient pas les modules Véhicules, Prix, Clients ou Conteneurs. Aucune ressource Firebase réelle n'a été créée ou modifiée, aucun déploiement n'a été effectué.

Lire d'abord `CLAUDE.md`, puis `docs/decisions.md` (les sections 15 et 16 complètent ou remplacent le cadrage initial).

## Ce qui fonctionne

- `/utilisateurs` : liste recherchable, création avec modèle Vendeur ou Agent Guinée, édition des actions par module, sites et permissions spéciales, désactivation/réactivation, renvoi d'une invitation en échec.
- `/parametres` : taux USD/GNF pour 1 CAD, TPS/TVQ, identité et mentions de l'entreprise, comptes bancaires, historique des 20 dernières versions affichées. Toutes les versions restent conservées en base.
- Révocation : vérification fraîche du jeton, du compte actif et d'`accessVersion` côté serveur et dans les règles Firestore. Un custom token ne transporte plus les anciens droits. Les modifications partielles ne changent pas implicitement le rôle.
- Plafond de 15 : réservation transactionnelle partagée avec le script d'amorçage ; les comptes désactivés et les créations en cours comptent dans le plafond. Le dernier administrateur actif est protégé ; les promotions, créations et réactivations encore inaccessibles ne comptent pas comme administrateurs actifs.
- Auth et Firestore ne sont pas atomiques ensemble : les modifications utilisent un verrou temporaire et réconcilient la fiche avec l'état Auth après un échec. En cas de double échec, les accès restent bloqués.

## Vérifications déjà réalisées

- `pnpm check:local` : lint, cycles, knip, typecheck, **32 tests unitaires**, build de production réussis.
- `pnpm test:e2e` : **10 tests réussis** sur les émulateurs `demo-sacko-green`, y compris deux créations simultanées avec un seul créneau disponible, la révocation, la réactivation, le dernier admin et l'affichage mobile.
- Il reste 11 avertissements de lint issus du squelette, sans nouvelle erreur.
- Un téléchargement des polices Google a échoué ponctuellement au build ; la relance complète a réussi. Le build utilise toujours `next/font/google`.

Commandes, prérequis et captures : `docs/tests.md`. Les captures, traces, données de session et répertoires de build sont ignorés par Git.

## Pour continuer

1. Relire cette PR et les garanties d'accès avant de la fusionner. Rien n'a encore été fusionné dans `main` par Codex.
2. Configurer le vrai projet Firebase de développement si nécessaire : Firestore en `northamerica-northeast1` (Montréal), Auth email/mot de passe, variables de `.env.example` dans `.env.local`, puis déployer les règles Firestore/Storage. Les émulateurs n'ont pas déployé ces règles dans un projet réel.
3. Créer le premier administrateur réel avec `node --env-file=.env.local scripts/creer-admin.mjs email "Prénom" "Nom"`. Le script n'envoie pas de mot de passe ; utiliser « Mot de passe oublié » pour le choisir.
4. Vérifier les deux écrans avec ce compte sur le projet de développement. Renseigner les vrais taux et confirmer les numéros de TPS/TVQ ; aucun taux fictif ni numéro fiscal non confirmé n'est prérempli.
5. Cadrer puis commencer l'étape 2 **Véhicules**, conformément à `CLAUDE.md`. Ne pas reprendre le multi-entreprises. Les coûts devront rester dans `vehicules/{id}/prive/couts` ; les futures opérations devront figer leurs propres taux.

Ne jamais utiliser `sackogreen-dev` ou `sackogreen-prod` pour les tests automatisés. Les tests e2e ignorent `.env.local` et utilisent uniquement les émulateurs locaux.
