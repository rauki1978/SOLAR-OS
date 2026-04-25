# SolarOS — Blueprint de construcción

> Documento maestro del proyecto. Diseñado para ser leído por Claude Code como contexto de trabajo. **Cualquier ambigüedad encontrada al ejecutar una tarea debe resolverse consultando este documento antes que reabrir decisiones ya tomadas.**

---

## Tabla de contenidos

1. [Visión y alcance](#1-visión-y-alcance)
2. [Decisiones tomadas (no reabrir)](#2-decisiones-tomadas-no-reabrir)
3. [Stack técnico](#3-stack-técnico)
4. [Principios arquitectónicos](#4-principios-arquitectónicos)
5. [Estructura de carpetas](#5-estructura-de-carpetas)
6. [Modelo de datos](#6-modelo-de-datos)
7. [Roles y permisos](#7-roles-y-permisos)
8. [Módulos y tareas](#8-módulos-y-tareas)
9. [Convenciones de código](#9-convenciones-de-código)
10. [Glosario español-fotovoltaico](#10-glosario-español-fotovoltaico)
11. [Sprint 0 — Bootstrap](#11-sprint-0--bootstrap)
12. [Definition of Done](#12-definition-of-done)
13. [Anti-objetivos](#13-anti-objetivos)
14. [Subagentes Claude Code](#14-subagentes-claude-code)

---

## 1. Visión y alcance

### 1.1 Qué es SolarOS

SaaS multi-tenant para empresas instaladoras de tecnologías renovables en España. Cubre el ciclo completo: captación → cualificación → diseño → propuesta → financiación → firma → tramitación → instalación → puesta en marcha → postventa → monitorización.

Posicionamiento: *"el operating system del instalador renovable español"*. Equivalente conceptual a Reonic (Alemania) pero con compliance español profundo.

### 1.2 Cliente objetivo

Instaladoras españolas pequeñas y medianas (10-200 empleados, 5-100 instalaciones/mes). Cliente piloto: 50 instalaciones/mes.

### 1.3 Tecnologías cubiertas

Modelo de datos preparado para 4 tecnologías desde el día uno; arranque solo con PV.

| Tecnología | Fase de arranque |
|---|---|
| Fotovoltaica (PV) | F1 — núcleo |
| Almacenamiento (baterías) | F1 — modelo + UI básica |
| Wallbox (cargador VE) | F1 — modelo + UI básica |
| Aerotermia (bombas de calor) | Fase futura |

### 1.4 Diferenciadores frente a Reonic, Sunbase, Coperniq

- Compliance español: CAU, RADNE, RAC, CIE, RD 244/2019, modalidades de autoconsumo
- Integración con Catastro (geometría real de cubiertas)
- Base de subvenciones autonómicas + IDAE + deducciones IRPF + bonificaciones IBI
- Certificación energética embebida (CEE previo y final)
- Conector Holded (no facturación nativa)
- Integración con distribuidoras españolas (e-distribución, i-DE, UFD)
- Conectores de inversor multi-marca para postventa

### 1.5 Lo que NO va dentro

- Generación de Memoria Técnica de Diseño (MTD). Solo se trackea el estado.
- Facturación nativa. Verifactu, modelos AEAT, contabilidad → **delegado a Holded**.
- Plan general contable, asientos, balances, cierres.
- Generación de proyectos eléctricos visados.

---

## 2. Decisiones tomadas (no reabrir)

Estas decisiones están cerradas. Si una tarea propone reabrirlas, descartar.

| Decisión | Resolución | Razón |
|---|---|---|
| Compartir código con ObraOS | **No** | Producto independiente |
| Generador automático de MTD | **No** | Bajo moat, alto coste |
| Facturación nativa | **No** | Riesgo legal Verifactu, conector Holded en su lugar |
| ERP | **No** | Holded lo cubre |
| Multi-tenant | **Sí, desde día uno** | Anti-deuda técnica |
| Multi-tecnología en modelo | **Sí, desde día uno** | Reonic enseña la lección |
| App móvil | **Sí, desde MVP con Expo** | No es opcional para uso en obra |
| Stack base | Next.js + Prisma + Supabase + R2 | Familiaridad y velocidad |
| Idioma del producto | **es-ES** inicial, estructura i18n preparada | Mercado español primero |

---

## 3. Stack técnico

### 3.1 Web (apps/web)

| Capa | Tecnología | Versión objetivo |
|---|---|---|
| Framework | Next.js (App Router) | 16.x |
| UI runtime | React | 19.x |
| Lenguaje | TypeScript (strict) | 5.x |
| ORM | Prisma | 6.x |
| Base de datos | PostgreSQL (Supabase) | 16+ |
| Auth | Clerk | última estable |
| Storage objetos | Cloudflare R2 | — |
| Estilos | Tailwind CSS + shadcn/ui | última estable |
| Forms | React Hook Form + Zod | última |
| Server state | TanStack Query | v5 |
| Client state | Zustand | última |
| Email transaccional | Resend | — |
| Email entrante (parsing) | Postmark Inbound | — |
| Background jobs | Inngest | — |
| Errores | Sentry | — |
| Producto analytics | PostHog | — |
| Testing unidad/integración | Vitest | — |
| Testing E2E | Playwright | — |
| i18n | next-intl | — |

### 3.2 Diseño solar (módulos especializados)

| Función | Librería |
|---|---|
| Mapas base | MapLibre GL JS |
| Imagen aérea | PNOA (IGN) WMS gratuito |
| Catastro | Sede Catastro OVC API |
| Geocoding | Mapbox Geocoding |
| Canvas dibujo cubierta | React-Konva |
| Sombras solares | suncalc + cálculo propio |
| Producción esperada | PVGIS-SARAH3 (JRC EU) |
| Esquemas unifilares | React Flow (xyflow) |
| Generación PDF | @react-pdf/renderer |

### 3.3 Integraciones externas

| Sistema | Endpoint |
|---|---|
| Holded | API REST nativa |
| Signaturit | Firma electrónica eIDAS |
| Stripe | Pagos internacionales |
| Redsys | Pagos España |
| Google Workspace | Calendar API + Gmail |
| Microsoft 365 | Microsoft Graph |
| VIES NIF | API gratuita UE |
| SolarEdge | API monitorización (postventa) |
| Huawei FusionSolar | API monitorización (postventa) |

### 3.4 Móvil (apps/mobile)

| Capa | Tecnología |
|---|---|
| Framework | React Native + Expo (SDK 53+) |
| DB local | WatermelonDB |
| Sync | PowerSync sobre Supabase |
| Push | Expo Notifications |
| Cámara | Expo Camera |

### 3.5 Búsqueda

| Etapa | Solución |
|---|---|
| Inicial (<10K rows) | PostgreSQL full-text |
| Catálogo componentes (>50K) | Meilisearch self-hosted |
| RAG asistente IA (futuro) | pgvector |

### 3.6 Hosting

| Componente | Proveedor |
|---|---|
| Web app | Vercel Pro |
| Base de datos | Supabase Pro |
| Storage | Cloudflare R2 |
| Búsqueda | Meilisearch en Railway/Fly.io (futuro) |
| Mobile build | EAS Build (Expo) |

---

## 4. Principios arquitectónicos

### 4.1 Multi-tenant estricto

- **Toda tabla con datos de cliente** lleva `organizationId String`.
- Row-Level Security (RLS) activada en Supabase como cinturón.
- Middleware de Next.js valida el `organizationId` de la sesión contra cada request.
- Helpers de Prisma envueltos para forzar el scope: `getTenantPrisma(orgId)`.
- Tests específicos de aislamiento entre orgs antes de salir a producción.
- Las tablas Organization, User y Membership son **mirror local** sincronizado desde Clerk vía webhooks. Clerk es la fuente de verdad para identidad y sesión; la DB local es la fuente de verdad para datos de negocio asociados.

### 4.2 Server-first

- Server Components por defecto.
- Server Actions para mutaciones, no API routes salvo:
  - Webhooks entrantes
  - Endpoints públicos (calculadora, portal cliente)
  - Integraciones consumibles externamente
- Validación Zod en cada borde de entrada de datos.

### 4.3 Type-safety end-to-end

- Prisma → tipos generados.
- Zod schemas como única fuente de verdad para validación.
- Tipos compartidos vivos en `packages/types` (si monorepo) o `src/lib/types`.
- `any` prohibido salvo razón documentada en comentario.

### 4.4 Modelo multi-tecnología

- Entidad central: `Project`. Campo `technologies: Technology[]`.
- Composición por subentidades específicas: `PVSystem`, `StorageSystem`, `WallboxSystem`, `HeatPumpSystem`. Cada una opcional.
- UIs y cálculos se ramifican según composición, nunca se asume PV.

### 4.5 Compliance español first

- Toda referencia normativa documentada en código con enlace al BOE o IDAE.
- Glosario único en este blueprint (sección 10).
- No se traducen siglas españolas. CAU es CAU, no "self-consumption code".

### 4.6 Integrar antes que construir

Si existe un sistema externo robusto, se integra. No se reimplementa:

| Necesidad | Solución |
|---|---|
| Facturación legal | Holded |
| Geometría cubiertas | Catastro |
| Producción esperada | PVGIS |
| Validación NIF | VIES |
| Firma cualificada | Signaturit |

### 4.7 Tests donde duele

- Lógica de cálculo solar (sombras, strings, dimensionado): cobertura alta
- Integraciones externas: tests con mocks + tests E2E con sandbox
- Aislamiento multi-tenant: tests obligatorios
- CRUD trivial: cobertura ligera, no obsesiva

### 4.8 Observabilidad mínima

- Sentry desde el día uno
- Logs estructurados en JSON (Pino)
- Health endpoint en `/api/health` chequeando DB + R2 + jobs
- Métricas básicas vía PostHog: funnel comercial, adopción por módulo

---

## 5. Estructura de carpetas

Decisión: **monorepo con Turborepo + pnpm**, pese a no compartir con ObraOS, porque sí compartirá web ↔ mobile ↔ packages internos.

```
solaros/
├── apps/
│   ├── web/                    # Next.js 16 (frontend + backend)
│   └── mobile/                 # Expo / React Native
├── packages/
│   ├── database/               # Prisma schema, client, migrations
│   ├── ui/                     # shadcn/ui components compartidos web
│   ├── solar-engine/           # PVGIS, sombras, strings, dimensionado
│   ├── integrations/           # Holded, Signaturit, Catastro, PVGIS, etc.
│   ├── types/                  # Tipos TS compartidos
│   ├── validators/             # Zod schemas
│   └── config/                 # ESLint, TS, Tailwind base
├── docs/
│   ├── BLUEPRINT.md            # Este documento
│   ├── ADR/                    # Architecture Decision Records
│   └── runbooks/               # Operación
├── .github/workflows/          # CI/CD
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### 5.1 Estructura interna de apps/web

```
apps/web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        # Web pública
│   │   ├── (auth)/             # Login, signup, invitaciones
│   │   ├── (app)/              # App autenticada
│   │   │   ├── leads/
│   │   │   ├── projects/
│   │   │   ├── proposals/
│   │   │   ├── operations/
│   │   │   ├── procedures/
│   │   │   ├── postsales/
│   │   │   ├── catalog/
│   │   │   ├── settings/
│   │   │   └── ...
│   │   ├── (portal)/           # Portal cliente final (white-label)
│   │   └── api/                # Webhooks + endpoints públicos
│   ├── modules/                # Lógica por feature
│   │   ├── leads/
│   │   ├── projects/
│   │   ├── proposals/
│   │   ├── procedures/
│   │   ├── operations/
│   │   ├── billing/
│   │   ├── postsales/
│   │   ├── certificates/
│   │   └── customer-portal/
│   ├── lib/
│   │   ├── auth/
│   │   ├── tenant/
│   │   ├── server-actions/
│   │   └── utils/
│   ├── components/
│   │   ├── shared/
│   │   └── kanban/
│   └── styles/
├── public/
└── tests/
```

Cada módulo en `src/modules/X/` contiene:
- `actions.ts` — Server Actions
- `queries.ts` — Server-side queries (cacheables)
- `schemas.ts` — Zod schemas
- `types.ts` — tipos TS específicos
- `services/` — lógica de negocio compleja
- `components/` — UI específica del módulo

---

## 6. Modelo de datos

Schema Prisma de referencia. Las relaciones se omiten para legibilidad. **Cada entidad de cliente lleva `organizationId`.**

### 6.1 Tenancy y usuarios

```prisma
model Organization {
  id          String   @id @default(cuid())
  clerkOrgId  String   @unique
  name        String
  slug        String   @unique
  cif         String?
  address     Json?
  branding    Json?    // logo, colors para portal white-label
  plan        Plan     @default(STARTER)
  trialEndsAt DateTime?
  createdAt   DateTime @default(now())
}

model User {
  id            String   @id @default(cuid())
  clerkUserId   String   @unique
  email         String   @unique
  name          String?
  emailVerified DateTime?
  image         String?
}

model Membership {
  // Mirror de Organization Memberships de Clerk + extensión
  // con el campo `role` propio de SolarOS (ver sección 7).
  id             String   @id @default(cuid())
  userId         String
  organizationId String
  role           Role     // OWNER, ADMIN, MARKETING, COMMERCIAL, TECHNICIAN, INSTALLER, CUSTOMER
  permissions    Json?    // overrides finos
  invitedAt      DateTime?
  acceptedAt     DateTime?
  @@unique([userId, organizationId])
}

enum Role {
  OWNER
  ADMIN
  MARKETING
  COMMERCIAL
  TECHNICIAN
  INSTALLER
  CUSTOMER
}

enum Plan {
  STARTER
  PROFESSIONAL
  ENTERPRISE
}
```

### 6.2 CRM y comercial

```prisma
model Lead {
  id             String   @id @default(cuid())
  organizationId String
  source         String?  // web, meta, google, referral, manual
  sourceDetail   Json?
  status         LeadStatus @default(NEW)
  contactName    String
  contactEmail   String?
  contactPhone   String?
  address        String?
  technologies   Technology[]
  expectedKwh    Float?   // consumo anual estimado
  qualification  Json?    // checklist resultados
  assignedToId   String?
  convertedAt    DateTime?
  createdAt      DateTime @default(now())
}

enum LeadStatus {
  NEW
  CONTACTED
  QUALIFIED
  STUDY
  LOST
  CONVERTED
}

model Account {
  // Cliente final (puede ser persona física o empresa)
  id             String   @id @default(cuid())
  organizationId String
  type           AccountType  // INDIVIDUAL | COMPANY
  legalName      String
  taxId          String?      // NIF/CIF
  email          String?
  phone          String?
  billingAddress Json?
}

enum AccountType { INDIVIDUAL COMPANY }

model Activity {
  id             String   @id @default(cuid())
  organizationId String
  projectId      String?
  leadId         String?
  type           ActivityType  // CALL, EMAIL, MEETING, NOTE, TASK
  subject        String
  body           String?
  dueDate        DateTime?
  completedAt    DateTime?
  authorId       String
}
```

### 6.3 Proyecto multi-tecnología

```prisma
model Project {
  id             String   @id @default(cuid())
  organizationId String
  reference      String   // referencia humana (PRY-2026-0001)
  name           String
  status         ProjectStatus
  technologies   Technology[]
  accountId      String
  siteId         String
  ownerId        String   // comercial o PM responsable
  estimatedClose DateTime?
  estimatedStart DateTime?
  createdAt      DateTime @default(now())

  // Subentidades por tecnología (todas opcionales)
  pvSystem       PVSystem?
  storageSystem  StorageSystem?
  wallboxSystem  WallboxSystem?
  heatPumpSystem HeatPumpSystem?
}

enum Technology { PV STORAGE WALLBOX HEAT_PUMP }

enum ProjectStatus {
  LEAD
  STUDY
  PROPOSAL
  SIGNED
  PROCUREMENT
  SCHEDULED
  IN_PROGRESS
  COMMISSIONED
  CLOSED
  CANCELLED
}

model Site {
  id             String   @id @default(cuid())
  organizationId String
  address        String
  postalCode     String
  city           String
  province       String
  country        String   @default("ES")
  cadastralRef   String?  // referencia catastral
  latitude       Float?
  longitude      Float?
  cadastralData  Json?    // dump del Catastro OVC
  cups           String?  // código universal punto de suministro
  cau            String?  // código autoconsumo (rellenado en tramitación)
  distributor    String?  // e-distribución | i-DE | UFD | viesgo | edp | ...
  retailer       String?  // comercializadora
}

model PVSystem {
  id              String   @id @default(cuid())
  projectId       String   @unique
  modality        AutoconsumptionModality   // SIN_EXCEDENTES | CON_EXCEDENTES_COMPENSACION | CON_EXCEDENTES_NO_COMPENSACION
  connectionType  ConnectionType            // BT | AT
  installedKwp    Float?
  inverterKw      Float?
  expectedKwhYear Float?  // de PVGIS
  selfUseRatio    Float?  // % autoconsumo estimado
  // Diseño avanzado
  roofAreas       RoofArea[]
  stringDesigns   StringDesign[]
}

enum AutoconsumptionModality {
  SIN_EXCEDENTES
  CON_EXCEDENTES_COMPENSACION
  CON_EXCEDENTES_NO_COMPENSACION
}

enum ConnectionType { BT AT }

model RoofArea {
  id           String  @id @default(cuid())
  pvSystemId   String
  name         String
  geometry     Json    // GeoJSON polygon (en coordenadas de mapa)
  tilt         Float
  azimuth      Float
  orientation  String? // S, SE, SW, ...
  surfaceM2    Float
  modulesCount Int     @default(0)
  restrictions Json?   // zonas restringidas (chimeneas, ventanas, sombras fijas)
}

model StringDesign {
  id            String  @id @default(cuid())
  pvSystemId    String
  inverterId    String  // FK a Component
  mpptIndex     Int
  modulesIds    String[] // FK a ModulePlacement
  voltageCheck  Json?    // resultado de validación Vmin/Vmax/Imax
}

model StorageSystem {
  id          String  @id @default(cuid())
  projectId   String  @unique
  capacityKwh Float?
  brand       String?
  model       String?
  // ...
}

model WallboxSystem {
  id          String  @id @default(cuid())
  projectId   String  @unique
  powerKw     Float?
  smartCharge Boolean @default(false)
  // ...
}

model HeatPumpSystem {
  id              String  @id @default(cuid())
  projectId       String  @unique
  thermalLoadKw   Float?
  cop             Float?
  hydraulicScheme Json?
  // ...
}
```

### 6.4 Catálogo de componentes

```prisma
model Manufacturer {
  id   String @id @default(cuid())
  name String @unique
  logo String?
}

model Component {
  id             String  @id @default(cuid())
  manufacturerId String
  type           ComponentType
  model          String
  specs          Json    // según tipo: para panel kWp, Voc, Isc; para inverter potencias, MPPT, etc.
  datasheet      String? // URL R2
  active         Boolean @default(true)
  @@unique([manufacturerId, model])
}

enum ComponentType {
  PV_MODULE
  INVERTER
  BATTERY
  WALLBOX
  HEAT_PUMP
  MOUNTING
  OTHER
}

model OrgComponentPrice {
  id             String   @id @default(cuid())
  organizationId String
  componentId    String
  cost           Decimal  // coste de compra
  pricePublic    Decimal? // PVP referencia
  marginPercent  Decimal?
  validFrom      DateTime
  validTo        DateTime?
  supplierName   String?
}
```

### 6.5 Propuestas

```prisma
model Proposal {
  id             String   @id @default(cuid())
  organizationId String
  projectId      String
  version        Int      @default(1)
  status         ProposalStatus  // DRAFT, SENT, VIEWED, SIGNED, REJECTED, EXPIRED
  publicToken    String   @unique  // para link compartible
  validUntil     DateTime?
  variants       ProposalVariant[]
  signedAt       DateTime?
  signatureProvider String?  // signaturit
  signatureRef   String?
}

enum ProposalStatus { DRAFT SENT VIEWED SIGNED REJECTED EXPIRED }

model ProposalVariant {
  id           String  @id @default(cuid())
  proposalId   String
  name         String  // "Básica", "Con batería", "Premium"
  isDefault    Boolean @default(false)
  lineItems    ProposalLineItem[]
  economics    Json    // VAN, TIR, payback, ahorro 25 años
  energyCalc   Json    // producción esperada, autoconsumo
  totalNet     Decimal
  totalVat     Decimal
  totalGross   Decimal
}

model ProposalLineItem {
  id          String  @id @default(cuid())
  variantId   String
  componentId String?
  description String
  quantity    Float
  unitPrice   Decimal
  vatRate     Decimal  @default(21)
  discount    Decimal  @default(0)
  total       Decimal
}
```

### 6.6 Tramitación legal

```prisma
model Procedure {
  id             String   @id @default(cuid())
  organizationId String
  projectId      String   @unique
  ccaa           String   // andalucia, madrid, ...
  steps          ProcedureStep[]
  startedAt      DateTime?
  completedAt    DateTime?
}

model ProcedureStep {
  id          String   @id @default(cuid())
  procedureId String
  type        StepType
  status      StepStatus
  expectedDays Int?     // SLA esperado
  startedAt   DateTime?
  completedAt DateTime?
  notes       String?
  documents   String[] // URLs R2
  externalRef String?  // nº expediente CCAA, RAC, etc.
}

enum StepType {
  CAU_REQUEST          // solicitud CAU a distribuidora
  ACCESS_CONNECTION    // acceso y conexión
  GUARANTEE_DEPOSIT    // aval (si con excedentes y > umbral)
  PROJECT_DRAFT        // proyecto/MTD redactado (externalizado)
  WORKS_EXECUTION      // ejecución
  CIE                  // certificado instalación eléctrica
  OCA_INSPECTION       // inspección OCA si aplica
  CCAA_REGISTRATION    // presentación autonómica (RITSIC)
  RAC_ASSIGNMENT       // RAC asignado
  RADNE_REGISTRATION   // RADNE
  RAIPEE_REGISTRATION  // si aplica
  COMPENSATION_SETUP   // activación compensación con comercializadora
  SUBSIDY_APPLICATION  // solicitud subvención
  SUBSIDY_GRANTED      // resolución
  SUBSIDY_PAID         // cobro
  CEE_PRE              // CEE previo
  CEE_POST             // CEE final
}

enum StepStatus {
  NOT_STARTED
  IN_PROGRESS
  WAITING_EXTERNAL
  BLOCKED
  COMPLETED
  NOT_APPLICABLE
}
```

### 6.7 Subvenciones

```prisma
model Subsidy {
  id           String  @id @default(cuid())
  name         String
  scope        String  // ESTATAL | AUTONOMICA | LOCAL
  region       String? // ccaa o ayuntamiento
  technologies Technology[]
  applicableTo Json    // criterios de elegibilidad
  amountFormula Json   // fórmula de cálculo
  openFrom     DateTime?
  openUntil    DateTime?
  source       String? // URL oficial
  active       Boolean @default(true)
}

model SubsidyApplication {
  id             String   @id @default(cuid())
  organizationId String
  projectId      String
  subsidyId      String
  status         StepStatus
  amountRequested Decimal?
  amountGranted   Decimal?
  amountPaid      Decimal?
  appliedAt       DateTime?
  resolvedAt      DateTime?
  documents       String[]
}
```

### 6.8 Certificación energética (CertiAlmería embebido)

```prisma
model EnergyCertificate {
  id              String   @id @default(cuid())
  organizationId  String
  projectId       String
  type            CertificateType   // PRE | POST
  status          CertificateStatus
  ratingLetter    String?           // A, B, C, D, E, F, G
  primaryEnergy   Float?            // kWh/m²·año
  emissions       Float?            // kgCO2/m²·año
  registrationNo  String?           // nº registro CCAA
  pdfUrl          String?
  certifiedById   String?           // técnico CertiAlmería que firma
  visitDate       DateTime?
  emittedDate     DateTime?
  registeredDate  DateTime?
}

enum CertificateType { PRE POST }
enum CertificateStatus { REQUESTED SCHEDULED VISITED EMITTED REGISTERED }
```

### 6.9 Operaciones / instalación

```prisma
model InstallationPlan {
  id           String   @id @default(cuid())
  projectId    String   @unique
  scheduledStart DateTime?
  scheduledEnd   DateTime?
  estimatedDays  Int?
  crewId         String?
  status         InstallStatus
}

enum InstallStatus { PLANNED IN_PROGRESS COMMISSIONED HANDED_OVER }

model Crew {
  id             String  @id @default(cuid())
  organizationId String
  name           String
  members        String[] // userIds
  skills         String[]
}

model WorkOrder {
  id           String   @id @default(cuid())
  projectId    String
  scheduledFor DateTime
  type         WorkOrderType
  status       WorkOrderStatus
  assigneeId   String
  checklist    Json?
  notes        String?
  signature    Json?
  photos       Photo[]
}

enum WorkOrderType { SITE_VISIT INSTALL COMMISSIONING MAINTENANCE INCIDENT }
enum WorkOrderStatus { PLANNED IN_PROGRESS COMPLETED CANCELLED }

model Photo {
  id          String   @id @default(cuid())
  workOrderId String?
  projectId   String?
  url         String
  thumbnail   String?
  takenAt     DateTime
  geo         Json?
  milestone   String?  // CUBIERTA, ANCLAJES, MODULOS, INVERSOR, CUADRO
  uploadedById String
}

model SerialTracking {
  id          String  @id @default(cuid())
  projectId   String
  componentId String
  serialNo    String
  installedAt DateTime?
  warrantyEnd DateTime?
}
```

### 6.10 Económico operativo

```prisma
model BillingMilestone {
  id          String   @id @default(cuid())
  projectId   String
  order       Int
  name        String   // "Señal", "Acopio", "PEM", "Activación"
  percent     Decimal
  amount      Decimal
  triggerEvent String? // PROJECT_SIGNED, MATERIAL_DELIVERED, INSTALL_DONE, COMMISSIONED
  status      MilestoneStatus
  dueDate     DateTime?
  invoiceId   String?  // ref a factura en Holded (mirror)
  invoicedAt  DateTime?
  paidAt      DateTime?
}

enum MilestoneStatus { PENDING READY INVOICED PAID OVERDUE }

model Invoice {
  // Mirror local de facturas en Holded. Read-mostly.
  id              String   @id @default(cuid())
  organizationId  String
  holdedId        String   @unique
  projectId       String?
  number          String
  status          InvoiceStatus
  total           Decimal
  paid            Decimal  @default(0)
  issuedAt        DateTime
  dueAt           DateTime?
  syncedAt        DateTime
}

enum InvoiceStatus { DRAFT ISSUED PAID OVERDUE CANCELLED }

model Cost {
  id           String   @id @default(cuid())
  organizationId String
  projectId    String
  category     CostCategory
  description  String
  amount       Decimal
  date         DateTime
  supplier     String?
  invoiceRef   String?  // factura proveedor en Holded
}

enum CostCategory { LABOR MATERIAL SUBCONTRACTOR LOGISTICS PERMITS OTHER }

model Commission {
  id           String   @id @default(cuid())
  organizationId String
  projectId    String
  userId       String
  rule         Json     // % o tabla
  baseAmount   Decimal
  amount       Decimal
  status       CommissionStatus
  releasedAt   DateTime?
}

enum CommissionStatus { PROJECTED EARNED PAID }
```

### 6.11 Postventa y monitorización

```prisma
model InverterConnection {
  id              String   @id @default(cuid())
  organizationId  String
  projectId       String
  provider        String   // SOLAREDGE, HUAWEI, FRONIUS, ...
  externalId      String   // ID en sistema del fabricante
  credentials     Json     // cifrado
  lastSyncAt      DateTime?
  status          ConnectionStatus
}

enum ConnectionStatus { ACTIVE ERROR REVOKED }

model ProductionReading {
  id          String   @id @default(cuid())
  projectId   String
  date        DateTime
  energyKwh   Float
  expectedKwh Float?   // de PVGIS
  ratio       Float?
}

model Alert {
  id           String   @id @default(cuid())
  organizationId String
  projectId    String
  type         AlertType
  severity     AlertSeverity
  message      String
  detectedAt   DateTime
  resolvedAt   DateTime?
}

enum AlertType { LOW_PRODUCTION INVERTER_DOWN COMMS_LOST WARRANTY_EXPIRING MAINTENANCE_DUE }
enum AlertSeverity { INFO WARNING CRITICAL }

model Ticket {
  id           String   @id @default(cuid())
  organizationId String
  projectId    String
  alertId      String?
  type         TicketType
  status       TicketStatus
  priority     TicketPriority
  description  String
  createdById  String
  assignedToId String?
  dueDate      DateTime?
  resolvedAt   DateTime?
}

enum TicketType { INCIDENT MAINTENANCE WARRANTY_CLAIM CUSTOMER_REQUEST }
enum TicketStatus { OPEN IN_PROGRESS WAITING_PARTS RESOLVED CLOSED }
enum TicketPriority { LOW MEDIUM HIGH CRITICAL }

model MaintenanceSchedule {
  id           String   @id @default(cuid())
  projectId    String
  cadence      String   // ANNUAL, BIANNUAL, ...
  nextDueAt    DateTime
  lastDoneAt   DateTime?
  contractRef  String?
}

model Warranty {
  id         String   @id @default(cuid())
  projectId  String
  componentType ComponentType
  startDate  DateTime
  endDate    DateTime
  scope      String?
}
```

### 6.12 Portal cliente final

```prisma
model CustomerPortalAccess {
  id          String   @id @default(cuid())
  projectId   String
  email       String
  magicToken  String   @unique
  expiresAt   DateTime
  lastVisitAt DateTime?
}

model CustomerNotification {
  id          String   @id @default(cuid())
  projectId   String
  type        String
  title       String
  body        String
  sentAt      DateTime?
  readAt      DateTime?
}
```

### 6.13 Integraciones

```prisma
model IntegrationConfig {
  id             String   @id @default(cuid())
  organizationId String
  type           IntegrationType
  credentials    Json     // cifrado
  config         Json
  active         Boolean  @default(true)
  @@unique([organizationId, type])
}

enum IntegrationType {
  HOLDED
  GOOGLE_WORKSPACE
  MICROSOFT_365
  SIGNATURIT
  SOLAREDGE
  HUAWEI
  STRIPE
  REDSYS
}

model WebhookEvent {
  id          String   @id @default(cuid())
  source      String
  type        String
  payload     Json
  processedAt DateTime?
  error       String?
  receivedAt  DateTime @default(now())
}
```

---

## 7. Roles y permisos

### 7.1 Matriz base

| Rol | Captación | CRM | Proyecto | Diseño | Propuesta | Tramitación | Operaciones | Económico | Postventa | Settings |
|---|---|---|---|---|---|---|---|---|---|---|
| OWNER | RW | RW | RW | RW | RW | RW | RW | RW | RW | RW |
| ADMIN | RW | RW | RW | RW | RW | RW | RW | RW | RW | RW |
| MARKETING | RW | R (suyos) | R | — | — | — | — | — | — | — |
| COMMERCIAL | RW (suyos) | RW (suyos) | RW (suyos) | R | RW (suyos) | R | R | R (suyos) | R | — |
| TECHNICIAN | R | R | RW (asignados) | RW | R | RW | RW | R | RW | — |
| INSTALLER (free) | — | — | R (asignados) | — | — | — | RW (suyos) | — | — | — |
| CUSTOMER (portal) | — | — | R (suyo) | — | R (suya) | R (suya) | R (suya) | R (suya) | R (suya) | — |

R = lectura · RW = lectura/escritura · "suyos" = solo entidades donde es owner

### 7.2 Reglas adicionales

- Un usuario puede tener distintos roles en distintas organizaciones (Membership múltiple).
- INSTALLER es gratuito (no consume cupo de licencia). Esto crea anti-churn por adopción de campo.
- CUSTOMER es gratuito y vive en `(portal)` route group, no en `(app)`.
- Los 7 roles de SolarOS (OWNER, ADMIN, MARKETING, COMMERCIAL, TECHNICIAN, INSTALLER, CUSTOMER) se almacenan en `Membership.role` local. Clerk solo gestiona los roles estructurales nativos (admin/basic_member) para permitir o no invitar/gestionar la organización. La autorización fina la decide SolarOS leyendo `Membership.role`.

---

## 8. Módulos y tareas

### 8.1 Cómo leer esta sección

- **MX.Y** = identificador del módulo
- **TX.Y.Z** = identificador de tarea
- Cada tarea es atómica, ejecutable por Claude Code en una sesión
- Las dependencias se declaran como `→ requiere TX.Y.Z`
- DoD = Definition of Done
- Estimación en días-persona aproximada

---

### Fase 0 — Foundation (semanas 1-3)

#### M0.1 — Setup base del monorepo

- **T0.1.1** Inicializar monorepo con pnpm + Turborepo. Estructura `apps/web` y `packages/database` mínimos. *DoD: `pnpm install` corre sin errores; `pnpm dev` levanta web vacía.* `[1d]`
- **T0.1.2** Configurar TypeScript con paths compartidos, ESLint, Prettier. *DoD: `pnpm lint` y `pnpm typecheck` pasan limpios.* `[0.5d]`
- **T0.1.3** Configurar Tailwind + shadcn/ui en `packages/ui` con componentes base (Button, Input, Card, Dialog, Form). *DoD: import de componentes desde web funciona.* `[1d]`
- **T0.1.4** Configurar Vitest + Playwright. Tests vacíos funcionando en CI. `[0.5d]`
- **T0.1.5** Configurar Sentry y PostHog en cliente y servidor. `[0.5d]`

#### M0.2 — Base de datos y Prisma

- **T0.2.1** Crear proyecto Supabase. Configurar conexión desde Prisma (DIRECT_URL + DATABASE_URL para pooler). `[0.5d]` → requiere T0.1.1
- **T0.2.2** Schema Prisma inicial: `Organization`, `User`, `Membership` según sección 6.1. Migración inicial. *DoD: `pnpm prisma migrate dev` corre limpio.* `[1d]`
- **T0.2.3** Activar RLS en Supabase para tablas multi-tenant. Policies básicas. `[1d]`
- **T0.2.4** Helper `getTenantPrisma(orgId)` que envuelve PrismaClient con scope automático. Tests de aislamiento. *DoD: test que demuestra que org A no ve datos de org B.* `[1d]`

#### M0.3 — Autenticación y multi-tenancy (Clerk)

> Decisión arquitectónica registrada en `docs/ADR/0001-auth-clerk.md`.
> Clerk gestiona signup, sign-in, organizations, memberships e
> invitations. Las tablas locales User/Organization/Membership son
> mirror sincronizado vía webhooks.

- **T0.3.1** Crear aplicación en Clerk dashboard con feature
  Organizations activada. Instalar `@clerk/nextjs`. Configurar
  `<ClerkProvider>` en el root layout de `apps/web`. Variables de
  entorno: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`,
  `CLERK_WEBHOOK_SIGNING_SECRET`. *DoD: páginas `/sign-in` y
  `/sign-up` accesibles, signup crea usuario en Clerk.* `[1d]`
  → requiere T0.2.2

- **T0.3.2** Endpoint webhook en `apps/web/src/app/api/webhooks/clerk/route.ts`
  con verificación de firma (svix). Maneja eventos `user.created`,
  `user.updated`, `user.deleted`, `organization.created`,
  `organization.updated`, `organization.deleted`,
  `organizationMembership.created`, `organizationMembership.updated`,
  `organizationMembership.deleted`. Cada evento sincroniza el
  mirror local. *DoD: crear org en Clerk dashboard genera fila en
  tabla Organization local con clerkOrgId correcto.* `[1d]`

- **T0.3.3** En proxy.ts (Next.js 16 ya no usa middleware.ts) de
  `apps/web` configurar `clerkMiddleware()` con matcher que
  proteja todas las rutas excepto las públicas (`/`, `/sign-in`,
  `/sign-up`, `/api/webhooks/*`, `/api/public/*`,
  `(portal)/*`). *DoD: acceso a `(app)/*` sin sesión redirige a
  /sign-in.* `[0.5d]`

- **T0.3.4** Helper `requireSession()` en
  `apps/web/src/lib/auth/index.ts` que llama a `auth()` de Clerk,
  resuelve el `organizationId` activo (Clerk `orgId` mapeado al
  `Organization.id` local) y devuelve `{ userId, organizationId,
  membership }`. Lanza si no hay sesión u organización activa.
  *DoD: cualquier Server Action puede pedir
  `await requireSession()` y obtener el contexto tenant.* `[0.5d]`

- **T0.3.5** Componentes Clerk en el layout: `<UserButton />`
  (avatar + menú usuario) y `<OrganizationSwitcher />` (selector
  de organización para usuarios con varias). UI lista. *DoD:
  visible en topbar, switching entre orgs funciona y refresca
  scope.* `[0.5d]`

> Lo que NO hay que construir y antes sí estaba: signup que crea
> Organization + Membership manualmente, sistema de invitaciones
> con tokens, selector de organización custom. Todo eso lo cubre
> Clerk de fábrica.

(Total módulo: ~3.5 días)

#### M0.4 — Layout y navegación

- **T0.4.1** Layout `(app)` con sidebar + topbar + breadcrumbs. Mobile-responsive. `[1d]`
- **T0.4.2** Componente de navegación filtrado por permisos del rol activo. `[1d]`
- **T0.4.3** Página `/settings/organization` con datos básicos editables. `[1d]`
- **T0.4.4** Página `/settings/team` con lista de Memberships e invitaciones pendientes. `[1d]`
- **T0.4.5** Página `/settings/branding` con logo + colores (para portal white-label). `[1d]`

#### M0.5 — DevOps mínimo

- **T0.5.1** GitHub Actions: lint + typecheck + test en cada PR. `[0.5d]`
- **T0.5.2** Deploy a Vercel preview en cada PR. Producción manual. `[0.5d]`
- **T0.5.3** Variables de entorno documentadas en `.env.example`. `[0.5d]`

**Total Fase 0: ~14 días-persona**

---

### Fase 1 — Núcleo comercial (semanas 4-10)

#### M1.1 — Leads y CRM básico

- **T1.1.1** Schema Prisma: `Lead`, `Account`, `Activity`. Migración. `[0.5d]`
- **T1.1.2** Listado de leads con filtros (estado, comercial asignado, fuente, fecha). `[1d]`
- **T1.1.3** Vista detalle lead + edición + cualificación. `[1d]`
- **T1.1.4** Endpoint público `POST /api/public/leads` para captura desde web del cliente (con CORS y rate limiting). `[1d]`
- **T1.1.5** Asignación automática de lead a comercial por reglas (round-robin, código postal, otros). `[1d]`
- **T1.1.6** Conversión lead → Account + Project. `[1d]`
- **T1.1.7** Listado de actividades por proyecto/lead, registro manual + automático. `[1d]`

#### M1.2 — Proyecto multi-tecnología

- **T1.2.1** Schema Prisma: `Project`, `Site`, `PVSystem`, `StorageSystem`, `WallboxSystem` (HeatPump diferido). `[1d]`
- **T1.2.2** Crear proyecto desde lead convertido. Wizard de 3 pasos: cliente, sitio, tecnologías. `[2d]`
- **T1.2.3** Listado de proyectos con filtros + kanban por estado. `[1.5d]`
- **T1.2.4** Vista detalle proyecto: cabecera + tabs (Resumen, Sitio, Tecnologías, Propuestas, Tramitación, Operaciones, Económico, Postventa). `[2d]`
- **T1.2.5** Edición de subentidades por tecnología (formularios separados). `[2d]`

#### M1.3 — Sitio + Catastro

- **T1.3.1** Integración con Catastro OVC API. Servicio en `packages/integrations/catastro`. *DoD: dada una dirección o referencia catastral, devuelve geometría, superficie, año de construcción.* `[2d]`
- **T1.3.2** Componente Site Editor: input de dirección → geocoding → autorrelleno → fetch Catastro → preview en mapa. `[2d]`
- **T1.3.3** Detección automática de distribuidora por código postal (tabla manual inicial). `[1d]`

#### M1.4 — Motor solar básico (PVGIS + dimensionado simple)

- **T1.4.1** Servicio PVGIS en `packages/solar-engine/pvgis`. *DoD: dado lat/lng + tilt + azimuth + kWp, devuelve producción anual y mensual.* `[1.5d]`
- **T1.4.2** Calculadora simple: a partir de consumo kWh/año + factura → recomienda kWp. `[1d]`
- **T1.4.3** Cálculo de autoconsumo estimado (% que se usa vs vertido). Modelo básico. `[1.5d]`
- **T1.4.4** Cálculo financiero: VAN, TIR, payback, ahorro 25 años con escalado IPC. `[1.5d]`

#### M1.5 — Catálogo de componentes

- **T1.5.1** Schema: `Manufacturer`, `Component`, `OrgComponentPrice`. `[0.5d]`
- **T1.5.2** Importador CSV de catálogo (panel, inversor, batería, wallbox). Plantilla y validación. `[1.5d]`
- **T1.5.3** UI de catálogo con buscador + filtros por tipo y fabricante. `[1.5d]`
- **T1.5.4** UI de precios por organización (override del PVP base). `[1d]`
- **T1.5.5** Seed inicial: 200 paneles, 50 inversores, 20 baterías, 10 wallbox de fabricantes top (manual o scraping autorizado). `[2d]`

#### M1.6 — Configurador de propuesta básico

- **T1.6.1** Schema: `Proposal`, `ProposalVariant`, `ProposalLineItem`. `[0.5d]`
- **T1.6.2** Editor de propuesta: añadir variantes, añadir líneas con autocompletado desde catálogo, IVA, descuentos. `[2d]`
- **T1.6.3** Recalcular economics al cambiar líneas (VAN/TIR/payback en directo). `[1.5d]`
- **T1.6.4** Recalcular producción esperada al cambiar paneles/inversores. `[1d]`
- **T1.6.5** Estado de propuesta: DRAFT, SENT, VIEWED, SIGNED. Acciones para avanzar. `[1d]`

#### M1.7 — Generación PDF + envío

- **T1.7.1** Plantilla PDF con `@react-pdf/renderer`: portada con branding, descripción, kit, ahorro, financiación, condiciones. `[2.5d]`
- **T1.7.2** Customización por organización (logo, colores, copy). `[1d]`
- **T1.7.3** Envío de propuesta por email vía Resend con tracking de apertura. `[1d]`
- **T1.7.4** Link público de propuesta `(portal)/proposal/[token]` (sin auth). `[1.5d]`

#### M1.8 — Firma electrónica Signaturit

- **T1.8.1** Servicio Signaturit en `packages/integrations/signaturit`. `[1.5d]`
- **T1.8.2** Flujo de firma desde el link público: el cliente firma → callback de Signaturit → estado SIGNED. `[2d]`
- **T1.8.3** Almacenamiento del PDF firmado en R2 + auditoría. `[0.5d]`

#### M1.9 — Estados y kanban de proyecto

- **T1.9.1** Vista kanban global de proyectos con columnas por estado. Drag & drop. `[2d]`
- **T1.9.2** Reglas de transición de estado (no se puede pasar a SIGNED sin propuesta firmada, etc.). `[1d]`

#### M1.10 — Dashboard Home por rol

> Pulse operativo del producto desde el día uno. Sin métricas económicas (esas vienen en F4 con Holded). El objetivo es que al hacer login, cada rol vea inmediatamente lo que importa para su trabajo.

- **T1.10.1** Layout de página `/` (home) que carga el dashboard según rol activo del Membership. `[1d]`
- **T1.10.2** Componentes reutilizables base: `KPICard`, `ListWidget`, `EmptyState`, `MetricBadge`, `QuickActions`. `[1d]`
- **T1.10.3** Dashboard CEO/Admin (vista global, datos de toda la organización):
  - KPIs operativos: leads abiertos, proyectos activos por estado, propuestas pendientes de firma, instalaciones en curso
  - Lista: últimas 5 actividades del equipo
  - Lista: tramitaciones con SLA superado (cuando exista F5; placeholder hasta entonces)
  - Quick actions: crear lead, crear proyecto, ver pipeline
  - `[1.5d]`
- **T1.10.4** Dashboard Comercial (vista personal, scoped a sus leads/proyectos):
  - KPIs: mis leads abiertos, mis propuestas en cada estado, mi pipeline ponderado
  - Lista: próximas acciones pendientes (Activity con dueDate < 7d)
  - Lista: propuestas enviadas no firmadas hace > 7 días
  - Quick actions: nuevo lead, nueva propuesta
  - `[1.5d]`
- **T1.10.5** Dashboard Técnico/PM (proyectos asignados):
  - KPIs: proyectos asignados, tramitaciones bloqueadas, instalaciones esta semana
  - Lista: proyectos por fase
  - Lista: documentación pendiente de subir
  - Quick actions: ver kanban, registrar parte
  - `[1d]`
- **T1.10.6** Tests de scoping: cada rol solo ve datos que le corresponden por permisos. `[0.5d]`

> Nota: dashboard del rol INSTALLER va en la app móvil (Fase 3, M3.4).
> Nota: dashboard del rol CUSTOMER va en el portal cliente (Fase 5, M5.6).

**Total Fase 1: ~56 días-persona**

---

### Fase 2 — Diseño en cubierta (semanas 11-18)

#### M2.1 — Mapas y aerial

- **T2.1.1** Componente `RoofPlanner` base con MapLibre GL. `[1.5d]`
- **T2.1.2** Capa PNOA del IGN (WMS). Selector de proveedor (PNOA, Mapbox satélite). `[1d]`
- **T2.1.3** Centrado automático en Site con fetch de Catastro overlay. `[1d]`

#### M2.2 — Editor Konva sobre mapa

- **T2.2.1** Capa Konva sincronizada con coordenadas del mapa (proyección). `[2d]`
- **T2.2.2** Herramienta dibujo polígono cubierta (RoofArea). `[1.5d]`
- **T2.2.3** Herramienta dibujo zonas restringidas (chimeneas, lucernarios). `[1d]`
- **T2.2.4** Edición de tilt + azimuth por área (con visualización). `[1d]`
- **T2.2.5** Cálculo de superficie útil. `[1d]`

#### M2.3 — Ocupación de paneles

- **T2.3.1** Selección de modelo de panel desde catálogo. `[0.5d]`
- **T2.3.2** Algoritmo de ocupación automática: dado el polígono de cubierta menos restricciones, distribuye paneles. `[3d]`
- **T2.3.3** Edición manual: añadir/quitar paneles individuales. `[1.5d]`
- **T2.3.4** Sumario en vivo: nº paneles, kWp instalado, superficie ocupada. `[0.5d]`

#### M2.4 — Sombras

- **T2.4.1** Cálculo de horizonte solar por área (suncalc). `[1.5d]`
- **T2.4.2** Sombras de obstáculos cercanos (geometrías introducidas manualmente). `[2d]`
- **T2.4.3** Factor de pérdida por sombra mensualizado, integrado al cálculo PVGIS. `[1.5d]`

#### M2.5 — String design

- **T2.5.1** Selección de inversor desde catálogo, con specs (rango Vmpp, Voc max, Imax). `[0.5d]`
- **T2.5.2** Asignación de paneles a strings/MPPT con validación de Vmin/Vmax/Imax (a -10°C y +70°C). `[3d]`
- **T2.5.3** Auto-string: propuesta automática óptima dado paneles + inversor. `[2d]`
- **T2.5.4** UI de validación: rojo/verde por string, mensajes de error claros. `[1d]`

#### M2.6 — Single Line Diagram

- **T2.6.1** Componente con React Flow que renderiza esquema unifilar a partir del diseño (paneles → strings → inversor → cuadro → red). `[3d]`
- **T2.6.2** Render PDF del SLD para incluir en propuesta y MTD. `[1.5d]`

#### M2.7 — Recálculo y persistencia

- **T2.7.1** Persistir el diseño en `RoofArea`, `ModulePlacement` (subentidad nueva), `StringDesign`. `[1d]`
- **T2.7.2** Re-cálculo automático de propuesta al cambiar el diseño. `[1d]`

**Total Fase 2: ~28 días-persona**

---

### Fase 3 — App móvil (semanas 19-24)

#### M3.1 — Setup Expo

- **T3.1.1** Inicializar `apps/mobile` con Expo SDK 53. `[1d]`
- **T3.1.2** Configurar EAS Build y EAS Update. `[1d]`
- **T3.1.3** Compartir `packages/types` entre web y mobile. `[0.5d]`

#### M3.2 — Auth móvil

- **T3.2.1** Login con Clerk en mobile usando @clerk/clerk-expo. Manejo de sesión vía SecureStore de Expo. Las organizations y memberships del usuario se obtienen del mismo backend Clerk que web; no hay backend de auth separado. `[1.5d]`
- **T3.2.2** Selector de organización en móvil. `[0.5d]`

#### M3.3 — Sync offline (PowerSync)

- **T3.3.1** Configurar PowerSync sobre Supabase. Reglas de sync por organización + por usuario. `[2d]`
- **T3.3.2** Schema local con WatermelonDB. Modelos sincronizados: `Project`, `WorkOrder`, `Photo`, `Activity`. `[2d]`
- **T3.3.3** Resolución de conflictos (last-write-wins por ahora). `[1d]`

#### M3.4 — Pantallas core

- **T3.4.1** Lista de proyectos asignados a mí con búsqueda. `[1d]`
- **T3.4.2** Detalle de proyecto en móvil (vista simplificada). `[1.5d]`
- **T3.4.3** Lista de partes de trabajo del día / semana. `[1d]`
- **T3.4.4** Formulario de parte de trabajo con checklist. `[1.5d]`
- **T3.4.5** Captura de foto con metadata (geo, hito, timestamp). Upload a R2 cuando hay red. `[2d]`
- **T3.4.6** Firma del cliente en móvil. `[1d]`

#### M3.5 — Push notifications

- **T3.5.1** Registro de token Expo + envío desde server (Inngest job). `[1d]`
- **T3.5.2** Notificaciones por: parte asignado, propuesta firmada, alerta crítica. `[1d]`

**Total Fase 3: ~17 días-persona**

---

### Fase 4 — Integraciones económicas (semanas 25-30)

#### M4.1 — Conector Holded

- **T4.1.1** Servicio Holded en `packages/integrations/holded`. Auth + clientes + facturas + cobros. `[2d]`
- **T4.1.2** Settings: vincular organización a cuenta Holded (API key + test). `[1d]`
- **T4.1.3** Push: crear/actualizar contacto en Holded al firmar contrato. `[1d]`
- **T4.1.4** Push: crear borrador de factura al alcanzar hito. `[1.5d]`
- **T4.1.5** Pull (cron Inngest cada 15 min): leer facturas y pagos, actualizar estado de hitos. `[2d]`
- **T4.1.6** Vista de auditoría de sync (qué se ha enviado, qué errores). `[1d]`

#### M4.2 — Hitos de cobro

- **T4.2.1** Schema `BillingMilestone` + `Invoice` (mirror). `[0.5d]`
- **T4.2.2** Plantillas configurables de hitos por organización (señal/acopio/PEM/activación). `[1d]`
- **T4.2.3** Generación automática de hitos al firmar proyecto. `[0.5d]`
- **T4.2.4** Disparadores: hito READY cuando ocurre evento (firma, recepción material, etc.). `[1d]`

#### M4.3 — Costes y márgenes

- **T4.3.1** Schema `Cost`. Imputación a expediente. `[0.5d]`
- **T4.3.2** Recepción automática de costes desde facturas de proveedor en Holded. `[1.5d]`
- **T4.3.3** Vista de margen real por proyecto (presupuestado vs real). `[1d]`

#### M4.4 — Comisiones

- **T4.4.1** Reglas de comisión configurables (% sobre venta, escalado, tabla). `[1.5d]`
- **T4.4.2** Cálculo automático al cobrar. Liberación de comisiones por hito. `[1d]`
- **T4.4.3** Liquidación mensual con export. `[1d]`

#### M4.5 — Dashboards económicos (extensión de M1.10)

> Los dashboards base por rol ya existen desde F1 (M1.10). Aquí añadimos los widgets económicos que dependen de Holded estar conectado.

- **T4.5.1** Extender dashboard CEO con widgets económicos: facturación del mes, cobros pendientes, margen agregado, top 5 morosos, cash flow proyectado 60-90 días. `[2d]`
- **T4.5.2** Extender dashboard Comercial con widgets de comisiones: comisiones devengadas, cobradas, proyectadas. `[1.5d]`
- **T4.5.3** Aging de cobros con alertas (>30, >60, >90 días). `[1d]`

#### M4.6 — Calendarios

- **T4.6.1** Integración Google Calendar (OAuth + sync bidireccional de citas). `[2d]`
- **T4.6.2** Integración Microsoft Graph (Outlook). `[2d]`

#### M4.7 — Email transaccional + entrante

- **T4.7.1** Templates Resend para: invitación equipo, propuesta enviada, factura disponible, alerta. `[1.5d]`
- **T4.7.2** Postmark Inbound: buzón único `[email protected]` que adjunta a actividad del proyecto. `[2d]`

#### M4.8 — Pagos online

- **T4.8.1** Integración Stripe para suscripciones del propio SaaS (pago de la instaladora a SolarOS). `[2d]`
- **T4.8.2** Integración Redsys + Stripe para que el cliente final pague hito desde el portal. `[2d]`

**Total Fase 4: ~28 días-persona**

---

### Fase 5 — Compliance, postventa y diferenciación (semanas 31-36)

#### M5.1 — Tramitación legal

- **T5.1.1** Schema `Procedure`, `ProcedureStep`. `[0.5d]`
- **T5.1.2** Plantillas de procedimiento por CCAA (con SLA por paso). Inicialmente Andalucía completa. `[1.5d]`
- **T5.1.3** UI kanban de tramitación por proyecto. `[1.5d]`
- **T5.1.4** Vista global de tramitaciones de la organización con SLA en rojo. `[1d]`
- **T5.1.5** Repositorio de documentos por step (upload R2). `[1d]`
- **T5.1.6** Alertas automáticas: step en BLOCKED >7d, SLA superado. `[1d]`

#### M5.2 — Subvenciones

- **T5.2.1** Schema `Subsidy`, `SubsidyApplication`. `[0.5d]`
- **T5.2.2** Seed inicial: subvenciones activas IDAE + Andalucía. `[1.5d]`
- **T5.2.3** Calculador de elegibilidad por proyecto. `[1.5d]`
- **T5.2.4** Tracker de aplicación: solicitada → resuelta → cobrada. `[1d]`
- **T5.2.5** Generador de carpeta de justificación (zip con CIE + RAC + facturas + CEE final + declaraciones). `[2d]`

#### M5.3 — CertiAlmería embebido

- **T5.3.1** Definir API entre SolarOS y backend CertiAlmería (interna). `[1d]`
- **T5.3.2** Botón "solicitar CEE previo" desde proyecto → crea expediente en CertiAlmería con datos del Site. `[1.5d]`
- **T5.3.3** Webhook entrante con resultado del CEE (letra, demanda, PDF). Almacenar en `EnergyCertificate`. `[1d]`
- **T5.3.4** Botón "solicitar CEE final" tras COMMISSIONED. `[0.5d]`
- **T5.3.5** Componente "comparativa antes/después" (E → B). Reutilizable en propuesta y portal. `[1.5d]`
- **T5.3.6** Facturación interna SolarOS ↔ CertiAlmería (registro de coste). `[1d]`

#### M5.4 — Conector inversor SolarEdge

- **T5.4.1** Servicio SolarEdge en `packages/integrations/solaredge`. `[2d]`
- **T5.4.2** Settings: vincular instalación a sitio SolarEdge (site ID + API key). `[1d]`
- **T5.4.3** Cron Inngest cada 30 min: pull de producción diaria. Almacenar en `ProductionReading`. `[1.5d]`
- **T5.4.4** Comparativa producción real vs PVGIS esperada. Generar `Alert` si <90%. `[1.5d]`
- **T5.4.5** UI de monitorización por proyecto: gráfica producción + alertas activas. `[1.5d]`

#### M5.5 — Postventa

- **T5.5.1** Schema `Ticket`, `MaintenanceSchedule`, `Warranty`. `[0.5d]`
- **T5.5.2** Apertura de ticket desde alerta o desde portal cliente. `[1d]`
- **T5.5.3** Workflow de ticket (asignación, estado, resolución). `[1d]`
- **T5.5.4** Programación de mantenimientos por contrato. Generación automática de WorkOrder en su momento. `[1.5d]`
- **T5.5.5** Tracker de garantías con alertas pre-vencimiento. `[1d]`

#### M5.6 — Portal cliente final

- **T5.6.1** Layout `(portal)` white-label con branding de la organización. `[1.5d]`
- **T5.6.2** Acceso por magic link sin password. `[1d]`
- **T5.6.3** Estado del proyecto step-by-step (visualización del Procedure). `[1.5d]`
- **T5.6.4** Comparativa CEE antes/después + ahorro acumulado + producción real. `[1.5d]`
- **T5.6.5** Descargas: contrato, facturas, CIE, CEE, garantías. `[1d]`
- **T5.6.6** Botón "abrir incidencia" → ticket. `[0.5d]`
- **T5.6.7** Refer-a-friend con tracking de comisión. `[1.5d]`

**Total Fase 5: ~30 días-persona**

---

### Resumen de fases

| Fase | Semanas | Días-persona | Hitos clave |
|---|---|---|---|
| F0 Foundation | 1-3 | 13 | Multi-tenant + auth funcionando |
| F1 Núcleo comercial | 4-10 | 56 | Lead → propuesta firmada con PDF + dashboards por rol |
| F2 Diseño en cubierta | 11-18 | 28 | Konva + sombras + strings + SLD |
| F3 App móvil | 19-24 | 17 | Partes en obra offline + push |
| F4 Económico | 25-30 | 28 | Holded + dashboards económicos + comisiones |
| F5 Compliance + diferenciación | 31-36 | 30 | Tramitación + CEE + portal cliente + monitorización |
| **Total** | **36** | **~172** | **MVP completo vendible** |

Estimación a 1 founder × 5 días/semana × 8h/día = ~172 días reales = 35 semanas. Con margen para imprevistos: **8-9 meses**.

---

## 9. Convenciones de código

### 9.1 Nombrado

- Carpetas: `kebab-case`
- Componentes React: `PascalCase`
- Funciones, variables: `camelCase`
- Constantes globales: `UPPER_SNAKE_CASE`
- Tipos e interfaces TS: `PascalCase`
- Enums Prisma: `UPPER_SNAKE_CASE`

### 9.2 Estructura de un Server Action

```ts
// modules/projects/actions.ts
"use server"

import { z } from "zod"
import { requireSession } from "@/lib/auth"
import { getTenantPrisma } from "@/lib/tenant"

const CreateProjectSchema = z.object({
  name: z.string().min(3),
  // ...
})

export async function createProject(input: unknown) {
  const session = await requireSession()
  const data = CreateProjectSchema.parse(input)
  const db = getTenantPrisma(session.organizationId)
  return db.project.create({ data: { ...data, organizationId: session.organizationId } })
}
```

### 9.3 Estructura de una integración externa

Cada integración vive en `packages/integrations/<provider>` con:

```
holded/
├── client.ts          # Wrapper HTTP con auth + retry
├── types.ts           # Tipos del provider
├── schemas.ts         # Zod schemas para validar respuestas
├── services/          # Funciones de alto nivel (createInvoice, getPayments, ...)
├── webhooks/          # Procesadores de eventos entrantes
└── index.ts           # API pública del paquete
```

### 9.4 Errores

- Errores conocidos: clase `AppError` con `code`, `message`, `httpStatus`.
- En Server Actions: nunca lanzar excepciones genéricas. Devolver `Result<T, AppError>` o lanzar `AppError`.
- Logs: Pino estructurado con `organizationId`, `userId`, `action`, `entityId`.

### 9.5 Validación

- Zod en todo borde de entrada: forms, server actions, webhooks, env vars.
- `z.coerce` con cuidado, preferir transformación explícita.
- Schemas reutilizables en `packages/validators` cuando aplica.

### 9.6 Tests

- Lógica solar: cobertura objetivo 80%+
- Integraciones: tests con MSW para mocking HTTP
- E2E: flujos críticos (login, crear proyecto, firmar propuesta, generar parte)
- Multi-tenant: tests de aislamiento obligatorios al introducir nueva entidad

### 9.7 Migrations

- Una migration por PR, descriptiva (`add-procedure-tables`, no `update-schema`)
- Nunca borrar columnas en la misma migration que las renombra (estrategia expand-contract)

### 9.8 Git

- Trunk-based con branches cortos (`feat/`, `fix/`, `chore/`)
- Conventional Commits
- Squash on merge

---

## 10. Glosario español-fotovoltaico

> Crítico para que Claude Code maneje correctamente la terminología sin traducir.

### 10.1 Trámites e identificadores

- **CAU** — Código de Autoconsumo. Identificador único de instalación de autoconsumo (26 dígitos). Asignado por la distribuidora. Compuesto por CUPS + sufijo.
- **CUPS** — Código Universal del Punto de Suministro (20 o 22 dígitos).
- **CIE** — Certificado de Instalación Eléctrica. Modelo C0004. Emitido por empresa instaladora habilitada (categoría IBTE).
- **MTD** — Memoria Técnica de Diseño. Necesaria para instalaciones ≤ 10 kW BT. Sigue ITC-BT-04 del REBT.
- **REBT** — Reglamento Electrotécnico de Baja Tensión.
- **ITC-BT-04** — Instrucción técnica complementaria sobre documentación y puesta en servicio.
- **RAC** — Registro Autonómico de Autoconsumo (nº de inscripción autonómico).
- **RADNE** — Registro administrativo de autoconsumo de energía eléctrica del MITECO.
- **RAIPEE** — Registro Administrativo de Instalaciones de Producción de Energía Eléctrica.
- **RITSIC** — Registro Integrado Industrial (depende de CCAA).

### 10.2 Normativa

- **RD 244/2019** — Real Decreto que regula condiciones administrativas, técnicas y económicas del autoconsumo.
- **RD 1183/2020** — Acceso y conexión a las redes de transporte y distribución.
- **RD 1627/97** — Disposiciones mínimas de seguridad y salud en obras de construcción.

### 10.3 Modalidades de autoconsumo

- **Sin excedentes** — La instalación no vierte energía a la red (mecanismo antivertido).
- **Con excedentes acogida a compensación** — Vierte y se compensa en factura mensual.
- **Con excedentes no acogida a compensación** — Vierte y vende en mercado.

### 10.4 Conexión

- **BT** — Baja Tensión (≤ 1 kV).
- **AT** — Alta Tensión (> 1 kV).
- **PUES** — Puesta en Servicio.

### 10.5 Distribuidoras principales

- **e-distribución** — Endesa (~40% mercado nacional).
- **i-DE** — Iberdrola.
- **UFD** — Unión Fenosa Distribución (Naturgy).
- **Viesgo** — Norte de España.
- **EDP** — Asturias y otras zonas.

### 10.6 Organismos

- **IDAE** — Instituto para la Diversificación y Ahorro de la Energía.
- **MITECO** — Ministerio para la Transición Ecológica y Reto Demográfico.
- **CNMC** — Comisión Nacional de los Mercados y la Competencia.
- **AEAT** — Agencia Estatal de Administración Tributaria.

### 10.7 Económico

- **PEM** — Presupuesto de Ejecución Material.
- **VAN** — Valor Actual Neto.
- **TIR** — Tasa Interna de Retorno.
- **Payback** — Periodo de retorno.
- **Verifactu** — Sistema de facturación electrónica obligatorio en España (RD 1007/2023).
- **TicketBAI** — Equivalente del País Vasco.

### 10.8 Eficiencia energética

- **CEE** — Certificado de Eficiencia Energética.
- **CE3X** — Programa oficial para emisión de CEE en edificios existentes.

### 10.9 Otros

- **PVGIS** — Photovoltaic Geographical Information System (JRC EU). Fuente de irradiancia.
- **OCA** — Organismo de Control Autorizado. Inspecciones reglamentarias.
- **kWp** — Kilovatio pico (potencia nominal en condiciones estándar).
- **kWn** — Kilovatio nominal (potencia del inversor).

---

## 11. Sprint 0 — Bootstrap

Las primeras 5 tareas a ejecutar, en orden estricto, antes de cualquier otra cosa:

### Día 1
1. **Decidir nombre del producto y registrar dominio.** Sin esto no se puede empezar marketing ni branding.
2. **Crear repositorio Git privado** (GitHub recomendado) con .gitignore y README mínimo.
3. **Inicializar monorepo (T0.1.1).**

### Día 2
4. **Crear cuentas de servicios:** Vercel, Supabase, Cloudflare R2, Resend, Sentry, PostHog, **Clerk** (con feature Organizations activada), Signaturit (sandbox).
5. **Configurar `.env.local` con todas las claves** y documentar en `.env.example`.

### Día 3-5
6. **Ejecutar T0.1.2 a T0.1.5** (lint, ui base, testing, observabilidad).

### Día 6-10
7. **Ejecutar M0.2 completo** (Prisma + Supabase + RLS).

### Día 11-15
8. **Ejecutar M0.3 + M0.4** (auth + multi-tenant + layout).

A partir de aquí, **antes de empezar Fase 1**, se hace la **reunión con la empresa piloto** (90 min) para validar:
- Que los pain points imaginados coinciden con los reales.
- Qué módulo es el más doloroso para ellos (puede que no sea el orden propuesto).
- Compromiso del CEO con el piloto firmado.

---

## 12. Definition of Done

Una tarea/módulo está hecho cuando:

1. ✅ El código está mergeado a `main` sin warnings.
2. ✅ `pnpm lint` y `pnpm typecheck` pasan limpios.
3. ✅ Tests escritos para lógica de negocio nueva.
4. ✅ Migrations aplicadas en dev y staging.
5. ✅ Variables de entorno nuevas documentadas en `.env.example`.
6. ✅ Si es UI: probada en desktop + tablet + móvil (responsive).
7. ✅ Si es integración externa: probada contra sandbox real, con manejo de errores.
8. ✅ Si afecta a multi-tenant: test de aislamiento añadido.
9. ✅ ADR (Architecture Decision Record) si la tarea introduce decisión no trivial.
10. ✅ Anotación en CHANGELOG si afecta usuario final.

---

## 13. Anti-objetivos

Cosas que NO se construyen, aunque parezcan tentadoras:

- ❌ Generador de MTD/proyecto
- ❌ Facturación nativa (Verifactu)
- ❌ Plan general contable, asientos, modelos AEAT
- ❌ ERP completo
- ❌ Nóminas, RRHH
- ❌ Gestor de stock multi-almacén complejo (almacén básico por obra sí; sistema WMS no)
- ❌ Multimoneda (mercado España, EUR únicamente)
- ❌ Apps nativas separadas para cada rol (una sola app móvil)
- ❌ CMS para web pública del cliente final (la organización usa su propia web)

---

## 14. Subagentes Claude Code

### 14.1 Filosofía de uso

Claude Code soporta subagentes especializados que corren en su propio context window. SolarOS incluye 4 subagentes en `.claude/agents/` cuyo objetivo es estandarizar tareas repetitivas y proteger el contexto del agente principal de tareas verbosas.

**Reglas de uso:**

- Usar **solo cuando aporten** — un subagente innecesario es deuda. Si una tarea es única, hacerla en el agente principal.
- **No crear nuevos** sin que aparezca un dolor real (regla del 3: si la misma instrucción se repite 3 veces, candidato).
- Máximo absoluto de 5 subagentes en el repo.
- Cada subagente declara explícitamente sus `tools` permitidos. Principio de mínimo privilegio.

### 14.2 Subagentes incluidos

| Subagente | Cuándo aparece | Qué hace |
|---|---|---|
| `module-scaffolder` | A partir del 4º-5º módulo creado a mano | Genera estructura completa de un módulo nuevo en `apps/web/src/modules/` con server actions, queries, schemas, types, services y rutas correspondientes. Multi-tenant scoping forzado. Validación Zod en bordes. |
| `integration-builder` | Para cada integración externa nueva (Holded, Catastro, PVGIS, Signaturit, SolarEdge, Huawei, etc.) | Genera paquete `packages/integrations/<provider>/` con cliente HTTP retry-safe, types, Zod schemas, errores tipados, webhooks (si aplica) y tests con MSW. |
| `tenant-isolation-tester` | Cada vez que se introduce un modelo Prisma con `organizationId` o un Server Action que toca datos de tenant | Escribe tests Vitest adversariales en 3 capas (DB scoping, Server Actions, RLS) que **prueban** que org A no puede acceder a datos de org B. No "fixea" tests fallidos: reporta leaks. |
| `spanish-compliance-expert` | Al trabajar en módulo de tramitación, subvenciones, CEE, modalidades RD 244/2019, o cualquier código que toque normativa española | Asesora e implementa con conocimiento del marco regulatorio español. Verifica con BOE, IDAE, MITECO antes de afirmar. No inventa umbrales. No traduce siglas (CAU sigue siendo CAU). |

### 14.3 Cómo se invocan

Claude Code los invoca **automáticamente** cuando detecta que la `description` del subagente encaja con la tarea. También se pueden invocar **explícitamente**:

```
> Use the module-scaffolder subagent to create the tickets module
> Use the integration-builder subagent to build the Catastro connector
> Use the tenant-isolation-tester subagent to verify isolation for the Project model
> Ask the spanish-compliance-expert subagent if our procedure flow is correct for con-excedentes-compensacion
```

### 14.4 Subagentes built-in que NO necesitan definición

Claude Code trae estos pre-instalados:

- **Explore** — búsqueda y exploración de codebase sin modificar. Se invoca solo cuando Claude Code necesita entender estructura.
- **Plan** — planificación de tareas grandes.
- **general-purpose** — clones del agente principal vía `Task()`. Útil para paralelizar trabajo independiente.

No hace falta crearlos. Claude Code los usa por debajo cuando le conviene.

### 14.5 Cuándo NO crear un subagente nuevo

Anti-patrones que se han identificado en proyectos similares:

- ❌ Subagente "tester" genérico — los tests son parte del trabajo del módulo, no especialización.
- ❌ Subagente "documenter" — la doc se escribe junto al código.
- ❌ Subagentes que se llaman entre sí en cadena — frágil rápidamente.
- ❌ Subagente "code-reviewer" para todo — revisar es trabajo del agente principal con `pnpm lint` + tests.
- ❌ Crear el subagente "por si acaso" — la fricción de mantenerlo pesa más que el ahorro.

### 14.6 Si aparecen candidatos nuevos durante el desarrollo

Documentar primero en este blueprint (en una tabla aparte de "candidatos") con:
- Nombre tentativo
- Síntoma que motivó la propuesta (ej: "llevo 4 PRs copiando el mismo patrón de seed de catálogo")
- Tools que necesitaría
- Diferencia con los existentes

Si tras una semana el síntoma persiste, crear el subagente. Si no, descartar.

---

## Notas finales

Este documento es el contrato entre el founder y Claude Code. Si una tarea no encaja con lo escrito, se actualiza el documento **antes** de ejecutar la tarea, no después. Los cambios significativos se registran como ADR en `docs/ADR/`.

**Última actualización:** abril 2026 — añadida decisión Clerk para auth (ver `docs/ADR/0001-auth-clerk.md`).
