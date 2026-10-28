import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Types de statuts supportés
export type Status =
  | "draft"
  | "brouillon"
  | "pending"
  | "envoye"
  | "validated"
  | "valide"
  | "signed"
  | "approuve"
  | "paid"
  | "payee"
  | "emise"
  | "partial"
  | "cancelled"
  | "annule"
  | "rejete"
  | "expired"
  | "active"
  | "completed"
  | "delivered"
  | "livre"
  | "en_cours"
  | "invoiced"
  | "non_traite"
  | "partiellement_livre"
  | "tva_versee"
  | "tva_a_verser"

interface StatusBadgeProps {
  status: Status
  size?: "sm" | "md"
  className?: string
  showCount?: boolean
  count?: number
}

// Mapping status -> configuration (texte + style)
const statusConfig: Record<
  Status,
  { label: string; variant: string; className: string }
> = {
  draft: {
    label: "Brouillon",
    variant: "outline",
    className: "border-muted-foreground/20 text-muted-foreground bg-muted/20",
  },
  brouillon: {
    label: "Brouillon",
    variant: "outline",
    className: "border-muted-foreground/20 text-muted-foreground bg-muted/20",
  },
  pending: {
    label: "En attente",
    variant: "outline",
    className: "border-warning/20 text-warning-ink bg-warning/10",
  },
  envoye: {
    label: "Envoyé",
    variant: "outline",
    className: "border-info/20 text-info-ink bg-info/10",
  },
  validated: {
    label: "Validé",
    variant: "outline",
    className: "border-success/20 text-success-ink bg-success/10",
  },
  valide: {
    label: "Validé",
    variant: "outline",
    className: "border-success/20 text-success-ink bg-success/10",
  },
  signed: {
    label: "Signé",
    variant: "outline",
    className: "border-success/20 text-success-ink bg-success/10",
  },
  approuve: {
    label: "Approuvé",
    variant: "outline",
    className: "border-success/20 text-success-ink bg-success/10",
  },
  paid: {
    label: "Payé",
    variant: "outline",
    className: "border-success/20 text-success-ink bg-success/10",
  },
  payee: {
    label: "Payée",
    variant: "outline",
    className: "border-success/20 text-success-ink bg-success/10",
  },
  emise: {
    label: "Émise",
    variant: "outline",
    className: "border-info/20 text-info-ink bg-info/10",
  },
  partial: {
    label: "Partiel",
    variant: "outline",
    className: "border-warning/20 text-warning-ink bg-warning/10",
  },
  cancelled: {
    label: "Annulé",
    variant: "outline",
    className: "border-destructive/20 text-destructive-ink bg-destructive/10",
  },
  annule: {
    label: "Annulé",
    variant: "outline",
    className: "border-destructive/20 text-destructive-ink bg-destructive/10",
  },
  rejete: {
    label: "Rejeté",
    variant: "outline",
    className: "border-destructive/20 text-destructive-ink bg-destructive/10",
  },
  expired: {
    label: "Expiré",
    variant: "outline",
    className: "border-destructive/20 text-destructive-ink bg-destructive/10",
  },
  active: {
    label: "Actif",
    variant: "outline",
    className: "border-success/20 text-success-ink bg-success/10",
  },
  completed: {
    label: "Terminé",
    variant: "outline",
    className: "border-success/20 text-success-ink bg-success/10",
  },
  delivered: {
    label: "Livré",
    variant: "outline",
    className: "border-success/20 text-success-ink bg-success/10",
  },
  livre: {
    label: "Livré",
    variant: "outline",
    className: "border-success/20 text-success-ink bg-success/10",
  },
  en_cours: {
    label: "En cours",
    variant: "outline",
    className: "border-warning/20 text-warning-ink bg-warning/10",
  },
  invoiced: {
    label: "Facturé",
    variant: "outline",
    className: "border-info/20 text-info-ink bg-info/10",
  },
  non_traite: {
    label: "Non traité",
    variant: "outline",
    className: "border-muted-foreground/20 text-muted-foreground bg-muted/20",
  },
  partiellement_livre: {
    label: "Partiellement livré",
    variant: "outline",
    className: "border-warning/20 text-warning-ink bg-warning/10",
  },
  tva_versee: {
    label: "TVA Versée",
    variant: "outline",
    className: "border-success/20 text-success-ink bg-success/10",
  },
  tva_a_verser: {
    label: "TVA À verser",
    variant: "outline",
    className: "border-warning/20 text-warning-ink bg-warning/10",
  },
}

/**
 * StatusBadge - Badge de statut avec mapping automatique couleur/texte
 * Utilise le design system cohérent pour tous les statuts
 */
export function StatusBadge({
  status,
  size = "md",
  className,
  showCount = false,
  count = 0
}: StatusBadgeProps) {
  const config = statusConfig[status]

  if (!config) {
    console.warn(`Status "${status}" not found in statusConfig`)
    return null
  }

  return (
    <Badge
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      variant={config.variant as any}
      className={cn(
        config.className,
        size === "sm" && "text-xs px-2 py-0.5",
        className
      )}
    >
      {config.label}{showCount && `: ${count}`}
    </Badge>
  )
}
