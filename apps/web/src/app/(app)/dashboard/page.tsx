import { Button } from "@solaros/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@solaros/ui/components/card"
import { FileText, HardHat, Sun, UserPlus } from "lucide-react"

const KPIS = [
  { label: "Leads activos", value: 0, icon: UserPlus },
  { label: "Proyectos en curso", value: 0, icon: HardHat },
  { label: "Propuestas pendientes", value: 0, icon: FileText },
]

export default function DashboardPage() {
  return (
    <div className="mx-auto w-full max-w-[1200px] space-y-12">
      <header>
        <h1 className="text-3xl font-medium tracking-tight md:text-4xl">
          Bienvenido a SolarOS
        </h1>
        <p className="mt-2 text-muted-foreground">
          Tu panel está vacío. Empieza añadiendo un lead o un proyecto.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {KPIS.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
              <CardDescription className="text-xs uppercase tracking-wide">
                {label}
              </CardDescription>
              <Icon className="size-4 text-muted-foreground" aria-hidden />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold tabular-nums">{value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border px-6 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-muted">
          <Sun className="size-7 text-muted-foreground" aria-hidden />
        </div>
        <div>
          <CardTitle>Aún no hay actividad</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Cuando crees tu primer lead, aparecerá aquí.
          </p>
        </div>
        <Button
          variant="outline"
          disabled
          className="opacity-60 cursor-not-allowed"
          title="Próximamente — F1"
          aria-label="Crear lead — próximamente F1"
        >
          Crear lead
        </Button>
      </section>
    </div>
  )
}
