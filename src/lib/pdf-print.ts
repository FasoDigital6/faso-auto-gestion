/**
 * Utilitaire pour imprimer des PDFs générés
 * Gère la compatibilité navigateur et les fallbacks iOS
 */

/**
 * Imprime un PDF blob en utilisant la boîte de dialogue d'impression du navigateur
 *
 * @param blob - Le blob PDF à imprimer
 * @throws Error si l'impression échoue
 *
 * Stratégie :
 * - Desktop/Android : Utilise iframe caché + window.print()
 * - iOS : Ouvre dans nouvel onglet (iframe print ne fonctionne pas sur iOS)
 */
export async function printPDF(blob: Blob): Promise<void> {
  // Vérifier si window.print est supporté
  if (typeof window === "undefined" || !window.print) {
    throw new Error("L'impression n'est pas supportée dans cet environnement");
  }

  // Créer une URL blob
  const url = URL.createObjectURL(blob);

  try {
    // Détecter iOS (Safari mobile ne supporte pas iframe.print())
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (isIOS) {
      // Sur iOS, ouvrir dans un nouvel onglet
      // L'utilisateur pourra imprimer manuellement depuis le menu du navigateur
      const printWindow = window.open(url, "_blank");

      if (!printWindow) {
        throw new Error("Impossible d'ouvrir la fenêtre d'impression. Veuillez autoriser les popups.");
      }

      // Nettoyer l'URL après un délai (laisser le temps de charger)
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 10000);
    } else {
      // Desktop et Android : utiliser iframe caché
      await printWithIframe(url);
    }
  } catch (error) {
    // Nettoyer en cas d'erreur
    URL.revokeObjectURL(url);
    throw error;
  }
}

/**
 * Imprime un PDF en utilisant un iframe caché
 * @param url - L'URL blob du PDF
 */
function printWithIframe(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Créer un iframe caché
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.src = url;

    // Timeout de sécurité
    const timeoutId = setTimeout(() => {
      cleanup();
      reject(new Error("Timeout lors du chargement du PDF"));
    }, 30000);

    // Fonction de nettoyage
    const cleanup = () => {
      clearTimeout(timeoutId);
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
      URL.revokeObjectURL(url);
    };

    // Handler de chargement
    iframe.onload = () => {
      try {
        clearTimeout(timeoutId);

        // Attendre un court instant pour s'assurer que le PDF est bien chargé
        setTimeout(() => {
          try {
            // Déclencher l'impression
            iframe.contentWindow?.print();

            // Nettoyer après un délai (laisser le temps à l'utilisateur d'interagir avec le dialogue)
            setTimeout(() => {
              cleanup();
              resolve();
            }, 1000);
          } catch (error) {
            cleanup();
            reject(error);
          }
        }, 100);
      } catch (error) {
        cleanup();
        reject(error);
      }
    };

    // Handler d'erreur
    iframe.onerror = () => {
      cleanup();
      reject(new Error("Erreur lors du chargement du PDF"));
    };

    // Ajouter l'iframe au DOM
    document.body.appendChild(iframe);
  });
}
