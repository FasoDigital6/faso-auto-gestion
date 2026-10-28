import { View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import type { Entreprise } from "@/domain/types/entreprise";

/** Style @react-pdf, dérivé du composant plutôt que de `@react-pdf/types` (non hoisté par pnpm). */
type Unwrap<T> = T extends (infer U)[] ? U : T;
type PdfStyle = Unwrap<Exclude<React.ComponentProps<typeof View>["style"], undefined>>;

/** Fusionne des styles (simples ou tableaux) en un tableau plat, comme l'exige @react-pdf. */
function mergeStyles(...styles: (PdfStyle | PdfStyle[] | undefined)[]): PdfStyle[] {
  return styles.flat().filter((s): s is PdfStyle => s !== undefined);
}

/**
 * Composants PDF partagés (@react-pdf/renderer).
 *
 * RÈGLE : tout nouveau template PDF doit utiliser ces composants
 * (PdfLetterhead, PdfTableHeader, PdfTableRow, PdfFooterBlock) plutôt que des
 * View/Text bruts pour l'en-tête, le tableau et le bloc de fin de document.
 * Raison : @react-pdf casse la pagination dès qu'un View qui ne devrait pas
 * être coupé (une ligne de tableau, le bloc total + signature) se retrouve à
 * cheval sur deux pages. Ces composants encapsulent une fois pour toutes les
 * `wrap={false}` / `minPresenceAhead` nécessaires — un template qui les
 * utilise obtient une pagination correcte automatiquement, sans y penser.
 */

/** Vert du logo Sacko-Green. */
const DEFAULT_ACCENT = "#015e07";

/** Formate un montant avec des espaces comme séparateurs de milliers. */
export function formatMontant(montant: number): string {
  return montant.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

// =============================================
// PdfLetterhead — logo / en-tête société + filigrane
// =============================================

const letterheadStyles = StyleSheet.create({
  headerImage: {
    position: "absolute",
    top: 8,
    left: 15,
    right: 15,
    height: 80,
  },
  defaultHeader: {
    position: "absolute",
    top: 22,
    left: 25,
    right: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  defaultLogo: {
    width: 46,
    height: 46,
    marginRight: 12,
    objectFit: "contain",
  },
  defaultName: {
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 0.5,
    textAlign: "center",
  },
  watermark: {
    position: "absolute",
    top: "35%",
    left: "20%",
    opacity: 0.08,
    width: 400,
    height: 400,
  },
  watermarkText: {
    position: "absolute",
    top: "45%",
    left: 20,
    right: 20,
    textAlign: "center",
    fontSize: 36,
    fontWeight: "bold",
    opacity: 0.08,
  },
  simpleHeader: {
    position: "absolute",
    top: 18,
    left: 25,
    alignItems: "flex-start",
  },
  simpleLogo: {
    width: 130,
    height: 100,
    objectFit: "contain",
  },
  /** Bannière personnalisée (`headerUrl`) : plus large qu'un simple logo,
   * mais toujours cadrée en haut à gauche, sans distordre l'image source. */
  simpleHeaderImage: {
    width: 260,
    height: 90,
    objectFit: "contain",
  },
  simpleName: {
    fontSize: 14,
    fontWeight: "bold",
  },
});

type EntrepriseHeader = Partial<
  Pick<Entreprise, "headerUrl" | "logoUrl" | "nom">
>;

/**
 * En-tête PDF partagé, alimenté par l'entreprise (tenant).
 *
 * Deux rendus :
 *  1. Bannière configurée (`headerUrl`) → on affiche l'image telle quelle.
 *  2. Aucune bannière → repli propre : un en-tête typographique (logo si
 *     disponible, sinon rien + nom de l'entreprise). Ainsi un tenant qui n'a
 *     pas encore configuré son branding obtient tout de même un document
 *     identifié et net, jamais une bande vide.
 *
 * Le repli n'utilise que des données propres au tenant (nom, logo) : aucun
 * visuel générique partagé qui afficherait la marque d'un autre tenant.
 *
 * NB: @react-pdf exige des URLs accessibles. Les logos Storage utilisent des
 * download URLs tokenisées ; les chemins /imgs/* sont servis par l'app.
 */
export function PdfLetterhead({
  entreprise,
  variant = "banner",
}: {
  entreprise?: EntrepriseHeader;
  /** "simple" : juste le logo (ou le nom) en haut à droite, sans bannière ni filigrane. */
  variant?: "banner" | "simple";
}) {
  const e = entreprise ?? {};

  if (variant === "simple") {
    return (
      <View style={letterheadStyles.simpleHeader} fixed>
        {e.headerUrl ? (
          <Image src={e.headerUrl} style={letterheadStyles.simpleHeaderImage} />
        ) : e.logoUrl ? (
          <Image src={e.logoUrl} style={letterheadStyles.simpleLogo} />
        ) : e.nom ? (
          <Text style={letterheadStyles.simpleName}>{e.nom}</Text>
        ) : null}
      </View>
    );
  }

  return (
    <>
      {e.headerUrl ? (
        <Image src={e.headerUrl} style={letterheadStyles.headerImage} fixed />
      ) : (
        <View style={letterheadStyles.defaultHeader} fixed>
          {e.logoUrl ? (
            <Image src={e.logoUrl} style={letterheadStyles.defaultLogo} />
          ) : null}
          {e.nom ? <Text style={letterheadStyles.defaultName}>{e.nom}</Text> : null}
        </View>
      )}

      {/* Filigrane : logo en fond, sinon nom en gros, sinon rien. */}
      {e.logoUrl ? (
        <Image src={e.logoUrl} style={letterheadStyles.watermark} fixed />
      ) : e.nom ? (
        <Text style={letterheadStyles.watermarkText} fixed>
          {e.nom}
        </Text>
      ) : null}
    </>
  );
}

// =============================================
// PdfDocumentHeader — bloc informations + destinataire + titre (thème "sobre")
// =============================================

const documentHeaderStyles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  boxesRow: { flexDirection: "row", justifyContent: "space-between" },
  infoBox: { width: "26%", padding: 10 },
  destinataireBox: { width: "66%", backgroundColor: "#f3f4f6", borderRadius: 3, padding: 10 },
  destinataireLabel: {
    fontSize: 8,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 4,
    color: "#666666",
  },
  infoRowsWrap: {
    marginTop: 8,
    borderTopWidth: 0.5,
    borderTopColor: "#c7ccd2",
    paddingTop: 6,
  },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 3 },
  infoLabel: { fontSize: 8.5, color: "#666666" },
  infoValue: { fontSize: 8.5, fontWeight: "bold", textAlign: "right", maxWidth: "60%" },
  destinataireName: { fontSize: 10, fontWeight: "bold", marginBottom: 2 },
  destinataireLine: { fontSize: 9, color: "#374151" },
});

