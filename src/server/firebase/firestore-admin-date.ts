/**
 * Convertit une valeur Firestore (Admin SDK) en Date JS de façon défensive.
 * Nécessaire quand un document lu via `dbAdmin` est passé à un composant
 * (ex: template PDF) qui attend un objet `Date`, pas un Timestamp Firestore.
 */
export function toJsDate(val: unknown, fallback?: Date): Date | undefined {
  if (val == null) return fallback;
  if (typeof (val as { toDate?: unknown }).toDate === "function") {
    return (val as { toDate: () => Date }).toDate();
  }
  if (val instanceof Date) return val;
  if (typeof val === "string" || typeof val === "number") return new Date(val);
  return fallback;
}
