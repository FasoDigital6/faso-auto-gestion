"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface PageBackLinkProps {
  /** Destination par défaut (liste parente). */
  href: string;
  label?: string;
}

/**
 * Bouton "Retour" unique pour toutes les pages de détail (fiche client,
 * proforma, contrat, BDC, BDL, facture, dossier AO...). Remplace les
 * implémentations bricolées à la main sur chaque page (icône seule, texte,
 * bouton plein — 4 styles différents avant ce composant).
 *
 * Contextuel : si la page a été atteinte via un lien portant `?retour=xxx`
 * (ex. la liste des Paiements), le clic fait `router.back()` pour restaurer
 * exactement la vue d'origine (filtres/scroll compris) au lieu de toujours
 * repartir sur `href`. Toute liste peut se rendre "context-aware" en
 * ajoutant `?retour=<nom>` à ses liens vers une fiche — aucun câblage
 * supplémentaire n'est nécessaire côté page de détail.
 */
export function PageBackLink({ href, label = "Retour" }: PageBackLinkProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRetourContext = searchParams.has("retour");

  return (
    <button
      type="button"
      onClick={() => (hasRetourContext ? router.back() : router.push(href))}
      className="inline-flex min-h-10 w-fit items-center gap-1.5 self-start text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
    >
      <ArrowLeft className="size-4" />
      {label}
    </button>
  );
}