export interface PdfHeaderInfoRow {
  label: string;
  value: string;
}

/**
 * Bloc d'en-tête "sobre" : à gauche un petit encadré avec uniquement le
 * numéro du document, à droite le destinataire suivi des informations
 * (date, délais, contact…). Vient après `PdfLetterhead` (logo/bannière) dans
 * le flux de la page — celui-ci reste inchangé, ce bloc ne fait qu'ajouter le
 * contenu qui variait auparavant par thème (numéro + carte client).
 */
export function PdfDocumentHeader({
  numeroLabel,
  numero,
  infoRows,
  destinataireNom,
  destinataireLignes = [],
}: {
  numeroLabel: string;
  numero: string;
  infoRows: PdfHeaderInfoRow[];
  destinataireNom: string;
  destinataireLignes?: string[];
}) {
  return (
    <View style={documentHeaderStyles.wrap}>
      <View style={documentHeaderStyles.boxesRow}>
        <View style={documentHeaderStyles.infoBox}>
          <Text style={documentHeaderStyles.destinataireLabel}>{numeroLabel}</Text>
          <Text style={documentHeaderStyles.destinataireName}>{numero}</Text>
        </View>
        <View style={documentHeaderStyles.destinataireBox}>
          <Text style={documentHeaderStyles.destinataireLabel}>Client</Text>
          <Text style={documentHeaderStyles.destinataireName}>{destinataireNom}</Text>
          {destinataireLignes.map((line, i) => (
            <Text key={i} style={documentHeaderStyles.destinataireLine}>
              {line}
            </Text>
          ))}
          <View style={documentHeaderStyles.infoRowsWrap}>
            {infoRows.map((row, i) => (
              <View key={i} style={documentHeaderStyles.infoRow}>
                <Text style={documentHeaderStyles.infoLabel}>{row.label}</Text>
                <Text style={documentHeaderStyles.infoValue}>{row.value}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

// =============================================
// PdfTableHeader / PdfTableRow — tableau générique
// =============================================

export interface PdfTableColumn {
  key: string;
  label: string;
  width: string;
  align?: "left" | "center" | "right";
  /** Style additionnel (bordures, couleur…) fusionné sur la cellule. */
  style?: PdfStyle;
}

const tableStyles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
  },
  row: {
    flexDirection: "row",
  },
});

/**
 * En-tête de tableau. `fixed` le fait répéter sur chaque page (utile pour un
 * tableau long qui déborde) — désactive-le si le template gère lui-même la
 * répétition (ou n'en a pas besoin, ex. tableau toujours court).
 */
export function PdfTableHeader({
  columns,
  style = {},
  cellStyle = {},
  fixed = true,
}: {
  columns: PdfTableColumn[];
  style?: PdfStyle | PdfStyle[];
  cellStyle?: PdfStyle;
  fixed?: boolean;
}) {
  return (
    <View style={mergeStyles(tableStyles.headerRow, style)} fixed={fixed}>
      {columns.map((col) => (
        <Text
          key={col.key}
          style={mergeStyles(cellStyle, { width: col.width, textAlign: col.align ?? "left" }, col.style)}
        >
          {col.label}
        </Text>
      ))}
    </View>
  );
}

/**
 * Ligne de tableau. `wrap={false}` intégré : une ligne ne se coupe jamais
 * entre deux pages (sans ça, @react-pdf peut couper une ligne au milieu,
 * affichant ses cellules à cheval sur deux pages).
 */
export function PdfTableRow({
  columns,
  cells,
  style = {},
  cellStyle = {},
}: {
  columns: PdfTableColumn[];
  cells: React.ReactNode[];
  style?: PdfStyle | PdfStyle[];
  cellStyle?: PdfStyle;
}) {
  return (
    <View style={mergeStyles(tableStyles.row, style)} wrap={false}>
      {columns.map((col, i) => (
        <Text
          key={col.key}
          style={mergeStyles(cellStyle, { width: col.width, textAlign: col.align ?? "left" }, col.style)}
        >
          {cells[i]}
        </Text>
      ))}
    </View>
  );
}

// =============================================
// PdfFooterBlock — total + mentions légales + signature + tampon
// =============================================

const footerBlockStyles = StyleSheet.create({
  totalsWrap: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 10,
  },
  totalsBox: { width: "50%" },
  totalLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 2,
    fontSize: 9,
  },
  totalLabel: { color: "#666666" },
  // Volontairement minimal (pas de bordure/fond) : chaque template fournit sa
  // propre mise en évidence via `emphasisRowStyle`/`emphasisTextStyle` (thème
  // d'impression pour les proformas, style fixe pour les autres documents).
  netRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    marginTop: 3,
  },
  netLabel: { fontWeight: "bold" },
  netValue: { fontWeight: "bold" },
  amountWords: {
    fontSize: 9,
    fontStyle: "italic",
    marginBottom: 14,
  },
  dateLocation: {
    textAlign: "right",
    fontSize: 9,
    fontStyle: "italic",
    color: "#666666",
    marginBottom: 4,
  },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  /** Colonne : titre, puis la rangée signature+cachet (groupée), puis le nom. */
  signataireBlock: {
    alignItems: "center",
  },
  /** Rangée signature+cachet : les deux images sont groupées côte à côte,
   * jamais éloignées l'une de l'autre même si le titre/nom sont plus larges. */
  signatureCachetRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  signataireTitle: {
    fontSize: 10.5,
    fontWeight: "bold",
    fontStyle: "italic",
    marginBottom: 5,
  },
  signatureImage: {
    width: 115,
    height: 58,
    marginVertical: 4,
    objectFit: "contain",
    // Colle le tracé de la signature contre le bord droit de son cadre
    // (côté cachet) : sans ça, une image de signature avec de la marge
    // interne (courant sur un fichier scanné) se retrouve centrée dans son
    // cadre et paraît "loin" du cachet même si les deux cadres se touchent.
    objectPositionX: "right",
  },
  cachetImage: {
    width: 65,
    height: 65,
    marginLeft: 2,
    objectFit: "contain",
    // Symétrique de signatureImage : colle le tampon contre son bord gauche.
    objectPositionX: "left",
  },
  signaturePlaceholder: { width: 115, height: 58, marginVertical: 4 },
  cachetPlaceholder: { width: 65, height: 65, marginLeft: 2 },
  signataireName: { fontSize: 10.5, fontWeight: "bold", marginTop: 8 },
});

