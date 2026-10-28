# Système de gestion Sacko-Green Inc : décisions

Récapitulatif des décisions prises lors de l'interview de cadrage (5 tours, Q1 à Q57) avec Amadou, le 22 octobre 2026, mis à jour le 26 octobre 2026. Ce document fait foi pour le développement : toute décision qui change ensuite s'ajoute ici, avec sa date. Ce n'est pas un cahier des charges détaillé : les écrans et le modèle de données se précisent étape par étape (voir `CLAUDE.md`).

## 1. Cadre du projet

| # | Décision |
|---|---|
| — | **Pas de SaaS.** Outil sur mesure pour Sacko-Green Inc seul (nom légal : **Sacko-Vert Inc.**, 1936, boulevard Saint-Régis, Dorval (Québec) H9P 1H6), hébergé en ligne. Pas de multi-entreprises. |
| Q1 | Tous les modules sont développés ; pas de livraison partielle au client. |
| Q2 | Développement : Amadou avec Claude. |
| Q7 | Interface en français uniquement. |
| Q10 | Application web légère et installable sur téléphone (PWA). Pas de mode hors-ligne complet : photos compressées avant envoi, brouillon conservé si la connexion coupe. |
| Q11 | Pas d'import des données existantes. Au besoin, un script de migration ponctuel. |
| Q12 | 15 comptes utilisateurs au maximum. |
| Q13 | Stack de Faso Gestion : Next.js 15 + React 19, Firebase (Firestore, Auth, Storage, Cloud Functions), TanStack Query, React Hook Form + Zod, Radix + Tailwind 4, `@react-pdf/renderer`, `pdf-lib`, Resend. Même architecture (`src/domain`, `src/features`, `src/data`, `src/server`) et mêmes règles que son `CLAUDE.md`. |
| Q14 | Nouveau projet dans ce dépôt. On copie de Faso Gestion le design system, le kit PDF, les permissions et la configuration de tests ; on laisse le multi-entreprises, les proformas, les appels d'offres et la fiscalité guinéenne. |
| Q27 | Nom de domaine : à décider plus tard. |

## 2. Sites

| # | Décision |
|---|---|
| Q4 | Exactement deux sites : **Canada** et **Guinée (Conakry)**. Les villes d'achat (Calgary, Ottawa, Montréal, Halifax…) sont une information sur la fiche du véhicule, pas des sites. |
| Q36 | Une vente compte pour le site du vendeur qui l'a faite. Le véhicule passe au stock du site Guinée à son arrivée à Conakry. |

## 3. Véhicules

### Modes de vente (Q3)

- **Stock** : la concession achète, puis cherche un acheteur.
- **Commande** : un client demande un modèle, la concession le trouve pour lui. Le véhicule est réservé à ce client dès l'achat et n'apparaît jamais comme disponible.

Les deux modes suivent la même règle de prix.

### Statuts (Q5, Q41)

```
Acheté → En transport (vers le dépôt) → En stock Canada → Réservé → Vendu
  → Chargé en conteneur → En mer → Arrivé à Conakry → Prêt pour dédouanement
  → Dédouané → En stock Guinée → Livré
```

Une voiture vendue au Canada va directement à « Livré » sans passer par le conteneur.

### Fiche (Q28, Q39, Q54)

- **Numéro interne** court : `SG-2026-0042`, utilisé à l'oral, sur l'étiquette et dans les messages.
- **Identification** : VIN, marque, modèle, année, version, couleur.
- **Caractéristiques** : kilométrage (saisi en km ou en miles, toujours affiché en km), transmission, carburant.
- **Titre** : clean / salvage / rebuilt.
- **Clés** : oui / non.
- **Achat** : provenance (Copart, IAAI, Manheim, ADESA, Marketplace, particulier, autre), numéro de lot, ville d'achat, date d'achat.
- **Photos** : 20 au maximum, compressées sur le téléphone (environ 1 600 px, 300 Ko). Une case « publique » par photo choisit celles de la fiche QR.
- **Documents** : facture d'encan, titre de propriété.
- **Notes**.

### Décodage du VIN (Q24)

