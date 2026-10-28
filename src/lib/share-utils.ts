/**
 * Utilitaires pour partager des fichiers par email ou autres applications
 */

interface SharePDFOptions {
  pdfBlob: Blob;
  fileName: string;
  emailTo?: string;
  emailSubject?: string;
  emailBody?: string;
}

/**
 * Partage un PDF via l'API Web Share si disponible, sinon télécharge le PDF
 * et ouvre le client email
 *
 * L'API Web Share permet d'attacher automatiquement le PDF dans l'email
 * sur les appareils qui le supportent (mobile principalement)
 */
export async function sharePDFByEmail(options: SharePDFOptions): Promise<void> {
  const { pdfBlob, fileName, emailTo, emailSubject, emailBody } = options;

  // Vérifier si l'API Web Share est disponible et supporte les fichiers
  if (navigator.share && navigator.canShare) {
    try {
      // Convertir le Blob en File object (requis pour Web Share)
      const pdfFile = new File([pdfBlob], fileName, { type: 'application/pdf' });

      // Préparer les données à partager
      const shareData: ShareData = {
        files: [pdfFile],
        title: emailSubject || fileName,
        text: emailBody || '',
      };

      // Vérifier si on peut partager ces données
      if (navigator.canShare(shareData)) {
        // Partager via l'API Web Share
        // Cela ouvrira le sélecteur de partage natif de l'OS
        // L'utilisateur pourra choisir son application email
        // et le PDF sera automatiquement attaché
        await navigator.share(shareData);
        return;
      }
    } catch (error) {
      // Si l'utilisateur annule le partage, AbortError est lancée
      if ((error as Error).name === 'AbortError') {
        return;
      }
      // Pour les autres erreurs, on continue avec la méthode de fallback
      console.warn('Erreur lors du partage Web Share:', error);
    }
  }

  // Fallback: Méthode traditionnelle (téléchargement + mailto)
  // Cette méthode est utilisée sur les navigateurs desktop qui ne supportent pas Web Share

  // 1. Télécharger le PDF
  const url = URL.createObjectURL(pdfBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  // 2. Ouvrir le client email avec mailto
  if (emailTo || emailSubject || emailBody) {
    const mailtoParams: string[] = [];

    if (emailSubject) {
      mailtoParams.push(`subject=${encodeURIComponent(emailSubject)}`);
    }

    if (emailBody) {
      mailtoParams.push(`body=${encodeURIComponent(emailBody)}`);
    }

    const mailtoLink = `mailto:${emailTo || ''}${mailtoParams.length > 0 ? '?' + mailtoParams.join('&') : ''}`;
    window.open(mailtoLink, '_blank');
  }

  // 3. Informer l'utilisateur
  alert(
    'Le PDF a été téléchargé.\n\n' +
    'Sur ordinateur: Veuillez l\'attacher manuellement à votre email.\n' +
    'Sur mobile: Le PDF devrait être attaché automatiquement.'
  );
}

