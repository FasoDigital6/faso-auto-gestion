# Vérifications du socle

## Sans projet Firebase réel

Prérequis : Node.js 22, pnpm, Java 21 dans le PATH (émulateur Firestore).

```sh
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm check:local
pnpm test:e2e
```

`check:local` lance le même `pnpm check` avec une clé RSA éphémère et des valeurs Firebase factices en mémoire. Il n'écrit aucun .env et ne déploie rien. Avec la configuration Firebase de développement, `pnpm check` reste utilisable directement.

Les parcours démarrent Auth sur 9099, Firestore sur 8080 et l'application de production sur 3100. Ces ports doivent être libres. Les serveurs existants ne sont jamais réutilisés. Le navigateur ne lit ni .env.local ni les projets sackogreen-dev/prod : seul demo-sacko-green est utilisé et remis à zéro.

Sur macOS, si `java -version` pointe sur une version antérieure à 21, sélectionner le JDK 21 dans le PATH et JAVA_HOME avant de lancer les tests.

## Couverture

- Permissions des modèles Vendeur et Agent Guinée, refus par défaut.
- Validation des taux positifs, des pourcentages, des droits et des numéros de téléphone.
- Vérification de révocation et de version des sessions ; état désactivé, fiche absente et rôle non administrateur.
- Connexion administrateur et employé, mauvais mot de passe, page privée sans connexion.
- Création et modification d'un employé, modèle de droits, champs facultatifs vidés et récupération après un rejet Firebase.
- Paramètres historisés avec auteur et date, refus d'une révision périmée.
- Anciennes sessions et lectures Firestore refusées après changement de droits ou désactivation ; reconnexion et réactivation.
- Protection du dernier administrateur.
- Deux créations simultanées lorsqu'il ne reste qu'un créneau : jamais plus de 15 comptes dans Auth ni Firestore.

Rapport Playwright : `playwright-report/index.html`. Traces et captures d'échec : `test-results/` (fichiers ignorés par Git).

Les tests ne valident pas les projets Firebase réels ni leur configuration de déploiement.

## Validation du 28 octobre 2026

État : **DONE**. `pnpm check:local` passe : lint, cycles, knip, types, 32 tests unitaires et build de production. Les 11 avertissements de lint restants appartiennent aux composants repris du squelette. `pnpm test:e2e` passe : 10 parcours, dont les refus de droits, la révocation immédiate, la récupération après rejet Firebase, la limite concurrente et l'affichage mobile.

Les correctifs traitent les causes suivantes : révocation non vérifiée et réinjection d'anciens claims, comptage des utilisateurs hors transaction, rôle par défaut appliqué à une mise à jour partielle, configuration e2e pointant sur des fichiers absents.

Captures locales : `tests/e2e/captures/utilisateurs-desktop.png`, `utilisateur-formulaire.png`, `parametres-mobile.png` (ignorées par Git). Aucun déploiement ni projet Firebase réel modifié.