API gratuite de la NHTSA (vPIC). Scan du code-barres avec l'appareil photo ou saisie manuelle.

### Alertes de stock (Q22)

- Seuil par **marque + modèle + année**.
- Alerte quand le nombre de véhicules disponibles (en stock, non réservés) descend au seuil ou en dessous.
- Alerte dans l'application et par e-mail à l'admin, une fois par franchissement.

## 4. Coûts, prix et marges

| # | Décision |
|---|---|
| Q18 | Coût de revient en catégories : prix d'achat, frais d'encan, transport terrestre, réparations / pièces, fret maritime, dédouanement Conakry, autre (libellé libre). Un frais ajouté après la vente réduit la marge réelle sans changer le prix convenu. |
| Q19 | Règle de marge par priorité : **véhicule > modèle (marque + modèle + année) > règle générale**. Chaque règle donne une marge affichée et une marge minimale, en % ou en montant fixe. |
| Q55 | Prix affiché arrondi au-dessus : à la centaine en CAD et USD, au million en GNF ; pas réglable. Le prix plancher n'est pas arrondi. |
| Q20 | Vente sous le prix plancher : refusée, avec un bouton « Demander l'approbation ». La vente reste « En attente » ; l'admin reçoit une notification et un e-mail, puis approuve ou refuse avec un motif. |
| Q35 | Fret : l'admin fixe un prix de fret facturé sur chaque ligne (voiture ou marchandise). Pour le coût de revient, le coût total du conteneur est réparti à parts égales entre ses véhicules, répartition modifiable. |

## 5. Devises et taxes

