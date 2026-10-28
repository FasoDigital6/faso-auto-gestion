/** Type de période pour le filtrage des rapports. */
export type TypePeriode = "toutes" | "mois" | "annee" | "custom";

/** Filtre de période : un mois, une année ou un intervalle libre. */
export type FiltrePeriode = {
  type: TypePeriode;
  mois?: number; // 1-12 (pour type "mois")
  annee: number;
  dateDebut?: Date; // pour type "custom"
  dateFin?: Date; // pour type "custom"
};

export function buildDateRange(
  dateDebut: string | Date,
  dateFin: string | Date
): { debut: Date; fin: Date } {
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);
  debut.setHours(0, 0, 0, 0);
  fin.setHours(23, 59, 59, 999);
  return { debut, fin };
}

export function isDateInPeriode(date: Date, periode: FiltrePeriode): boolean {
  if (periode.type === "toutes") {
    return true;
  }

  const dateToCheck = new Date(date);

  if (periode.type === "mois") {
    return (
      dateToCheck.getMonth() === (periode.mois! - 1) &&
      dateToCheck.getFullYear() === periode.annee
    );
  } else if (periode.type === "annee") {
    return dateToCheck.getFullYear() === periode.annee;
  } else if (periode.type === "custom" && periode.dateDebut && periode.dateFin) {
    const { debut, fin } = buildDateRange(periode.dateDebut, periode.dateFin);
    return dateToCheck >= debut && dateToCheck <= fin;
  }

  return true;
}
