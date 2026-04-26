# Deuda técnica conocida — SolarOS

Documento vivo. Cada entrada describe una decisión que
aceptamos como deuda en su momento, no un ADR cerrado.
Cuando una deuda se resuelva, se mueve al final del
archivo bajo "Resueltas" con la fecha y el commit que
la cerró.

## Pendientes

### Sentry: warning de `disableLogger` deprecated
- Origen: T0.1.5 (commit 81aa24e).
- Detalle: `disableLogger: true` en `next.config.ts`
  está marcado como deprecated en `@sentry/nextjs`
  v10. La sustituta oficial
  (`webpack.treeshake.removeDebugLogging`) no funciona
  con Turbopack, que es el bundler default de Next.js
  16. Sentry tiene incompatibilidad arquitectónica con
  Turbopack y la transición está en su lado.
- Trigger: revisar al hacer upgrade de
  `@sentry/nextjs` a un major superior, o cuando
  Sentry publique alternativa Turbopack-compatible.

### Sentry: source maps de producción no subidos
- Origen: T0.1.5 (commit 81aa24e).
- Detalle: `withSentryConfig` en `next.config.ts`
  tiene `silent: !process.env.CI`. Sin
  `SENTRY_AUTH_TOKEN` configurado en CI, los source
  maps no se suben en builds de producción. Resultado
  práctico: errores en producción aparecerán en Sentry
  con stack traces minificadas.
- Trigger: M0.5 (CI/CD) o antes si despliegamos algo a
  producción de verdad.

### Página y endpoint de prueba de Sentry no eliminados
- Origen: T0.1.5 (commit 81aa24e).
- Detalle: `apps/web/src/app/sentry-test/page.tsx` y
  `apps/web/src/app/api/sentry-test/route.ts`
  existen para verificar manualmente que Sentry captura
  errores. No deben llegar a producción.
- Trigger: antes del primer despliegue a producción
  real (no preview) de la app.

### Geist font no embebida
- Origen: M0.1, decisión arrastrada hasta M0.4.
- Detalle: el layout actual referencia Geist Sans y
  Geist Mono en CSS pero la fuente no está cargada
  vía `next/font` ni vía `<link>`. Browsers usan
  fallback del sistema. Funciona pero la tipografía
  no es la del sistema de diseño definido en ADR-0002.
- Trigger: M0.4 (layout y navegación).

### Toggle dark/light real (next-themes)
- Origen: T0.1.3.
- Detalle: el dark mode está hardcoded vía
  `className="dark"` en `apps/web/src/app/layout.tsx`.
  No hay toggle UI ni respeta preferencia del sistema.
  ADR-0002 prevé dual mode con toggle.
- Trigger: M0.4 (layout y navegación).

### Credenciales de Supabase comprometidas en sesión inicial
- Origen: T0.2.1.
- Detalle: durante la configuración inicial,
  `SUPABASE_SERVICE_ROLE_KEY` y la database password
  del proyecto `solaros-dev` quedaron expuestas en
  conversación con el asistente. La decisión informada
  fue NO rotar inmediatamente y aceptar el riesgo
  durante el desarrollo solo, dado que la base de
  datos está vacía.
- Trigger: **OBLIGATORIO antes de meter datos del
  piloto SolarQuad o cualquier dato real de cliente**.
  Acción: rotar service role key y database password
  desde Supabase dashboard, actualizar 4 lugares en
  apps/web/.env.local + packages/database/.env
  (DATABASE_URL, DIRECT_URL en cada uno, más
  SUPABASE_SERVICE_ROLE_KEY en .env.local).

### ADRs no formateados con Prettier
- Origen: T0.1.2 (`.prettierignore` excluye
  `docs/BLUEPRINT.md` y `docs/ADR/**`).
- Detalle: los ADRs y BLUEPRINT.md están excluidos
  de Prettier porque su formato manual incluye tablas
  ASCII y otros elementos que Prettier reorganizaría.
  Coste: inconsistencia menor entre archivos formateados
  y no formateados.
- Trigger: cuando tengamos 5+ ADRs y empecemos a
  notar la inconsistencia visualmente, evaluar si
  vale la pena un format manual one-shot o
  configurar Prettier con reglas específicas para
  Markdown.

### pnpm 10.28 → 10.33 disponible
- Origen: T0.1.1, observado durante M0.1.
- Detalle: el lockfile y los scripts funcionan con
  10.28. La 10.33 es minor, sin breaking changes
  esperados.
- Trigger: cuando hagamos siguiente bump de major de
  alguna dependencia core (Node, TypeScript, Next.js)
  y aprovechemos para refrescar tooling.

### Inconsistencia arquitectónica Sentry ↔ Turbopack
- Origen: T0.1.5.
- Detalle: ya cubierta por la primera entrada
  (`disableLogger`), pero merece nota separada porque
  potencialmente surgirán más fricciones. Sentry
  asume Webpack en varias opciones de
  `withSentryConfig`; Next.js 16 prefiere Turbopack.
  Los warnings que veamos en futuras tareas pueden
  tener la misma raíz.
- Trigger: monitorizar al actualizar versiones.

### Turbo `test` declara outputs de coverage que no genera
- Origen: T0.1.4 (commit ba4a39b).
- Detalle: `turbo.json` declara `"test": { "outputs": ["coverage/**"] }`,
  pero `vitest run` (sin `--coverage`) no produce esa carpeta.
  Resultado: cada `pnpm test` emite dos warnings benignos:
  `"no output files found for task @solaros/ui#test"` y
  el equivalente para web. El task `test:coverage` sí los
  produciría, así que el `outputs` está en el task equivocado.
- Trigger: cuando los warnings empiecen a molestar en CI o
  cuando refactoricemos `turbo.json`. Fix: mover `outputs` de
  `test` a `test:coverage` exclusivamente.

### Credenciales DB duplicadas en dos archivos `.env`
- Origen: T0.2.1.
- Detalle: `DATABASE_URL` y `DIRECT_URL` viven a la vez en
  `apps/web/.env.local` (para el runtime de Next.js) y en
  `packages/database/.env` (para Prisma CLI desde
  `packages/database`). Decisión deliberada para evitar
  symlinks o cargas relativas, pero implica que cualquier rotación
  o cambio requiere actualizar dos sitios. Olvidar uno produce
  errores asimétricos (web funciona, migrate falla, o viceversa).
- Trigger: cuando rotemos credenciales por primera vez (ver
  deuda "Credenciales de Supabase comprometidas") evaluamos si
  consolidar mediante symlink, monorepo-wide `.env`, o un script
  de sync. Hasta entonces, pareja manual. T0.2.4 agrava la
  situación añadiendo APP_USER_PASSWORD a la sincronización
  manual entre ambos archivos.

### Asimetría shadow ↔ real DB en migraciones que tocan `_prisma_migrations` u objetos del sistema
- Origen: T0.2.4 (commit pendiente).
- Detalle: el shadow database de Prisma `migrate dev` corre las
  migraciones secuencialmente pero sin materializar
  `_prisma_migrations` durante la corrida (solo en la real DB,
  post-aplicación). Cualquier migración que referencie esa tabla
  o tablas creadas por extensiones del sistema (pg_cron,
  pg_extension, etc.) debe envolverse en
  `DO $$ ... IF EXISTS ... END $$` para ser shadow-safe.
- Trigger: documentar como patrón canónico cuando aparezca la
  siguiente migración del estilo (probable con Inngest, pg_cron,
  o cualquier extensión que cree tablas).

## Resueltas

(vacío por ahora; cuando una deuda se resuelva, se
mueve aquí con fecha y commit)
