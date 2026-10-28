import { useEffect, useState } from "react";

/**
 * Valeur recopiée après `delai` ms sans changement : une recherche saisie au
 * clavier ne part au serveur qu'une fois la frappe terminée.
 */
export function useValeurDifferee<T>(valeur: T, delai = 350): T {
  const [differee, setDifferee] = useState(valeur);
  useEffect(() => {
    const minuteur = setTimeout(() => setDifferee(valeur), delai);
    return () => clearTimeout(minuteur);
  }, [valeur, delai]);
  return differee;
}
