import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

/**
 * PageHeader - Header standardisé pour toutes les pages
 * Responsive: stack sur mobile, inline sur desktop
 */
export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div className="space-y-1">
        <h1 className="font-serif text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description && (
          <p className="max-w-prose text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0 max-sm:[&>*]:w-full">{action}</div>}
    </div>
  )
}
