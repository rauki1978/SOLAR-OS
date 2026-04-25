# ADR-0001: Clerk como sistema de autenticación

- **Status:** Accepted
- **Date:** 2026-04-25
- **Decided by:** Founder

## Context

SolarOS es un SaaS multi-tenant B2B con organizaciones,
memberships y siete roles de negocio (OWNER, ADMIN, MARKETING,
COMMERCIAL, TECHNICIAN, INSTALLER, CUSTOMER). El blueprint
inicial proponía NextAuth v5 + Resend Email Provider.

Al verificar el ecosistema en abril 2026 aparecen tres factores:

1. NextAuth v5 / Auth.js v5 sigue marcado como `beta` tras casi
   dos años de desarrollo, y sus propios mantenedores empiezan a
   dirigir nuevos proyectos hacia alternativas más modernas.
2. Next.js 16 renombró `middleware.ts` a `proxy.ts`, lo cual
   rompe parcialmente el patrón documentado de Auth.js v5 y
   requiere fixes manuales.
3. Las features que SolarOS necesita en M0.3 — signup, gestión
   de organizaciones, memberships, invitaciones por email,
   selector de organización — son aproximadamente 4 días de
   trabajo en NextAuth, mientras que vienen de fábrica en Clerk.

## Decision

Adoptamos **Clerk** como sistema de autenticación e identidad,
con tres reglas adicionales:

1. **Mirror local en Postgres.** Las tablas `Organization`,
   `User` y `Membership` se mantienen en la base de datos local
   sincronizadas desde Clerk vía webhooks (eventos `user.*`,
   `organization.*`, `organizationMembership.*`). Clerk es
   fuente de verdad para identidad y sesión; la DB local es
   fuente de verdad para datos de negocio (cif, branding, plan,
   trialEndsAt, slug en Organization; role custom en Membership).

2. **Roles built-in de Clerk para lo estructural, roles
   propios para el negocio.** Clerk gestiona admin/basic_member
   (¿puede invitar y gestionar la organización?). Los 7 roles
   de SolarOS viven en `Membership.role` local y son los que
   gobiernan la matriz de permisos de la sección 7 del blueprint.
   Esto evita depender del plan Pro de Clerk para custom roles
   en el día uno.

3. **CUSTOMER fuera de Clerk.** Los clientes finales que acceden
   al portal white-label no son usuarios de Clerk. El portal usa
   `CustomerPortalAccess` con `magicToken` propio (ver blueprint
   sección 6.12). Clerk se reserva para los empleados de la
   instaladora — los usuarios que pagan por el SaaS.

## Consequences

### Positive

- M0.3 se reduce de ~4.5 días a ~3.5 días (signup, invitations,
  organization switcher pre-construidos).
- UI de gestión de cuenta y organizaciones (`<UserButton />`,
  `<OrganizationSwitcher />`) sin trabajo adicional.
- Compatibilidad oficial con Next.js 16 ya publicada por Clerk
  (cache components, `proxy.ts`).
- Tier gratuito (10K MAU) cubre con holgura el cliente piloto y
  los primeros clientes.
- Reduce superficie de mantenimiento de auth: parches de
  seguridad, OAuth providers nuevos, etc., los gestiona Clerk.

### Negative / Trade-offs

- Vendor lock-in moderado. Migrar fuera de Clerk requeriría
  reimplementar signup, invitations y switching, además de un
  proceso de migración de identidades.
- Coste recurrente cuando crucemos 10K MAU (~25 €/mes plan Pro
  inicial, escala con uso).
- Dependencia de la disponibilidad de Clerk para sign-in. Si
  Clerk cae, los usuarios no pueden entrar (mitigable con sesiones
  de larga duración pero no eliminable).
- El mirror local introduce una pequeña ventana de inconsistencia
  entre Clerk y la DB si un webhook falla; mitigado con cola
  Inngest y reintentos.

## Alternatives Considered

### NextAuth v5 / Auth.js v5

Lo que el blueprint inicial proponía. Descartado por: estado beta
prolongado, breaking changes con Next.js 16 (proxy.ts), y porque
forzaría a construir a mano signup, invitations y org switching
(~4 días que no aportan diferenciación al producto).

### Better Auth

Alternativa moderna con sesiones en DB propia y configuración
en código. Descartado por: menos battle-tested para multi-tenant
con organizations, comunidad más pequeña (peor para AI assistants
y para encontrar ejemplos cuando algo se atasca), y la pieza de
"organizations + memberships + invitations" no viene tan completa
como en Clerk.

### Self-hosted (Lucia, custom)

Descartado por coste de mantenimiento incompatible con un equipo
de un fundador.

## Notes

- Cuando crucemos el tier gratuito de Clerk, revisar si hace
  sentido upgrade a plan Pro o evaluar migración. No antes.
- Si en el futuro queremos custom roles en Clerk en lugar de
  `Membership.role` local, es una decisión revertible: requiere
  pasar al plan Pro de Clerk y migrar los valores de role.
- Webhook signing secret debe rotarse al menos una vez al año.