export interface PdfTotalLine {
  label: string;
  value: string;
  /** Ligne finale (Net à payer / Total net) — mise en évidence, filet haut+bas. */
  emphasis?: boolean;
  /** Couleur du montant (ex. rouge pour une remise). Ignoré si `emphasis`. */
  valueColor?: string;
}

interface PdfSignataire {
  titre: string;
  nom?: string;
  signatureSrc?: string;
  cachetSrc?: string;
  includeImages?: boolean;
  /** Le tampon ne s'affiche que pour le fournisseur ; le client n'en a pas. */
  withCachet?: boolean;
}

interface PdfFooterBlockProps {
  /** Lignes de totaux (Total, Remise, TVA, Net à payer…). Omis si le document n'en a pas (ex. BDL). */
  totals?: PdfTotalLine[];
  /** Texte "Arrêté le présent document à la somme de…". */
  montantEnLettres?: string;
  /** Override de style pour le texte du montant en lettres (chaque document a sa propre emphase). */
  montantEnLettresStyle?: PdfStyle;
  /** "Conakry, 12 janvier 2026" — affiché aligné à droite au-dessus des signatures. */
  dateLocation?: string;
  /** 1 signataire (aligné à droite) ou 2 (fournisseur + client, répartis). Omis si le document n'en a pas (ex. rapport client). */
  signataires?: PdfSignataire[];
  /** Contenu additionnel inséré après le montant en lettres, avant la date/lieu (ex. conditions du contrat). */
  beforeDate?: React.ReactNode;
  /** Contenu additionnel inséré entre la date/lieu et la signature (ex. informations commerciales). */
  children?: React.ReactNode;
  /** Contenu additionnel inséré après la signature (ex. conditions de livraison d'un proforma). */
  afterSignature?: React.ReactNode;
  /** Espace minimum requis en bas de page pour amorcer le bloc, sinon il est repoussé à la page suivante. */
  minPresenceAhead?: number;
  style?: PdfStyle;
  /** Overrides de style pour la ligne "Net à payer" (ex. accent du thème d'impression). */
  emphasisRowStyle?: PdfStyle;
  emphasisTextStyle?: PdfStyle;
  /** Override de style pour la rangée de signature(s) (ex. marges spécifiques). */
  signatureRowStyle?: PdfStyle;
  /** Override de style pour l'encadré des totaux (ex. bordure du thème "sobre"). */
  totalsBoxStyle?: PdfStyle;
}

