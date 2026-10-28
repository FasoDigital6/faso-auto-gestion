/**
 * Moteur PDF chargé au moment de générer un document, pas avec la page :
 * `@react-pdf/renderer` pèse ≈ 466 kB gzip, téléchargés seulement au clic.
 * Les gabarits (qui l'importent aussi) se chargent de la même façon :
 *
 *   const [pdf, { FacturePDFTemplate }] = await Promise.all([
 *     chargerPdf(),
 *     import("@/features/factures/pdf/facture-pdf-template"),
 *   ]);
 */
export async function chargerPdf() {
  return (await import("@react-pdf/renderer")).pdf;
}
