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

Plan de T0.2.4 con cinco decisiones cerradas en sesión del 2026-04-26.

### D1. Creación del rol `app_user`

Mecanismo dual:

- **Migración Prisma** (`prisma/migrations/<ts>_create_app_user/`)
  crea el rol con `CREATE ROLE app_user NOLOGIN`. La migración es
  reproducible vía `prisma migrate deploy` en cualquier entorno.
- **Script de bootstrap** (`packages/database/scripts/bootstrap-app-user.ts`)
  lee `APP_USER_PASSWORD` desde `process.env` y ejecuta
  `ALTER ROLE app_user PASSWORD '...' LOGIN`. Idempotente, se
  corre una vez por entorno tras cada rotación.

Rechazadas: rol creado manualmente vía Supabase SQL editor
(rompe reproducibilidad), y password literal en migración SQL
(commit de secreto a git).

### D2. Concesión de privilegios

Migración aplica dos bloques:

- `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user`
  + el equivalente sobre `ALL SEQUENCES`. Cubre las 3 tablas
  actuales (`Organization`, `User`, `Membership`).
- `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ... ON TABLES TO app_user`
  + el equivalente para `SEQUENCES`. Cubre tablas futuras
  creadas por `postgres` (todas las migraciones de Prisma).

Razón: queremos que cuando T1.1.1 cree `Lead`, T1.2.1 cree
`Project`, etc., los grants se hereden automáticamente sin
que el dev tenga que acordarse.

Rechazada: `ALTER TABLE ... OWNER TO app_user` (transferir
ownership rompe migraciones futuras donde `postgres` necesita
privilegios de owner).

### D3. Mapping de connection strings

Convención adoptada:

| Variable        | Rol         | Pooler             | Uso                            |
|-----------------|-------------|--------------------|--------------------------------|
| `DATABASE_URL`  | `app_user`  | transaction (6543) | Runtime adapter de Prisma      |
| `DIRECT_URL`    | `postgres`  | session (5432)     | Migraciones (prisma.config.ts) |

Cambio respecto al estado actual: `DATABASE_URL` deja de apuntar
a `postgres` y pasa a apuntar a `app_user`. `DIRECT_URL` sin
cambios. Se actualiza `apps/web/.env.local`, `packages/database/.env`,
y `.env.example` (sin secrets en este último).

La duplicación entre los dos `.env` está registrada en
`docs/tech-debt.md` entrada #11 — T0.2.4 la agrava añadiendo
`APP_USER_PASSWORD` a la sincronización manual.

### D4. Bypass para webhooks y operaciones admin

El módulo `apps/web/src/lib/tenant.ts` exporta dos funciones:

- `getTenantPrisma(orgId: string)` — uso por defecto. Conecta
  con `DATABASE_URL` (rol `app_user`, sin BYPASSRLS). Toda
  query pasa por `runTenantTx` con `SET LOCAL app.current_org_id`.
- `getAdminPrisma()` — uso restringido. Conecta con `DIRECT_URL`
  (rol `postgres`, BYPASSRLS). Permitido solo en:
  - Handlers de webhooks de Clerk (`apps/web/src/app/api/webhooks/clerk/`).
  - Jobs admin de Inngest que operan cross-tenant.
  - Scripts de mantenimiento en `packages/database/scripts/`.

Cualquier uso de `getAdminPrisma()` fuera de estos contextos
debe justificarse en code review y, si se acepta, registrarse
en `docs/tech-debt.md`.

Rechazadas:
- Valor placeholder de `app.current_org_id` reconocido por la
  policy como bypass (magia frágil).
- Funciones SQL `SECURITY DEFINER` para ops admin (lógica
  crítica fuera del código TS, patrón anticuado).

### D5. Forma del wrapper `getTenantPrisma`

API pública del wrapper:

```ts
export function getTenantPrisma(organizationId: string) {
  return {
    runTenantTx: <T>(fn: (tx: PrismaTransactionClient) => Promise<T>) => Promise<T>
  }
}
```

Uso esperado en módulos:

```ts
// modules/projects/queries.ts
export async function listProjects() {
  const session = await requireSession()
  const db = getTenantPrisma(session.organizationId)
  return db.runTenantTx(tx => tx.project.findMany())
}
```

Implementación interna: `runTenantTx` abre `$transaction([...])`
con un primer statement `SET LOCAL app.current_org_id = '<id>'`
seguido de la query del callback. `SET LOCAL` garantiza que la
variable de sesión se libera al cerrar la transacción y no
contamina conexiones reutilizadas por el pooler.

Rechazadas:
- `$extends` con AsyncLocalStorage (magia que falla silenciosa
  si alguien olvida poblar el contexto).
- Cliente Prisma cacheado por `orgId` (optimización prematura).
- Ejecutar `SET` fuera de transacción (no funciona — `SET LOCAL`
  requiere transacción; `SET SESSION` se filtraría a otras orgs
  a través del pooler).

### Regla de proceso — gestión de la password de `app_user`

La password de `app_user` se genera localmente y nunca pasa por
chat con el asistente. Comando recomendado:

- Linux/Mac: `openssl rand -base64 32 | pbcopy` (o `xclip` en Linux).
- Windows PowerShell: `[Convert]::ToBase64String((1..32 | %{Get-Random -Maximum 256}))` y copiar manualmente.

Va directa al portapapeles, de ahí a `.env.local`, `.env` y al
comando `ALTER ROLE` que ejecuta el bootstrap. Esto evita
reproducir el incidente registrado en `docs/tech-debt.md` #6.

### Verificación de éxito de T0.2.4

Tres criterios objetivos:

1. `packages/database/scripts/smoke-rls.ts` (creado en T0.2.3,
   fallaba 3/3 con el rol `postgres`) pasa 3/3 sin modificarse
   tras cambiar `DATABASE_URL` a `app_user`.
2. Tests Vitest de aislamiento multi-tenant pasan
   (escritos en T0.2.4 con el subagente `tenant-isolation-tester`).
3. Este ADR queda actualizado a
   `Status: Accepted (implemented in T0.2.4)`.

## Verification

El éxito de T0.2.4 se mide por:
1. `scripts/smoke-rls.ts` pasa 3/3 sin modificarse.
2. Tests de aislamiento multi-tenant pasan en Vitest.
3. ADR queda actualizado a `Status: Accepted (implemented in T0.2.4)`.
