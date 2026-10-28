import { Skeleton } from "@/components/ui/skeleton"
import { ListeChargement } from "@/components/patterns/etats/liste-etats"

/**
 * Squelette affiché pendant la navigation vers une page du tableau de bord
 * (`app/(dashboard)/loading.tsx`). Next le précharge avec le lien : le
 * squelette apparaît dès le clic, sans attendre l'aller-retour serveur.
 * Forme générique d'une page : en-tête (titre, description) puis liste.
 */
export default function PageChargement() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-5 w-full max-w-md" />
      </div>
      <ListeChargement />
    </div>
  )
}
