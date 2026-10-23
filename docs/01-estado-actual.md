# 01 — Estado actual del proyecto

## Qué es

`tracking-report-nest` es un **microservicio backend** (NestJS) que genera y sirve
**reportes** de una plataforma de rastreo vehicular. No almacena los datos de
rastreo: esos viven en las bases de datos operativas de cada empresa (una por
empresa). Este servicio:

1. Recibe una petición HTTP de reporte.
2. Resuelve a qué empresa/base de datos corresponde (por `databaseName`).
3. Consulta la API interna de esa empresa vía HTTP, de forma **paginada y en
   streaming**.
4. Transforma y da formato a los datos.
5. Devuelve el resultado como **Excel** (`.xlsx`) o **PDF** en streaming al cliente.

Adicionalmente, se conecta por **WebSocket** a un *gateway/processor* central para
recibir y persistir el catálogo de empresas y sus configuraciones de conexión.

También integra una **cola de reportes** (`report-queue`) mediante **BullMQ** y
**Redis**, aunque el flujo asíncrono de generación sigue en fase inicial.

## Qué hace hoy (funcionalidad implementada)

### Reportes disponibles (implementados de extremo a extremo)

Cada reporte sigue el mismo patrón: controller → service → `*-client.service`
(consulta HTTP externa) → motor de reporte (`report-generator/`) → `StreamableFile`.

| Reporte | Endpoint | Estado |
|---|---|---|
| **Eventos** | `GET /api/events/reports` | ✅ Implementado |
| **Progreso** | `GET /api/progress/reports` | ✅ Implementado |
| **Reglas** | `GET /api/rules/reports` | ✅ Implementado |
| **Progreso de registro** | `GET /api/registry-progress/reports` | ✅ Implementado |

Cada uno devuelve **Excel** (`.xlsx`) cuando el `format` no es `pdf`, o **PDF**
cuando `format=pdf` (detalle en [06 — API](./06-api.md)).

### Motor de reportes

- **PDF:** PDFKit, con plantillas de tablas, encabezados de página, logos de empresa
  y fuentes locales (Inter, Roboto) en `src/report-generator/fonts/`.
- **Excel:** ExcelJS en modo streaming (`WorkbookWriter`).

Los contratos de generación se exponen mediante clases abstractas:

- `PdfReportService` / `PdfReportServiceImpl`.
- `ExcelReportService` / `ExcelReportServiceImpl`.

### Gestión de empresas

- **Ingesta por WebSocket:** `EnterprisesWsHandlerService` recibe el payload de
  empresas desde el *processor* y hace *upsert* de `Enterprise` y
  `EnterpriseConfig` en SQLite (ver [05 — Arquitectura](./05-arquitectura.md)).
- **CRUD HTTP de empresas:** `EnterpriseController` expone
  `POST/GET/PATCH/DELETE /api/enterprises`. **Solo `POST` (crear) está implementado
  de verdad**; el resto son *stubs* (ver deuda técnica).

### Cola de reportes y gestión de reportes

- `ReportManagementModule` registra el token de cola `report-queue` con BullMQ.
- `ReportProducer` publica los jobs `generate-pdf` y `generate-excel`.
- `ReportConsumer` procesa esos jobs desde Redis.
- `ReportRequest` modela el estado (`PENDING`, `PROCESSING`, `COMPLETED`,
  `FAILED`), el resultado y el error de cada reporte en la tabla `report_requests`
  (la persistencia aún no se usa desde el servicio).
- `POST/GET/PATCH/DELETE /api/report-management` siguen como *stubs*; el CRUD
  operativo y la ejecución real del job no están completos.

### Integración con el processor

- **WebSocket al processor:** `GatewayClientHandlerService` +
  `GatewayConnectionConfig`.
  El evento `enterprises` alimenta SQLite vía `EnterprisesWsHandlerService`.

### Pruebas

- **Unitarias:** Vitest, junto a cada archivo (`*.spec.ts`).
- **E2E:** cubren los **cuatro reportes** (`test/*.e2e-spec.ts`). La API externa de
  la empresa se simula con **MSW** (`test/setup/msw/`) y la base de datos se levanta
  en memoria (`DB_URL=:memory:`, `NODE_ENV=test`, con migraciones automáticas).
  Detalle en [08 — Testing y calidad](./08-testing-y-calidad.md).

## Estructura de carpetas (resumen)

