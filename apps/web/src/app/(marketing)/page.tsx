import { Badge } from "@solaros/ui/components/badge"
import { Button } from "@solaros/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@solaros/ui/components/card"
import {
  Award,
  Battery,
  FileCheck2,
  HandCoins,
  Link2,
  MapPinned,
  Sun,
  Thermometer,
  Zap,
} from "lucide-react"
import Link from "next/link"

const technologies = [
  {
    icon: Sun,
    title: "Fotovoltaica",
    description: "Diseño en cubierta, dimensionado, strings, sombras.",
    status: "Disponible" as const,
  },
  {
    icon: Battery,
    title: "Almacenamiento",
    description: "Baterías integradas en el proyecto desde el día uno.",
    status: "Disponible" as const,
  },
  {
    icon: Zap,
    title: "Wallbox",
    description: "Cargadores de vehículo eléctrico con carga inteligente.",
    status: "Disponible" as const,
  },
  {
    icon: Thermometer,
    title: "Aerotermia",
    description: "Bombas de calor para climatización y ACS.",
    status: "Próximamente" as const,
  },
]

const differentiators = [
  {
    icon: FileCheck2,
    title: "Tramitación legal",
    description: "CAU, RADNE, RAC, CIE.",
  },
  {
    icon: MapPinned,
    title: "Catastro integrado",
    description: "Geometría real de cubiertas.",
  },
  {
    icon: HandCoins,
    title: "Subvenciones",
    description: "Autonómicas + IDAE.",
  },
  {
    icon: Link2,
    title: "Conector Holded",
    description: "No facturación nativa.",
  },
]

export default function MarketingHomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* HERO */}
      <section className="relative flex min-h-[70vh] items-center px-6 py-24 md:py-32">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-medium tracking-tight md:text-6xl">
              El sistema operativo del{" "}
              <span className="text-solar-energy">instalador renovable español</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground md:text-xl">
              Lleva tu instaladora del lead a la postventa en una sola
              plataforma. Compliance español incluido — CAU, RADNE, RAC, CIE.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              {/* TODO design system: promote 'solar-energy' to a Button
                  variant when usage stabilizes (currently only used here). */}
              <Button
                asChild
                size="lg"
                className="bg-solar-energy text-solar-energy-foreground hover:bg-solar-energy/90"
              >
                <a href="#contacto">Reservar demo</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard">Ver dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* TECNOLOGÍAS CUBIERTAS */}
      <section className="px-6 py-16 md:py-24">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
              Tecnologías cubiertas
            </h2>
            <p className="mt-3 text-muted-foreground">
              Un proyecto unificado para todo lo que entra en una instalación
              moderna.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {technologies.map(({ icon: Icon, title, description, status }) => (
              <Card key={title}>
                <CardHeader>
                  <Icon className="size-6 text-muted-foreground" />
                  <CardTitle className="mt-2">{title}</CardTitle>
                  <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge
                    variant={status === "Disponible" ? "secondary" : "outline"}
                    className={
                      status === "Próximamente"
                        ? "text-muted-foreground"
                        : undefined
                    }
                  >
                    {status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* DIFERENCIADORES */}
      <section className="border-t px-6 py-16 md:py-24">
        <div className="mx-auto w-full max-w-[1200px]">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
              Diseñado para España
            </h2>
            <p className="mt-3 text-muted-foreground">
              Compliance, integraciones y normativa del mercado español desde
              el núcleo del producto.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
            {differentiators.map(({ icon: Icon, title, description }) => (
              <div key={title} className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-muted">
                  <Icon className="size-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-base font-medium">{title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        id="contacto"
        className="border-t px-6 py-10 text-sm text-muted-foreground"
      >
        <div className="mx-auto flex w-full max-w-[1200px] flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <Award className="size-4" aria-hidden />
            <span className="font-medium text-foreground">SolarOS</span>
            <span>· {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="hover:text-foreground transition-colors"
            >
              Acceder
            </Link>
            <span className="cursor-not-allowed opacity-60">
              Política de privacidad
            </span>
          </div>
        </div>
      </footer>
    </main>
  )
}