| # | Décision |
|---|---|
| Q6, Q15 | Devises USD, CAD et GNF. Chaque montant est enregistré dans sa devise d'origine avec les taux du jour de l'opération. Chaque utilisateur choisit dans ses préférences sa devise d'affichage. Les rapports convertissent avec les taux figés : une marge passée ne change pas quand les taux changent. Seul l'admin modifie les taux. |
| Q16 | La **TPS (5 %) et la TVQ (9,975 %)** payées à l'encan sont enregistrées comme **taxes récupérables**, hors coût de revient. Un rapport par période donne la TPS et la TVQ payées et collectées. *(modifié le 26 octobre 2026, voir section 15)* |
| Q17 | Case « Appliquer les taxes (TPS 5 % et TVQ 9,975 %) » sur chaque vente, décochée par défaut (ventes à l'export). Taux réglables séparément. *(modifié le 26 octobre 2026, voir section 15)* |
| Q9 | Pas de paiement en ligne. Les paiements sont saisis à la main, avec le moyen utilisé (Interac, virement, espèces, Orange Money…). |

## 6. Clients, commandes et argent

| # | Décision |
|---|---|
| Q29 | Fiche client : nom, téléphone WhatsApp au format international, e-mail (facultatif), pays et ville, type (particulier / gros client), site de rattachement, notes. Pas de pièce d'identité obligatoire. |
| Q30 | Une commande regroupe plusieurs lignes : véhicules, marchandises, services (fret, dédouanement). |
| Q23 | **Un seul relevé de compte par client** : ventes, fret, marchandises, achats faits pour lui avec son argent avancé, et ses paiements. Le solde dû vient de ce relevé. Une marchandise non payée est donc une dette sans action de plus. Un paiement peut se répartir sur plusieurs commandes ou rester en avance sur le compte. |
| Q31 | **Facture PDF simple** avec le logo, les mentions et les numéros de TPS et TVQ de Sacko-Vert Inc. (on ne reproduit pas leur facture actuelle). Reçu PDF pour chaque paiement. *(modifié le 26 octobre 2026, voir section 15)* |
| Q38 | On ne supprime jamais un paiement, une vente ou une facture : on l'annule avec un motif, et il reste visible, barré. Seul l'admin annule. |
| Q37 | Journal d'audit : qui a changé quoi et quand (prix, statuts, paiements, approbations, remises), consultable sur chaque fiche. |
| Q46 | Pas d'espace client avec connexion. Le client reçoit seulement des liens sécurisés : fiche publique, dossier de dédouanement, factures et reçus. |

## 7. Conteneurs et dédouanement

| # | Décision |
|---|---|
| Q34 | Fiche conteneur : numéro de conteneur, numéro de booking, compagnie, navire, port de départ, date de départ, date d'arrivée prévue à Conakry, coût total, taux de remplissage. Chaque ligne (véhicule ou marchandise) est rattachée à un client. |
| Q42 | Dossier de dédouanement **par client et par conteneur**. Fichiers déposés : connaissement, titre de propriété, preuve d'exportation, autres. Fichiers générés : facture commerciale, liste de colisage. |
| Q43 | Envoi bloqué si le client a encore un solde dû sur ce conteneur. L'admin peut passer outre, avec un motif enregistré au journal. |
| Q44 | Protection : lien personnel + code à 6 chiffres envoyé dans un second message, expiration après 7 jours (réglable, renvoyable), filigrane au nom du client sur chaque PDF, journal des ouvertures et téléchargements, révocation par l'admin. Lien et code envoyés par e-mail (deux messages séparés) ; jamais de pièce jointe directe. *(modifié le 26 octobre 2026, voir section 15)* |
| Q45 | Le dossier peut partir au client, à son transitaire ou à toute personne qu'il désigne. Le destinataire est saisi à l'envoi et tracé au journal. |

## 8. Notifications

| # | Décision |
|---|---|
| Q25 | **Pas d'envoi automatisé de messages WhatsApp** (option future, sur devis). Toutes les notifications partent **par e-mail via Resend**, derrière une interface d'envoi unique pour pouvoir ajouter un canal plus tard. *(modifié le 26 octobre 2026, voir section 15)* |
| Q32 | E-mails : véhicule acheté (avec photos), embarqué (conteneur, navire, arrivée prévue), arrivé à Conakry, dossier de dédouanement prêt, livré (remerciement), rappel de paiement. Chaque type s'active ou se coupe dans les paramètres ; un client peut être exclu des envois. |
| Q33 | Rappels de paiement **par e-mail** : par défaut tous les 7 jours tant que le solde est positif et que la voiture est arrivée à Conakry. Fréquence et conditions réglables. Bouton d'envoi manuel. |

## 9. Fiche publique et QR

| # | Décision |
|---|---|
| Q26 | Feuille PDF d'étiquettes à coller sur les autocollants existants : QR code, marque, modèle, année, fin du VIN. La fiche publique montre les photos publiques et le prix affiché, avec les boutons « Commander » et « WhatsApp » (simple lien `wa.me` qui ouvre une conversation, sans automatisation). Une voiture réservée ou vendue affiche « Vendu », sans prix. |

## 10. Rôles et accès

| # | Décision |
|---|---|
| Q21, Q49 | Deux rôles techniques : **admin** et **utilisateur**. Pas de superadmin. Chaque utilisateur a des droits par module (voir / créer / modifier / supprimer), un site (Canada, Guinée ou les deux) et des permissions spéciales : « voir les coûts », « approuver sous le plancher », « annuler ». |
| Q21 | Modèles de départ : **Admin** (tout), **Vendeur** (son site, sans les coûts), **Agent Guinée** (statuts, arrivées, livraisons). « Voir les coûts » est réservé à l'admin par défaut. |

## 11. Tableau de bord (Q40)

Filtrable par site et par période, dans la devise de l'utilisateur :

- achats, ventes et marge du mois ;
- véhicules en stock (Canada / Guinée) ;
- véhicules en mer et conteneurs en cours ;
- total des créances et top 5 des débiteurs ;
- alertes de stock ;
- approbations en attente.

## 12. Architecture technique

| # | Décision |
|---|---|
| Q47 | Firestore et Cloud Functions en `northamerica-northeast1` (Montréal), Vercel en `iad1`. La région Firestore est définitive dès la création du projet. |
| Q48 | **Hébergement géré par FasoDigital** : FasoDigital crée et gère les projets Firebase (`sackogreen-dev`, `sackogreen-prod`), Vercel, Resend et le nom de domaine. Sacko-Green obtient un accès sur demande ; frais refacturés au coût réel. En fin de contrat, comptes, domaine et données sont transférés au client s'il le demande. *(modifié le 26 octobre 2026, voir section 15)* |
| Q50 | Coûts d'achat dans un document séparé `vehicules/{id}/prive/couts`, refusé par les règles Firestore sans la permission « voir les coûts ». |
| Q51 | Prix plancher, répartition des paiements, annulations et dossiers de dédouanement passent par des actions serveur. Les écritures du relevé sont immuables (annulation = nouvelle écriture). Solde recalculé par Cloud Function. |
| Q52 | La fiche publique lit uniquement `vitrine/{id}` (photos publiques, description, prix affiché, statut), tenu à jour par Cloud Function. |
| Q53 | Documents de dédouanement privés dans Storage. La page sécurisée vérifie lien, code et expiration ; le serveur ajoute le filigrane (`pdf-lib`) au téléchargement et journalise l'accès. |
| Q57 | Tous les calculs dans `src/domain` avec tests chiffrés (marges, arrondis, conversions, soldes, répartition du fret, TPS et TVQ). `pnpm check` vert avant chaque livraison, tests e2e sur émulateurs, documentation dans le même commit que le code. |

## 13. Ordre de développement (Q56)

1. **Socle** : connexion, rôles, sites, paramètres, taux de change.
2. **Véhicules** : VIN, photos, coûts, statuts, journal.
3. **Prix** : marges, prix affiché et plancher, approbations.
4. **Clients et argent** : clients, commandes, relevé, paiements, reçus PDF.
5. **Conteneurs** : chargements, marchandises, répartition du fret.
6. **Facture PDF** simple, avec les mentions de Sacko-Vert Inc.
7. **Dédouanement** : dossiers, liens sécurisés, filigrane.
8. **Notifications** : e-mails automatiques et rappels de paiement par e-mail.
9. **QR** : étiquettes et fiche publique.
10. **Pilotage** : tableau de bord, alertes de stock, rapport TPS et TVQ.

## 14. À fournir ou à décider

- [ ] Logo et mentions à faire figurer sur la facture (étape 6). Numéros connus d'après leur facture n° 059 : TPS 718120223RT0001, TVQ 1232329960TQ0001 (à confirmer).
- [ ] Nom de domaine (Q27).
- [ ] Création par FasoDigital des projets Firebase (région `northamerica-northeast1`), Vercel et Resend.
- [ ] Confirmation par leur comptable du traitement de la TPS et de la TVQ (Q16, Q17).

## 15. Modifications après le cadrage (26 octobre 2026)

Décisions prises lors de la préparation de la proposition commerciale et du contrat.

| Sujet | Avant | Maintenant |
|---|---|---|
| Province et taxes (Q16, Q17) | Alberta, TPS seule | Québec : TPS 5 % et TVQ 9,975 % |
| WhatsApp (Q25, Q32, Q33, Q44) | Messages automatiques par l'API Meta | Retiré du périmètre ; notifications, rappels et liens de dédouanement par e-mail |
| Facture (Q31) | Copie de leur facture actuelle | Facture simple aux mentions de Sacko-Vert Inc. |
| Comptes et hébergement (Q48) | Au nom de Sacko-Green, payés par eux | Gérés par FasoDigital, accès client sur demande, frais refacturés |

**Contexte commercial** (n'affecte pas le code) : projet facturé 8 500 CAD (50 % à la signature, 50 % à la mise en production), garantie de 3 mois, maintenance annuelle de 2 500 USD (ou 1 250 USD par semestre, ou 250 USD par mois). Représentant de FasoDigital : Mohamed Camara. Contrat régi par le droit du Québec (Loi 25 pour les renseignements personnels).

**Site vitrine** : il existe déjà dans le dépôt `FasoDigital6/sacko-green-vitrine` (Next.js 16, catalogue d'exemples dans `lib/sacko/catalog.ts`). Le système l'alimentera par les documents `vitrine/{id}` (Q52) ; les champs à exposer sont ceux du type `Vehicle` de ce dépôt.

