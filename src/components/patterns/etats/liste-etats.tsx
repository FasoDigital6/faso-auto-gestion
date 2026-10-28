"use client"

import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "./empty-state"

/** Chargement d'une liste : des lignes grises à la place d'un message, sans saut de mise en page. */
export function ListeChargement({ lignes = 6, libelle = "Chargement" }: { lignes?: number; libelle?: string }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label={libelle}>
      <Skeleton className="h-10 w-full max-w-sm" />
      {Array.from({ length: lignes }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  )
}

/** Échec de chargement d'une liste, avec une nouvelle tentative. */
export function ListeErreur({ titre = "Impossible de charger les données", onRetry }: { titre?: string; onRetry?: () => void }) {
  return (
    <EmptyState
      icon={AlertCircle}
      title={titre}
      description="Vérifiez votre connexion puis réessayez."
      action={
        <Button variant="outline" onClick={onRetry ?? (() => window.location.reload())}>
          Réessayer
        </Button>
      }
    />
  )
}
