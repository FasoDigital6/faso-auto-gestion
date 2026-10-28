import { StyleSheet } from "@react-pdf/renderer";
import type { PdfThemeId } from "@/components/pdf/themes-catalogue";

/**
 * Modèles d'impression PDF ("thèmes").
 *
 * Un thème ne change PAS la structure des documents : il fait varier le style
 * (couleurs, bordures, en-tête de tableau, typo, espacement) sur une mise en
 * page commune. Chaque template PDF appelle `resolveTheme(id, accent)` et
 * applique les styles renvoyés — l'accent étant la couleur primaire du tenant.
 */

const INK = "#222222";
const MUTED = "#666666";
const LINE = "#dddddd";
const WHITE = "#ffffff";

/**
 * Éclaircit une couleur hex en la mélangeant avec du blanc — `amount` va de
 * 0 (couleur intacte) à 1 (blanc pur). Sert à dériver une teinte pastel d'une
 * couleur choisie par le tenant (ex: `couleurImpression` pour l'en-tête de
 * tableau des PDF), pour une touche de couleur présente mais discrète plutôt
 * qu'un aplat saturé. Retourne la couleur telle quelle si elle n'est pas un
 * hex valide (ex: valeur vide ou mal formée en base). Exportée pour être
 * réutilisée directement dans les templates PDF (proforma, facture…).
 */
