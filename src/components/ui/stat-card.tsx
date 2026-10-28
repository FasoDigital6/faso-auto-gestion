import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Ton sémantique, jamais une couleur brute — "brand" respecte la couleur
 * choisie par chaque entreprise dans Paramètres (--brand), les autres tons
 * s'appuient sur les tokens success/warning/destructive existants.
 */
export type StatTone = "brand" | "success" | "warning" | "destructive" | "neutral";

const toneClasses: Record<StatTone, string> = {
  brand: "bg-brand/10 text-brand-ink",
  success: "bg-success/10 text-success-ink",
  warning: "bg-warning/10 text-warning-ink",
  destructive: "bg-destructive/10 text-destructive-ink",
  neutral: "bg-muted text-muted-foreground",
};

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: StatTone;
  className?: string;
}

/**
 * Carte de statistique unique pour tous les écrans (Finances, Paiements,
 * Factures, BDC/BDL, Dépenses...). Remplace les blocs Card/CardContent
 * dupliqués à la main sur chaque page.
 */
export function StatCard({ label, value, icon: Icon, tone = "neutral", className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="flex items-center gap-3 pt-6">
        <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg", toneClasses[tone])}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground truncate">{label}</p>
          <p className="text-lg font-semibold truncate">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
