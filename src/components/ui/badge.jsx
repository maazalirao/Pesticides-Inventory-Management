import * as React from "react"

import { cn } from "../../lib/utils"

const badgeVariants = {
  variant: {
    default: "bg-primary text-primary-foreground hover:bg-primary/80",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/80",
    outline: "text-foreground border border-input hover:bg-accent hover:text-accent-foreground",
    success: "bg-primary text-white hover:bg-primary/90",
    warning: "bg-amber-500 text-white hover:bg-amber-600",
    info: "bg-violet-500 text-white hover:bg-violet-600",
  },
}

function Badge({
  className,
  variant = "default",
  ...props
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        badgeVariants.variant[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge, badgeVariants } 