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
| `accessVersion` | string | version aléatoire, miroir du claim ; toute ancienne version est refusée |
| `statut` | `"creation"` ou `"actif"` | réservation du créneau pendant la création du compte Auth |
| `invitationEnvoyee` | boolean | échec d'email récupérable par renvoi depuis la liste |
| `mutationEnCours` | string, temporaire | verrou d'une modification Auth/Firestore ; accès refusé tant qu'il est présent |

Les droits font foi dans les **claims JWT**, pas dans ce document : la fiche sert à l'affichage.

## `systeme/comptes`

Verrou serveur de sérialisation des créations et modifications de comptes. Champ `revision` numérique incrémenté en transaction. La limite de 15 inclut les réservations et les comptes désactivés. Les clients n'ont aucun accès à cette collection. Le script d'amorçage utilise le même verrou.

Une création Auth en échec libère sa réservation après nettoyage. Un nouveau compte n’est publié actif dans Firestore qu’après son activation Auth. Les promotions et réactivations en cours sont exclues du comptage des administrateurs actifs. Une modification réserve le compte, change sa version puis synchronise Auth. En cas d'échec, la fiche est réconciliée avec les claims effectivement enregistrés dans Auth ; si la réconciliation échoue aussi, l'accès reste fermé. Le script d'amorçage permet de rétablir un administrateur après réparation de la configuration Firebase.

## `parametres/general`

Lecture réservée aux administrateurs actifs, écritures uniquement par action serveur.

| Champ | Type | Description |
|---|---|---|
| `revision` | number | entier croissant, contrôle des modifications concurrentes |
| `taux` | `{ CAD: 1, USD: number, GNF: number }` | nombre d'unités de chaque devise pour 1 CAD ; taux positifs finis |
| `taxes` | `{ tps: number, tvq: number }` | pourcentages (5 et 9,975 initialement), de 0 à 100 |
| `entreprise` | objet compatible `Entreprise` | identité, coordonnées, inscriptions fiscales, pied de page et comptes bancaires |
| `updatedAt` | string ISO | date serveur de l'enregistrement |
| `updatedBy` | string | uid de l'administrateur |

Tant que le document n'existe pas, l'écran propose l'identité connue et les taxes du cadrage ; les taux restent vides. Les numéros de taxes non confirmés ne sont pas préremplis.

### `parametres/general/historique/{id}`

Copie complète de chaque révision, créée dans la même transaction que le document courant. Aucune écriture client ni mise à jour d'une version historique. L'action serveur liste les 20 dernières versions ; toutes les versions sont conservées.

## À venir

Collections prévues par [decisions.md](decisions.md), à décrire ici quand elles sont créées : `vehicules` et `vehicules/{id}/prive/couts` (Q50), `reglesMarge`, `clients`, `commandes`, `ecritures` (relevé client immuable, Q51), `paiements`, `conteneurs`, `dossiersDedouanement`, `vitrine` (fiche publique, Q52), `journal` (audit, Q37).
