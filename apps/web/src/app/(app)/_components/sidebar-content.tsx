import { Badge } from "@solaros/ui/components/badge"
import { cn } from "@solaros/ui/lib/utils"
import Link from "next/link"

import { NAV_ITEMS } from "./nav-items"

export function SidebarContent() {
  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="px-2">
        <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
          SolarOS
        </Link>
      </div>
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => {
          const disabled = !item.active && !!item.phase
          const Icon = item.icon
          const baseClasses =
            "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors"

          if (item.active) {
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  baseClasses,
                  "bg-accent text-accent-foreground font-medium",
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon className="size-4" />
                  {item.label}
                </span>
              </Link>
            )
          }

          if (disabled) {
            return (
              <span
                key={item.label}
                aria-disabled="true"
                className={cn(
                  baseClasses,
                  "pointer-events-none cursor-not-allowed opacity-60",
                )}
              >
                <span className="flex items-center gap-2">
                  <Icon className="size-4" />
                  {item.label}
                </span>
                {item.phase && (
                  <Badge variant="outline" className="text-[10px]">
                    {item.phase}
                  </Badge>
                )}
              </span>
            )
          }

          return (
            <span
              key={item.label}
              aria-disabled="true"
              className={cn(
                baseClasses,
                "pointer-events-none cursor-not-allowed opacity-60",
              )}
            >
              <span className="flex items-center gap-2">
                <Icon className="size-4" />
                {item.label}
              </span>
            </span>
          )
        })}
      </nav>
    </div>
  )
}