function Signataire({ signataire }: { signataire: PdfSignataire }) {
  const { titre, nom, signatureSrc, cachetSrc, includeImages, withCachet } = signataire;
  return (
    <View style={footerBlockStyles.signataireBlock}>
      <Text style={footerBlockStyles.signataireTitle}>{titre}</Text>
      <View style={footerBlockStyles.signatureCachetRow}>
        {includeImages && signatureSrc ? (
          <Image src={signatureSrc} style={footerBlockStyles.signatureImage} />
        ) : (
          <View style={footerBlockStyles.signaturePlaceholder} />
        )}
        {withCachet ? (
          includeImages && cachetSrc ? (
            <Image src={cachetSrc} style={footerBlockStyles.cachetImage} />
          ) : (
            <View style={footerBlockStyles.cachetPlaceholder} />
          )
        ) : null}
      </View>
      {nom ? <Text style={footerBlockStyles.signataireName}>{nom}</Text> : null}
    </View>
  );
}

/**
 * Bloc de fin de document : total, montant en lettres, date/lieu, signature(s)
 * et tampon. Regroupé dans un seul `View` avec `wrap={false}` et
 * `minPresenceAhead` : soit tout le bloc tient sur la page courante, soit il
 * bascule intégralement sur la suivante — jamais coupé entre le total et la
 * signature.
 */
