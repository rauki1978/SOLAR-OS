# ADR-0002: Sistema de diseño base

- **Status:** Accepted
- **Date:** 2026-04-25
- **Decided by:** Founder

## Context

SolarOS sirve a 5 perfiles de usuario muy distintos en la
misma app (CEO/Admin, Comercial, Técnico/PM, Instalador,
Cliente final), cada uno con necesidades de densidad,
jerarquía y tono distintas. Además el portal cliente debe
ser white-label. Las decisiones de diseño base deben
soportar esa heterogeneidad sin fragmentar el sistema.

## Decision

### Stack visual
- **Tailwind CSS v4** como motor de estilos. No v3.
- **shadcn/ui** como librería base de componentes,
  instalada en `packages/ui` con CLI monorepo oficial.
- **lucide-react** como librería de iconos (viene con
  shadcn por defecto).
- **tw-animate-css** para animaciones (reemplaza
  tailwindcss-animate, que está deprecated en v4).

### Tipografía
- **Geist Sans** para UI general.
- **Geist Mono** para datos numéricos (kWp, €, kWh,
  fechas, IDs). El uso de mono en cifras facilita lectura
  comparativa entre filas de tabla.

### Paleta de color (formato OKLCH, requerido por
Tailwind v4)

Tokens semánticos shadcn (no se renombran):
- `--primary`: azul solar. Hex equivalente #185FA5.
  OKLCH: `oklch(0.45 0.13 247)`. Usado en CTAs, links
  activos, indicadores de selección, y como branding por
  defecto del portal cliente.
- `--secondary`, `--muted`, `--accent`: tonos neutros
  por defecto de shadcn (paleta neutral).
- `--destructive`: rojo de shadcn por defecto.

Tokens custom de SolarOS (añadir además de los de shadcn):
- `--solar-energy`: ámbar. Hex equivalente #BA7517.
  OKLCH: `oklch(0.62 0.16 60)`. Reservado para indicar
  output energético: euros generados, kWh producidos,
  payback, ahorro acumulado. Da significado semántico al
  color.
- `--solar-energy-foreground`: blanco
  `oklch(0.99 0 0)` para texto sobre `--solar-energy`.

Reglas de uso del color:
- `--primary` es el color de "acción" e identidad de
  marca. Aparece en: botones primarios, links, dots de
  estados activos.
- `--solar-energy` es el color de "output positivo
  energético". Aparece SOLO en cifras de €/kWh/payback,
  nunca en CTAs ni en estados.
- Esta separación es deliberada: cuando el usuario ve
  ámbar, su cerebro debe asociarlo siempre a "esto es lo
  que generas/ahorras".

### Modo oscuro
- Dual desde el día uno.
- Estrategia: clase `.dark` aplicada manualmente al
  elemento `<html>`. NO `prefers-color-scheme` media
  query (limita la decisión al usuario).
- Persistencia de preferencia: localStorage. Default:
  sistema. Implementación concreta del toggle viene en
  M0.4 (no en T0.1.3).
- Cada token de color debe tener variante en `:root` y
  en `.dark`.

### Densidad
- Tres niveles previstos: `compact`, `comfortable`
  (default), `spacious`.
- Implementación a través de CSS variables que ajustan
  paddings y heights. T0.1.3 implementa solo el default
  `comfortable`. Los otros dos vienen cuando se necesiten
  (probablemente al construir vistas operativas en F1).

## Consequences

### Positive
- Coherencia visual entre app interna y portal cliente
  (mismo sistema, distintos tokens de branding).
- Significado semántico en el color: el ámbar "energía"
  comunica más rápido que un texto.
- shadcn copy-paste = control total del código sin
  vendor lock-in.
- Tailwind v4 evita migración futura desde v3.

### Negative / Trade-offs
- OKLCH puede confundir a contribuidores
  acostumbrados a HSL/hex. Mitigación: documentar
  conversión y dejar comentarios con el hex
  equivalente al lado.
- Tailwind v4 es relativamente reciente, algunos
  plugins legacy de Tailwind v3 no son compatibles —
  pero shadcn sí lo es y es lo único que usamos.
- Un único primary "azul solar" puede sentirse
  conservador. Mitigación: el ámbar de output da
  personalidad sin canibalizar la legibilidad.

## Alternatives considered

### Tailwind v3
Descartado: salir a producción con un major deprecado y
migrar luego.

### Color primario verde "renovable"
Descartado: cliché agotado en el sector. El azul
diferencia y mantiene asociación con paneles solares.

### Sin sistema de densidad
Descartado: el blueprint sirve a perfiles operativos
que necesitan densidad alta (catálogo, lista de
proyectos del PM) y perfiles con poco volumen (CEO,
cliente final). Forzar una sola densidad rompe a uno de
los dos lados.

## Notes
- Conversiones OKLCH↔hex: usar oklch.com como referencia.
- El portal cliente es white-label: cuando una
  Organization define su `branding.primaryColor` en DB,
  ese valor sobrescribe `--primary` SOLO dentro del
  layout `(portal)`. La app interna mantiene siempre el
  azul solar.
