/**
 * Dates saisies dans un champ `<input type="date">` (format `yyyy-MM-dd`).
 *
 * `new Date("2026-10-13")` est lu en UTC et `toISOString()` écrit en UTC : hors du
 * fuseau UTC, la date comptable glisse d'un jour (la veille à l'ouest de Greenwich,
 * un « aujourd'hui » décalé à l'est). Ces fonctions restent en heure locale.
 */

const deuxChiffres = (n: number) => String(n).padStart(2, "0")

/** Date locale → `yyyy-MM-dd` (jour affiché à l'utilisateur, pas le jour UTC). */
export function formaterDateSaisie(date: Date): string {
  return `${date.getFullYear()}-${deuxChiffres(date.getMonth() + 1)}-${deuxChiffres(date.getDate())}`
}

/** `yyyy-MM-dd` → minuit en heure locale ; `undefined` si la valeur n'est pas une date valide. */
export function lireDateSaisie(valeur: string): Date | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valeur)
  if (!m) return undefined
  const [annee, mois, jour] = [Number(m[1]), Number(m[2]), Number(m[3])]
  const date = new Date(annee, mois - 1, jour)
  const valide = date.getFullYear() === annee && date.getMonth() === mois - 1 && date.getDate() === jour
  return valide ? date : undefined
}
