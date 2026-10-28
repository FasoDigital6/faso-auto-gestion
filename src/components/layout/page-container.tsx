import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
}

/**
 * PageContainer - Wrapper uniforme pour toutes les pages
 * Applique le padding standard et max-width cohérent
 */
export function PageContainer({ children, className }: PageContainerProps) {
  return (
    <div className={cn("flex flex-col gap-6 p-4 md:p-5 lg:p-6 lg:gap-8", className)}>
      {children}
    </div>
  )
}
