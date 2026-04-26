import { ChevronDown } from "lucide-react"

import { MobileMenu } from "./_components/mobile-menu"
import { SidebarContent } from "./_components/sidebar-content"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="hidden w-64 shrink-0 border-r border-border md:flex md:flex-col">
        <SidebarContent />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border px-4 md:px-6">
          <div className="flex items-center gap-3">
            <MobileMenu>
              <SidebarContent />
            </MobileMenu>
            <span className="text-sm text-muted-foreground">Dashboard</span>
          </div>

          <div className="flex items-center gap-2">
            <div
              aria-hidden
              className="flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium"
            >
              SO
            </div>
            <ChevronDown className="size-4 text-muted-foreground" />
          </div>
        </header>

        <main className="flex-1 px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  )
}
