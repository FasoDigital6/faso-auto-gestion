/**
 * Construit le bloc de signature HTML ajouté en pied des emails envoyés
 * depuis le serveur (proformas, factures...).
 *
 * Priorité : signature personnelle de l'expéditeur > signature de
 * l'entreprise > nom de l'entreprise. Le logo de l'entreprise est affiché
 * sous le texte, comme un bloc de signature classique.
 */
export function buildEmailSignatureHtml({
  userSignature,
  entrepriseSignature,
  entrepriseNom,
  logoUrl,
}: {
  userSignature?: string;
  entrepriseSignature?: string;
  entrepriseNom?: string;
  logoUrl?: string;
}): string {
  const signature =
    userSignature || entrepriseSignature || entrepriseNom || "L'équipe";
  const signatureHtml = signature.replace(/\n/g, "<br>");

  const logoHtml = logoUrl
    ? `<div style="margin-top:12px;"><img src="${logoUrl}" alt="${entrepriseNom || ""}" style="max-height:60px;max-width:200px;" /></div>`
    : "";

  return `<div style="margin-top:24px;">Cordialement,<br>${signatureHtml}${logoHtml}</div>`;
}
