import { Button } from "@solaros/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@solaros/ui/components/card"
import { Input } from "@solaros/ui/components/input"
import { Label } from "@solaros/ui/components/label"

export default function ShowcasePage() {
  return (
    <main className="mx-auto max-w-4xl p-8 space-y-12">
      <header>
        <h1 className="text-3xl font-medium tracking-tight">Sistema de diseño SolarOS</h1>
        <p className="text-muted-foreground mt-2">
          Verificación visual de design tokens, componentes base y dark mode.
        </p>
      </header>

      <section className="space-y-4">
        <h2 className="text-xl font-medium">Botones</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Acción primaria</Button>
          <Button variant="secondary">Secundaria</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructiva</Button>
          <Button variant="link">Link</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-medium">Color tokens</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg border p-4 bg-background">
            <div className="text-sm font-medium">background</div>
            <div className="text-xs text-muted-foreground">--background</div>
          </div>
          <div className="rounded-lg border p-4 bg-primary text-primary-foreground">
            <div className="text-sm font-medium">primary</div>
            <div className="text-xs opacity-80">azul solar</div>
          </div>
          <div className="rounded-lg border p-4 bg-secondary text-secondary-foreground">
            <div className="text-sm font-medium">secondary</div>
            <div className="text-xs opacity-80">--secondary</div>
          </div>
          <div className="rounded-lg border p-4 bg-solar-energy text-solar-energy-foreground">
            <div className="text-sm font-medium">solar-energy</div>
            <div className="text-xs opacity-80">ámbar output</div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-medium">Tipografía</h2>
        <div className="space-y-2">
          <p className="font-sans text-base">
            Geist Sans · Familia García-López, propuesta enviada hace 2 horas.
          </p>
          <p className="font-mono text-base">
            Geist Mono · 45.0 kWp · €52,300 · PRY-0141 · 2026-04-25
          </p>
          <p className="text-solar-energy font-mono text-2xl font-medium">€1,420 / año</p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-medium">Card de ejemplo</h2>
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Bodegas Pérez SL</CardTitle>
            <CardDescription>PRY-0141 · Huércal-Overa · 45.0 kWp</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            <p className="text-sm text-muted-foreground">Modalidad: con excedentes compensación</p>
            <p className="font-mono text-2xl text-solar-energy">€52,300</p>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-medium">Form input</h2>
        <div className="max-w-sm space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email del cliente</Label>
            <Input id="email" type="email" placeholder="cliente@ejemplo.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="kwp">Potencia (kWp)</Label>
            <Input id="kwp" type="number" placeholder="6.5" className="font-mono" />
          </div>
          <Button className="w-full">Crear proyecto</Button>
        </div>
      </section>
    </main>
  )
}
