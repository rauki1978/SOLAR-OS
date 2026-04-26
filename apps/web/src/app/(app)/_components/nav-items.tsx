import {
  ClipboardList,
  Cog,
  FileText,
  HardHat,
  LayoutDashboard,
  LucideIcon,
  Package,
  ScrollText,
  UserPlus,
  Wrench,
} from "lucide-react"

export type NavItem = {
  label: string
  href: string
  icon: LucideIcon
  active?: boolean
  /**
   * Phase tag from the roadmap. `undefined` for items that are
   * already navigable (e.g. dashboard).
   */
  phase?: "F1" | "F5" | undefined
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, active: true },
  { label: "Leads", href: "/leads", icon: UserPlus, phase: "F1" },
  { label: "Proyectos", href: "/projects", icon: HardHat, phase: "F1" },
  { label: "Propuestas", href: "/proposals", icon: FileText, phase: "F1" },
  { label: "Tramitación", href: "/procedures", icon: ScrollText, phase: "F5" },
  { label: "Operaciones", href: "/operations", icon: Wrench, phase: "F1" },
  { label: "Postventa", href: "/postsales", icon: ClipboardList, phase: "F5" },
  { label: "Catálogo", href: "/catalog", icon: Package, phase: "F1" },
  { label: "Configuración", href: "/settings", icon: Cog },
]
