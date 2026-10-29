# Firebase de développement

Configuration créée les 28–29 octobre 2026.

## Ressources configurées

- Projet : `sackogreen-dev` (nom affiché : Sacko-Green Dev).
- Application web : `1:1084874529963:web:f5d99ddb59cf9e25f06bee`.
- Firestore : base `(default)`, édition Standard, mode natif, région **northamerica-northeast1 (Montréal)**, offre gratuite de la base.
- Firebase Authentication : fournisseur email/mot de passe activé via la configuration `auth.providers.emailPassword` de `firebase.json`.
- Règles et index Firestore déployés depuis le dépôt ; aucune ouverture générale en lecture/écriture.
- Premier administrateur créé, actif, avec le même rôle et la même version d'accès dans Auth et Firestore.

Compte serveur : `sacko-gestion-admin@sackogreen-dev.iam.gserviceaccount.com`, avec les rôles `roles/firebaseauth.admin` et `roles/datastore.user` sur ce seul projet. Ces droits et la création de la clé locale ont été explicitement autorisés.

## Configuration locale

`.env.local` contient la configuration web, les secrets de session et la clé privée du compte serveur. Il est ignoré par Git et ses permissions sont `0600`. Le fichier JSON temporaire de clé a été supprimé après installation. Ne jamais afficher, commiter ou recopier les valeurs privées dans une PR.

Le fichier `.firebaserc` associe les alias `default` et `dev` à `sackogreen-dev`. Toujours préciser `--project sackogreen-dev` et le compte Google autorisé pour les commandes de configuration : un autre compte peut être actif dans gcloud.

```sh
pnpm dev --hostname 127.0.0.1 --port 3000
```

Ouvrir `http://localhost:3000/login`. Le compte initial a reçu un mot de passe aléatoire non communiqué ; utiliser **Mot de passe oublié** pour choisir son mot de passe. Aucun email de réinitialisation n'a été envoyé automatiquement pendant l'amorçage.

## Vérifications et suite

Vérification en lecture seule du vrai projet : accès serveur à Auth et Firestore réussi, administrateur actif des deux côtés, versions d'accès égales et un seul compte enregistré à l'amorçage. Les tests automatisés restent exclusivement sur les émulateurs (`docs/tests.md`).

Storage (photos et documents), Resend, Cloud Functions et l'hébergement de l'application ne sont pas configurés par cette étape. Aucun projet de production n'a été créé.
