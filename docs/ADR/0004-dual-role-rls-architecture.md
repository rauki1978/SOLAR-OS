# ADR-0004: Dual role architecture for RLS enforcement

- **Status:** Accepted (implementation pending in T0.2.4)
- **Date:** 2026-04-26
- **Decided by:** Founder

## Context

En T0.2.3 instalamos las policies RLS sobre `Organization`,
`User`, y `Membership` con `FORCE ROW LEVEL SECURITY` y
scoping por session variable `app.current_org_id`. El smoke
test (`scripts/smoke-rls.ts`) demostró que las policies no
filtran tráfico cuando Prisma se conecta con el rol `postgres`
de Supabase, que tiene `BYPASSRLS` por defecto.

Esto es comportamiento documentado por Supabase: `postgres`
es admin role para que dashboard, migraciones y backups
puedan operar sin engancharse en policies de usuario. No es
bug, es decisión upstream razonable.

## Decision

Adoptamos **arquitectura dual de roles** para Postgres:

1. **`postgres`** (rol existente, BYPASSRLS) — reservado para:
   - Migraciones Prisma (`prisma migrate dev/deploy`).
   - Operaciones admin: webhooks de Clerk que crean orgs y
     memberships antes de que exista session activa.
   - Tareas de mantenimiento: backups lógicos, scripts de
     limpieza, seeds de catálogo global.

2. **`app_user`** (rol nuevo, sin BYPASSRLS) — usado por:
   - Cliente Prisma en runtime de la aplicación web.
   - Toda query de negocio derivada de una sesión de usuario.

Esto se materializa en dos connection strings:

- `DIRECT_URL` → conexión como `postgres` (session pooler).
  Se mantiene tal como está hoy. Lo usa prisma.config.ts
  para migraciones.
- `DATABASE_URL` → conexión como `app_user` (transaction
  pooler). Lo usa el adapter de Prisma en runtime. Reemplaza
  la forma actual donde apunta a `postgres`.

El rechazo de las dos alternativas consideradas:

- **Roles nativos de Supabase (`authenticated`, `service_role`):**
  requieren JWT firmado por Supabase Auth, lo que choca con
  ADR-0001 (Clerk como fuente de identidad).
- **RLS como red muerta + wrapper como única capa:** elimina
  la defensa en profundidad que prometía el blueprint §4.1.

## Consequences

Positivas:
- Defensa en profundidad real: bug en wrapper → RLS lo
  captura, no leak silencioso.
- Trazabilidad: pg_stat_statements separa queries de admin
  (postgres) de queries de aplicación (app_user). Útil para
  debug y auditoría.
- Patrón canónico documentado por Supabase y por la
  comunidad RLS-on-Postgres.

Negativas:
- Setup más complejo: dos roles, dos connection strings,
  dos passwords gestionados.
- Las migraciones cambian de naturaleza ligeramente: cada
  nueva tabla con datos de tenant requiere acordarse de
  `GRANT` privilegios DML a `app_user` (o usar
  `ALTER DEFAULT PRIVILEGES` para automatizarlo — decisión
  de T0.2.4).
- Decidir qué cliente usar (admin vs app) es responsabilidad
  del developer en cada Server Action / job. Mitigable con
  APIs claras: `getAdminPrisma()` vs `getTenantPrisma()`.

## Implementation

Implementación completa en T0.2.4:
- Crear rol `app_user` (mecanismo concreto a decidir en T0.2.4
  pre-implementación).
- Grants iniciales sobre las 3 tablas existentes.
- `ALTER DEFAULT PRIVILEGES` para futuras tablas (a evaluar).
- Actualizar `DATABASE_URL` en .env.local y `.env.example`.
- Actualizar el adapter de Prisma para conectar con la nueva URL.
- Re-correr `scripts/smoke-rls.ts` y verificar que pasa 3/3.
- Construir `getTenantPrisma()` wrapper (alcance original
  de T0.2.4).
- Tests de aislamiento Vitest.

## Verification

El éxito de T0.2.4 se mide por:
1. `scripts/smoke-rls.ts` pasa 3/3 sin modificarse.
2. Tests de aislamiento multi-tenant pasan en Vitest.
3. ADR queda actualizado a `Status: Accepted (implemented in T0.2.4)`.