export function lighten(hex: string, amount: number): string {
  let clean = hex.replace("#", "");
  if (/^[0-9a-fA-F]{3}$/.test(clean)) {
    clean = clean.split("").map((c) => c + c).join("");
  }
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return hex;
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const mix = (channel: number) => Math.round(channel + (255 - channel) * amount);
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(mix(r))}${toHex(mix(g))}${toHex(mix(b))}`;
}

/**
 * Styles concrets d'un thème, calculés avec la couleur d'accent du tenant.
 * Seuls les éléments qui varient d'un thème à l'autre sont ici ; la mise en
 * page (colonnes, signature, etc.) reste dans le template.
 */
export function resolveTheme(id: PdfThemeId, accent: string) {
  switch (id) {
    case "moderne":
      return StyleSheet.create({
        titleRow: { marginBottom: 12 },
        title: { fontSize: 16, fontWeight: "bold", color: accent, letterSpacing: 0.5 },
        clientCard: {
          backgroundColor: "#f6f6f7",
          borderLeftWidth: 3,
          borderLeftColor: accent,
          borderRadius: 3,
          paddingVertical: 9,
          paddingHorizontal: 12,
          marginBottom: 14,
        },
        clientLabel: { fontSize: 7.5, fontWeight: "bold", color: accent, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 3 },
        clientName: { fontSize: 12, fontWeight: "bold", color: "#111111" },
        clientLine: { fontSize: 9, color: "#374151", marginTop: 2 },
        tableWrap: { marginBottom: 10 },
        tableHeader: { backgroundColor: accent, paddingVertical: 6, paddingHorizontal: 6 },
        th: { fontSize: 8, fontWeight: "bold", color: WHITE, textTransform: "uppercase", letterSpacing: 0.3 },
        row: { paddingVertical: 5, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: "#e5e7eb" },
        rowAlt: { backgroundColor: "#fafafa" },
        netRow: { backgroundColor: accent, borderRadius: 3, paddingVertical: 7, paddingHorizontal: 11, marginTop: 4 },
        netText: { color: WHITE, fontWeight: "bold", fontSize: 11 },
        totalsBoxStyle: {},
      });

    case "classique":
      return StyleSheet.create({
        titleRow: { borderBottomWidth: 2, borderBottomColor: INK, paddingBottom: 6, marginBottom: 12 },
        title: { fontSize: 14, fontWeight: "bold", color: INK },
        clientCard: { borderWidth: 1, borderColor: "#999999", paddingVertical: 8, paddingHorizontal: 10, marginBottom: 14 },
        clientLabel: { fontSize: 7.5, fontWeight: "bold", color: MUTED, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 3 },
        clientName: { fontSize: 11, fontWeight: "bold", color: INK },
        clientLine: { fontSize: 9, color: "#374151", marginTop: 2 },
        tableWrap: { borderWidth: 1, borderColor: INK, marginBottom: 10 },
        tableHeader: { backgroundColor: "#e8e8e8", borderBottomWidth: 1, borderBottomColor: INK, paddingVertical: 5, paddingHorizontal: 5 },
        th: { fontSize: 8, fontWeight: "bold", color: INK },
        row: { paddingVertical: 4, paddingHorizontal: 5, borderBottomWidth: 1, borderBottomColor: "#bbbbbb" },
        rowAlt: {},
        netRow: { borderWidth: 1, borderColor: INK, backgroundColor: "#e8e8e8", paddingVertical: 5, paddingHorizontal: 8, marginTop: 4 },
        netText: { color: INK, fontWeight: "bold", fontSize: 10 },
        totalsBoxStyle: {},
      });

    case "elegant":
      return StyleSheet.create({
        titleRow: { borderBottomWidth: 0.5, borderBottomColor: accent, paddingBottom: 8, marginBottom: 14 },
        title: { fontSize: 15, fontWeight: "bold", color: INK, letterSpacing: 2 },
        clientCard: { marginBottom: 16 },
        clientLabel: { fontSize: 7.5, fontWeight: "bold", color: accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 },
        clientName: { fontSize: 12, fontWeight: "bold", color: "#111111" },
        clientLine: { fontSize: 9, color: "#374151", marginTop: 2 },
        tableWrap: { marginBottom: 12 },
        tableHeader: { borderBottomWidth: 1, borderBottomColor: accent, paddingVertical: 6, paddingHorizontal: 4 },
        th: { fontSize: 8, fontWeight: "bold", color: INK, textTransform: "uppercase", letterSpacing: 0.5 },
        row: { paddingVertical: 6, paddingHorizontal: 4, borderBottomWidth: 0.5, borderBottomColor: "#eeeeee" },
        rowAlt: {},
        netRow: { borderTopWidth: 1, borderTopColor: accent, paddingVertical: 6, paddingHorizontal: 0, marginTop: 4 },
        netText: { color: accent, fontWeight: "bold", fontSize: 11 },
        totalsBoxStyle: {},
      });

    case "sobre":
    default:
      return StyleSheet.create({
        titleRow: { paddingBottom: 6, marginBottom: 12 },
        title: { fontSize: 16, fontWeight: "bold", color: INK },
        clientCard: { marginBottom: 14 },
        clientLabel: { fontSize: 7.5, fontWeight: "bold", color: MUTED, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 2 },
        clientName: { fontSize: 11, fontWeight: "bold", color: "#111111" },
        clientLine: { fontSize: 9, color: "#374151", marginTop: 1 },
        tableWrap: { marginBottom: 10 },
        // Fond par défaut ; surchargé au niveau du template par
        // `couleurImpression` (voir proforma/facture-pdf-template.tsx) quand
        // le tenant a choisi une couleur d'impression dédiée.
        tableHeader: { backgroundColor: "#dbe4f0", paddingVertical: 6, paddingHorizontal: 4 },
        th: { fontSize: 8, fontWeight: "bold", color: INK },
        row: { paddingVertical: 4, paddingHorizontal: 4, borderBottomWidth: 0.5, borderBottomColor: LINE },
        rowAlt: {},
        netRow: { borderTopWidth: 1, borderTopColor: INK, paddingVertical: 4, marginTop: 3 },
        netText: { color: INK, fontWeight: "bold", fontSize: 10 },
        totalsBoxStyle: { borderWidth: 1, borderColor: "#c7d2e0", borderRadius: 2, padding: 10 },
      });
  }
}

