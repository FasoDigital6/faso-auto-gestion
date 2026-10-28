import { useCallback, useState } from "react";

/**
 * Clé d'idempotence d'une action d'écriture : générée une fois quand
 * l'utilisateur commence une saisie, puis renvoyée telle quelle à chaque
 * nouvel envoi de cette saisie (double clic, nouvel essai après une coupure).
 * Le serveur s'en sert comme identifiant de document : la seconde écriture
 * trouve la première et ne fait rien.
 *
 * `crypto.randomUUID` n'existe qu'en contexte sécurisé (HTTPS, localhost) :
 * repli sur `getRandomValues` pour un accès par IP en HTTP sur le réseau local.
 */
export function nouvelleCleIdempotence(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const octets = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(octets, (o) => o.toString(16).padStart(2, "0")).join("");
}

/**
 * Clé d'idempotence d'un formulaire : stable tant que la saisie est en cours
 * (tous les nouveaux essais la renvoient), renouvelée par `renouveler()` une
 * fois l'écriture réussie, pour que la saisie suivante crée bien un nouveau
 * document. Un formulaire démonté (navigation après succès) n'a pas besoin
 * de la renouveler : il en aura une neuve au prochain affichage.
 */
export function useCleIdempotence(): [string, () => void] {
  const [cle, setCle] = useState(nouvelleCleIdempotence);
  const renouveler = useCallback(() => setCle(nouvelleCleIdempotence()), []);
  return [cle, renouveler];
}
