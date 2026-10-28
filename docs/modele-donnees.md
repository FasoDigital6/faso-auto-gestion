# Modèle de données

Une seule entreprise : les collections sont à la racine de Firestore (pas de `entreprises/{id}`). Chaque collection ajoutée s'inscrit ici, dans [`src/domain/collections.ts`](../src/domain/collections.ts) et dans [`firestore.rules`](../firestore.rules), dans le même commit.

Région : `northamerica-northeast1` (Montréal), définitive à la création du projet Firebase (Q47).

## `users/{uid}`

Fiche d'un employé. Écrite uniquement par les actions serveur (Admin SDK) et par le script `scripts/creer-admin.mjs`. Lecture : le compte lui-même, ou un admin.

| Champ | Type | Description |
|---|---|---|
| `email` | string | adresse de connexion |
| `prenom`, `nom` | string | identité |
| `telephone`, `poste` | string | facultatifs |
| `role` | `"admin"` \| `"user"` | miroir du claim |
| `droits` | string[] | miroir du claim, `MODULE:action` (absent pour un admin) |
| `speciales` | string[] | miroir du claim (absent pour un admin) |
| `sites` | string[] | miroir du claim : `CA`, `GN` (absent pour un admin) |
| `disabled` | boolean | compte désactivé |
| `createdAt`, `updatedAt` | string ISO | dates |

Les droits font foi dans les **claims JWT**, pas dans ce document : la fiche sert à l'affichage.

## À venir

Collections prévues par [decisions.md](decisions.md), à décrire ici quand elles sont créées : `parametres` (taux de change historisés, TPS, TVQ, arrondis, identité de l'entreprise), `vehicules` et `vehicules/{id}/prive/couts` (Q50), `reglesMarge`, `clients`, `commandes`, `ecritures` (relevé client immuable, Q51), `paiements`, `conteneurs`, `dossiersDedouanement`, `vitrine` (fiche publique, Q52), `journal` (audit, Q37).
