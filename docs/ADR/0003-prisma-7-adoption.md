# ADR-0003: Adopción de Prisma 7 desde el inicio

- **Status:** Accepted
- **Date:** 2026-04-25
- **Decided by:** Founder

## Context

El blueprint inicial (§3.1) especificaba "Prisma 6.x"
como objetivo. En T0.2.1, momento de configurar Prisma
en packages/database, Prisma había publicado v7.8.0
con 8 minors estabilizados. v7 introduce el nuevo
"Prisma Client" generator (output explícito), elimina
el query engine Rust del bundle, mejora cold start en
serverless, y es la dirección oficial del proyecto.

## Decision

Adoptamos Prisma 7.x desde T0.2.1, antes de definir
ningún modelo o migration. La decisión se toma
explícitamente porque estamos en el momento de menor
coste de adopción: cero modelos, cero migrations, cero
queries, cero tests contra Prisma. Cualquier salto
posterior tendría coste creciente.

## Consequences

### Positive
- Cold start serverless mejor (sin query engine Rust).
- TypeScript inference mejorado.
- Output explícito del cliente generado: control
  total sobre dónde vive el código generado.
- Alineamiento con la dirección oficial de Prisma y
  con la documentación moderna de Next.js + Supabase.
- Evita migración futura cuyo coste crecería con
  cada modelo, migration, y query escrita.

### Negative / Trade-offs
- Sintaxis del generator y schema cambia respecto
  a v6 (provider = "prisma-client" en lugar de
  "prisma-client-js", output requerido).
- Tutoriales online y Stack Overflow tienen
  predominancia de v6 — fricción menor en búsquedas
  durante desarrollo inicial.
- El blueprint §3.1 se actualiza ("Prisma 7.x" en
  lugar de "6.x"). Resto del blueprint no afectado:
  el modelo de datos en §6 usa sintaxis común a v6
  y v7 (@id, @default(cuid()), etc.).

## Alternatives considered

### Quedarse en Prisma 6
Descartado por asimetría temporal: el coste de migrar
luego crece con cada modelo y query escrita. Hoy es
cambio cosmético, en seis meses sería trabajo real.

### Esperar a Prisma 7.x.y "más maduro"
Descartado: 7.8.0 con 8 minors publicados ya es
maduro. Esperar más solo prolonga la deuda.

## Notes
- Aprovechamos también para usar el output
  explícito del cliente: src/generated/prisma según
  convención v7.
- previewFeatures actuales no son necesarias para
  los modelos previstos en M0.2 (Organization, User,
  Membership). Si en F4 necesitamos features
  específicas (full-text search, tracing, etc.), se
  evaluarán entonces.

## Real-world adoption notes (post-T0.2.1)

La adopción confirma las "Negative consequences" anticipadas pero
con mayor profundidad de la documentada:

- "Sintaxis cambia" subestima el cambio: Prisma 7 elimina `url` y
  `directUrl` del datasource, requiere `prisma.config.ts` para
  migrations, e impone adapter pattern (`@prisma/adapter-pg` +
  `pg`) para runtime — el modelo de conexión cambia, no solo la
  sintaxis. Reescribir el cliente para usar adapter es trabajo no
  trivial si ya hay queries escritas.
- El cliente generado en `src/generated/prisma/` no expone
  `index.ts` (entry point real es `client.ts`). Pequeña fricción
  con la convención esperada por bundlers y editores.
- `dotenv` debe importarse explícitamente en `prisma.config.ts`
  (`import "dotenv/config"`); el config file no lee `.env`
  automáticamente.

Calibración para futuros ADRs: cuando una "consequence negative"
se describa como "sintaxis cambia" o "API distinta", profundizar
una capa más — distinguir entre cambio cosmético, cambio
estructural, y cambio de modelo. En este caso el coste real fue
"cambio de modelo de conexión", no "sintaxis".
