import { cn } from "@/lib/utils"

/** Zone de chargement : remplace le contenu à l'emplacement exact où il apparaîtra. */
function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
