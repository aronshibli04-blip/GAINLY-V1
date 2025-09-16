import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ultra-smooth focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 touch-haptic",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gradient-to-r from-primary-cyan to-accent-mint text-white hover:from-primary-cyan/90 hover:to-accent-mint/90 shadow-sm",
        secondary:
          "border-transparent bg-gradient-to-r from-secondary-magenta to-accent-purple text-white hover:from-secondary-magenta/90 hover:to-accent-purple/90 shadow-sm",
        destructive:
          "border-transparent bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-sm",
        outline: "border-primary-cyan/50 bg-background/80 text-primary-cyan hover:bg-primary-cyan/10 backdrop-blur-sm",
        success: "border-transparent bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-sm",
        warning: "border-transparent bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