export function PdfFooterBlock({
  totals,
  montantEnLettres,
  montantEnLettresStyle = {},
  dateLocation,
  signataires = [],
  beforeDate,
  children,
  afterSignature,
  // 90 suffisait pour l'ancien bloc signature (petites images) ; désormais la
  // signature/le cachet sont plus grands et le thème "sobre" ajoute un
  // encadré de totaux — un bloc plus haut qui, avec un seuil trop bas,
  // pouvait démarrer trop près du bas de page et déborder sur le pied de
  // page légal (fixe) au lieu de basculer proprement sur la page suivante.
  minPresenceAhead = 260,
  style,
  emphasisRowStyle = {},
  emphasisTextStyle = {},
  signatureRowStyle = {},
  totalsBoxStyle = {},
}: PdfFooterBlockProps) {
  return (
    <View wrap={false} minPresenceAhead={minPresenceAhead} style={style}>
      {totals && totals.length > 0 && (
        <View style={footerBlockStyles.totalsWrap}>
          <View style={mergeStyles(footerBlockStyles.totalsBox, totalsBoxStyle)}>
            {totals.map((line, i) => (
              <View
                key={i}
                style={
                  line.emphasis
                    ? mergeStyles(footerBlockStyles.netRow, emphasisRowStyle)
                    : footerBlockStyles.totalLine
                }
              >
                <Text
                  style={
                    line.emphasis
                      ? mergeStyles(footerBlockStyles.netLabel, emphasisTextStyle)
                      : footerBlockStyles.totalLabel
                  }
                >
                  {line.label}
                </Text>
                <Text
                  style={
                    line.emphasis
                      ? mergeStyles(footerBlockStyles.netValue, emphasisTextStyle)
                      : line.valueColor
                        ? { color: line.valueColor }
                        : undefined
                  }
                >
                  {line.value}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {montantEnLettres ? (
        <View style={mergeStyles(footerBlockStyles.amountWords, montantEnLettresStyle)}>
          <Text>{montantEnLettres}</Text>
        </View>
      ) : null}

      {beforeDate}

      {dateLocation ? (
        <Text style={footerBlockStyles.dateLocation}>{dateLocation}</Text>
      ) : null}

      {children}

      {signataires.length > 0 && (
        <View style={mergeStyles(footerBlockStyles.signatureRow, signatureRowStyle)}>
          {signataires.length === 1 ? (
            <View style={{ flex: 1, alignItems: "flex-end" }}>
              <Signataire signataire={signataires[0]} />
            </View>
          ) : (
            signataires.map((s, i) => <Signataire key={i} signataire={s} />)
          )}
        </View>
      )}

      {afterSignature}
    </View>
  );
}

// =============================================
// PdfLegalFooter — mentions légales de l'entreprise, fixe en bas de chaque page
// =============================================

const legalFooterStyles = StyleSheet.create({
  footerContainer: {
    position: "absolute",
    bottom: 8,
    left: 20,
    right: 20,
  },
  footerImage: {
    width: "100%",
    height: 60,
  },
  footerBar: {
    height: 3,
    marginBottom: 5,
  },
  footerText: {
    fontSize: 8.5,
    fontWeight: "bold",
    fontStyle: "italic",
    textAlign: "left",
    lineHeight: 1.3,
  },
  // L'email ressort en couleur (comme un lien), le reste de la ligne reste
  // dans le texte légal noir/gras/italique.
  footerEmailLink: {
    color: "#1d4ed8",
  },
});

type EntrepriseFooter = Partial<
  Pick<
    Entreprise,
    | "nom"
    | "numTps"
    | "numTvq"
    | "adresse"
    | "ville"
    | "pays"
    | "telephone"
    | "email"
    | "piedDePage"
    | "comptesBancaires"
    | "piedDePageImageUrl"
    | "couleurPrimaire"
    | "couleurImpression"
  >
>;

const joinNonEmpty = (parts: (string | undefined | false)[], sep: string) =>
  parts.filter((p): p is string => !!p).join(sep);

/**
 * Pied de page légal (TPS, TVQ, adresse, banques…), fixé en bas de chaque
 * page. Distinct de `PdfFooterBlock` : celui-ci est la bande "mentions
 * entreprise" imprimée systématiquement, `PdfFooterBlock` est le bloc de
 * clôture du contenu (totaux/signature) propre à chaque document.
 */
export function PdfLegalFooter({ entreprise }: { entreprise?: EntrepriseFooter }) {
  const e = entreprise ?? {};

  if (e.piedDePageImageUrl) {
    return (
      <View style={legalFooterStyles.footerContainer} fixed>
        <Image src={e.piedDePageImageUrl} style={legalFooterStyles.footerImage} />
      </View>
    );
  }

  const ligneLegale = joinNonEmpty(
    [
      e.nom,
      e.numTps && `TPS ${e.numTps}`,
      e.numTvq && `TVQ ${e.numTvq}`,
    ],
    " - "
  );

  // Siège + téléphone sur la même ligne que l'email, mais l'email est rendu
  // séparément pour ressortir en couleur (comme un lien) dans le JSX.
  const siegeTel = joinNonEmpty(
    [
      joinNonEmpty([e.adresse, e.ville, e.pays], " / ") &&
        `Siège: ${joinNonEmpty([e.adresse, e.ville, e.pays], " / ")}`,
      e.telephone && `Tél: ${e.telephone}`,
    ],
    " - "
  );

  const banques = (e.comptesBancaires ?? []).map(
    (c) => `N° de Compte Bancaire ${c.numero} ${c.banque}`
  );

  // Aucune info de pied de page renseignée : on n'affiche rien (pas de barre
  // de couleur orpheline), pour un rendu propre plutôt qu'une bande vide.
  const aDuContenu =
    !!e.piedDePage || !!ligneLegale || banques.length > 0 || !!siegeTel || !!e.email;
  if (!aDuContenu) return null;

  // Couleur du filet : la couleur d'impression dédiée si elle est réglée
  // (Paramètres > Thème), sinon la couleur de marque du site, sinon un accent
  // par défaut.
  const barColor = e.couleurImpression || e.couleurPrimaire || DEFAULT_ACCENT;

  return (
    <View style={legalFooterStyles.footerContainer} fixed>
      <View style={[legalFooterStyles.footerBar, { backgroundColor: barColor }]} />
      {e.piedDePage ? (
        <Text style={legalFooterStyles.footerText}>{e.piedDePage}</Text>
      ) : null}
      {ligneLegale ? <Text style={legalFooterStyles.footerText}>{ligneLegale}</Text> : null}
      {banques.map((b, i) => (
        <Text key={i} style={legalFooterStyles.footerText}>
          {b}
        </Text>
      ))}
      {siegeTel || e.email ? (
        <Text style={legalFooterStyles.footerText}>
          {siegeTel}
          {siegeTel && e.email ? " - " : ""}
          {e.email ? (
            <Text style={legalFooterStyles.footerEmailLink}>Email: {e.email}</Text>
          ) : null}
        </Text>
      ) : null}
    </View>
  );
}
