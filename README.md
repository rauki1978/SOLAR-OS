# SolarOS

SaaS multi-tenant para empresas instaladoras de tecnologías renovables en España. Cubre el ciclo completo: captación → cualificación → diseño → propuesta → financiación → firma → tramitación → instalación → puesta en marcha → postventa → monitorización.

## Documentación

- [docs/BLUEPRINT.md](docs/BLUEPRINT.md) — Documento maestro del proyecto (visión, stack, modelo de datos, fases, glosario).

## Subagentes Claude Code

Definidos en [`.claude/agents/`](.claude/agents/) y versionados con el repo:

- **module-scaffolder** — Genera estructura completa de un módulo nuevo en `apps/web/src/modules/` con multi-tenant scoping y validación Zod.
- **integration-builder** — Genera paquetes `packages/integrations/<provider>/` con cliente HTTP retry-safe, types, schemas y tests con MSW.
- **tenant-isolation-tester** — Escribe tests adversariales que prueban que org A no puede acceder a datos de org B (DB scoping, Server Actions, RLS).
- **spanish-compliance-expert** — Asesora e implementa con conocimiento del marco regulatorio español (RD 244/2019, CAU, CIE, RADNE, IDAE, etc.).

## Estado

Sprint 0 — bootstrap.
