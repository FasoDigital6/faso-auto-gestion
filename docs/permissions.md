# Permissions

Décisions Q21 et Q49 de [decisions.md](decisions.md). Code : [`src/domain/permissions/`](../src/domain/permissions/), tests : [`tests/unit/domain/permissions/`](../tests/unit/domain/permissions/).

## Rôles

| Rôle | Accès |
|---|---|
| `admin` | Tout : tous les modules, toutes les actions, les deux sites, les permissions spéciales, la gestion des comptes et des paramètres. Ses claims ne portent que `role: "admin"`. |
| `user` | Ce que l'admin lui a donné : des droits par module, un ou deux sites, des permissions spéciales. |

## Droits par module

Un droit s'écrit `MODULE:action`, par exemple `VEHICULES:modifier`.

- **Modules** : `TABLEAU_DE_BORD`, `VEHICULES`, `PRIX`, `CLIENTS`, `COMMANDES`, `PAIEMENTS`, `CONTENEURS`, `DEDOUANEMENT`, `FINANCES`.
- **Actions** : `voir`, `creer`, `modifier`, `supprimer`. « Voir » est accordé dès que le compte a une autre action sur le module.

Vérifier un droit : `peut(user, Module.VEHICULES, "modifier")`. Dans l'interface : `<AccesGate module={Module.VEHICULES} action="modifier">`.

## Permissions spéciales

| Valeur | Ce qu'elle permet | Décision |
|---|---|---|
| `VOIR_COUTS` | voir les coûts d'achat et le coût de revient | Q50 |
| `APPROUVER_PLANCHER` | approuver une vente sous le prix plancher | Q20 |
| `ANNULER` | annuler un paiement, une vente ou une facture | Q38 |

Vérifier : `aSpeciale(user, Speciale.VOIR_COUTS)`.

## Sites

`CA` (Canada) et `GN` (Guinée). Un admin a les deux. Vérifier : `accedeAuSite(user, "GN")`, ou `sitesDe(user)` pour la liste.

## Modèles de départ

Proposés à la création d'un compte, ajustables ensuite (`MODELES_ACCES`) :

| Modèle | Droits | Site |
|---|---|---|
| Vendeur | tableau de bord et véhicules en lecture ; clients et commandes : voir, créer, modifier ; paiements : voir, créer | Canada |
| Agent Guinée | tableau de bord en lecture ; véhicules, conteneurs, dédouanement : voir, modifier ; clients en lecture | Guinée |

Aucun modèle ne donne `VOIR_COUTS` : seul l'admin voit les coûts par défaut.

## Où les droits sont vérifiés

1. **Claims JWT** posés par les actions serveur ([`user-actions.ts`](../src/server/actions/user-actions.ts)) : `role`, `droits`, `speciales`, `sites`. Un changement révoque les jetons du compte pour s'appliquer tout de suite.
2. **Règles Firestore** ([`firestore.rules`](../firestore.rules)) : fonctions `peut`, `peutVoir`, `aSpeciale`, miroir du code. C'est la vraie barrière.
3. **Actions serveur** : le rôle se lit dans le jeton, jamais dans la requête.
4. **Interface** : `AccesGate` et la navigation masquent ce qui n'est pas accessible. C'est un confort, pas une sécurité.

Ajouter un module ou une permission spéciale : l'ajouter dans `permissions.ts`, dans les règles Firestore et Storage qui le concernent, dans ce document et dans les tests, dans le même commit.