```text
src/
├── app.module.ts              # Registra config, TypeORM, HTTP client, Queue, módulos
├── main.ts                    # Bootstrap HTTP: prefijo global "api" + ValidationPipe
├── config/
│   └── environment.schema.ts  # Esquema Zod de variables de entorno
├── database/
│   ├── data-source.ts         # DataSource de TypeORM para migraciones (CLI)
│   └── migrations/            # Migraciones SQL generadas
├── infrastructure/
│   └── queue/                 # Configuración de BullMQ/Redis
├── integrations/
│   ├── gateway/               # Cliente WS al processor + payload de empresas
│   └── scheduler/             # Código muerto (pendiente de eliminar)
├── modules/
│   ├── enterprise/            # CRUD + configuración de empresas (SQLite)
│   ├── event/                 # Reporte de eventos
│   ├── progress/              # Reporte de progreso
│   ├── rules/                 # Reporte de reglas
│   └── registry-progress/     # Reporte de progreso de registro
├── report-generator/          # Motor reutilizable de PDF y Excel
├── report-management/         # Cola, jobs y persistencia de reportes
├── shared/                    # Entidad base, transacciones, DTOs, utilidades, respuestas
└── types/                     # Declaraciones de tipos para dependencias sin tipos
```

## Deuda técnica / inconsistencias conocidas

> Esta sección documenta hallazgos **sin corregirlos**. Es intencionalmente honesta
> para que quien lea sepa qué esperar del código actual.

| # | Hallazgo | Ubicación | Impacto |
|---|---|---|---|
| 1 | **Nombre de variable inconsistente:** el esquema define `STORAGE_INTERNAL_HRS`, pero `.env`, `.env.test` y el scheduler usan `STORAGE_INTERVAL_HRS` (typo). El scheduler lee el valor real vía `ConfigService`, que accede a `process.env`, no al esquema validado. | `src/config/environment.schema.ts`, `.env`, `.env.test`, `src/integrations/scheduler/scheduler-common.service.ts` | Confuso; el valor del esquema nunca coincide con el del `.env`. Desaparece al eliminar el scheduler (#5). |
| 2 | **DataSource de migraciones con ruta fija:** `data-source.ts` hardcodea `database/tracking-report.sqlite` y no lee `DB_URL` del entorno. | `src/database/data-source.ts` | Migrar una BD distinta a la fija requiere editar código. |
| 3 | **CRUD de empresas incompleto:** `findAll`, `findOne`, `update` y `remove` devuelven strings de ejemplo en lugar de operar sobre la base de datos. | `src/modules/enterprise/enterprise.service.ts` | Los endpoints `GET/PATCH/DELETE /api/enterprises` no funcionan realmente. |
| 4 | **Texto "Usuario de prueba"** hardcodeado en los encabezados de todos los reportes. | `src/modules/*/*.service.ts` | El usuario real no se refleja en los reportes. |
| 5 | **Scheduler sin uso:** `SchedulerCommonService` se registra en `IntegrationsModule` pero nunca se inyecta ni se llama a `start()`. Se añadió creyendo que era necesario para el gateway; no lo es. | `src/integrations/scheduler/`, `src/integrations/integrations.module.ts` | Código muerto; sostiene variables de entorno (`PING_INTERVAL_MS`, `STORAGE_INTERNAL_HRS`/`STORAGE_INTERVAL_HRS`, `SAVE_INTERVAL_MIN`) que tampoco tienen efecto. |
| 6 | **Gestión de reportes en fase inicial:** los endpoints de `/api/report-management` y el procesamiento de la cola están pendientes de implementación; el consumidor no ejecuta todavía la generación real del documento. | `src/report-management/`, `src/modules/event/event-report-generator.ts` | La infraestructura de cola existe, pero el flujo de extremo a extremo no está operativo. |

## Próximos pasos sugeridos (para futuras iteraciones)

- Eliminar el scheduler (`SchedulerCommonService` y sus variables de entorno), ya que no
  tiene utilidad real.
- Completar el CRUD real de empresas.
- Implementar la generación de reportes desde el *consumer* de la cola y conectar el
  flujo con `ReportGenerator`.
- Integrar los reportes disponibles (`EventReportGenerator`, etc.) al flujo de
  `ReportManagementModule`.
- Unificar el nombre de la variable de almacenamiento (si el scheduler no se elimina) y
  hacer que lea del `ConfigService` validado.
- Resolver el "Usuario de prueba" con el usuario autenticado real.
