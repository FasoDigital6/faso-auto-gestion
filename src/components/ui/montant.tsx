import { cn } from "@/lib/utils"
import { formatCurrency } from "@/domain/monnaie"

interface MontantProps extends React.ComponentProps<"span"> {
  valeur: number
  /** « grand » : total de pied de document, en serif. */
  taille?: "normal" | "grand"
}

/** Montant en GNF : chiffres tabulaires, alignés à droite, sans retour à la ligne. */
function Montant({ valeur, taille = "normal", className, ...props }: MontantProps) {
  return (
    <span
      className={cn(
        "num block",
        taille === "grand" && "font-serif text-2xl font-semibold",
        valeur < 0 && "text-destructive-ink",
        className
      )}
      {...props}
    >
      {formatCurrency(valeur)}
    </span>
  )
}

export { Montant }
