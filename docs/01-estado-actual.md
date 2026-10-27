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

El mismo reporte puede solicitarse de forma **asíncrona**: se crea un
`ReportRequest`, se publica un job en **BullMQ/Redis** y un consumidor genera el
archivo en segundo plano.

Adicionalmente, se conecta por **WebSocket** a un *gateway/processor* central para
recibir y persistir el catálogo de empresas y sus configuraciones de conexión.

## Qué hace hoy (funcionalidad implementada)

### Reportes disponibles (implementados de extremo a extremo)

Cada reporte sigue el mismo patrón: controller → service → `*-client.service`
(consulta HTTP externa) → motor de reporte (`report-generator/`) → `StreamableFile`.
Además, cada módulo expone el encolado asíncrono y su consumidor.

| Reporte | Reporte en streaming | Encolado | Estado |
|---|---|---|---|
| **Eventos** | `GET /api/events/reports` | `POST /api/events/reports/queue` | ✅ Implementado |
| **Progreso** | `GET /api/progress/reports` | `POST /api/progress/reports/queue` | ✅ Implementado |
| **Reglas** | `GET /api/rules/reports` | `POST /api/rules/reports/queue` | ✅ Implementado |
| **Progreso de registro** | `GET /api/registry-progress/reports` | `POST /api/registry-progress/reports/queue` | ✅ Implementado |

El `GET` devuelve **PDF** cuando `format=pdf` (valor por defecto) o **Excel** en
cualquier otro caso válido (`format=excel`). Detalle en [06 — API](./06-api.md).

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
- **CRUD HTTP de empresas:** `EnterpriseController` expone:
  - `POST /api/enterprises` — crea empresa + configuraciones.
  - `GET /api/enterprises` — lista paginada.
  - `GET /api/enterprises/:id` — obtiene una empresa (`404` si no existe).
  - `DELETE /api/enterprises/:id` — elimina la empresa.
  - **No existe `PATCH`**, aunque `UpdateEnterpriseDto` esté definido.

### Cola de reportes y procesamiento asíncrono

- `ReportManagementModule` registra la cola `report-queue` con BullMQ y la entidad
  `ReportRequest`.
- Cada módulo de reporte tiene un `QueueService` que:
  1. valida que exista la empresa (`databaseName`);
  2. crea un `ReportRequest` en estado `PENDING`;
  3. publica `generate-pdf` o `generate-excel` con `jobId` `pdf-<id>` / `excel-<id>`.
- `ReportProcessingModule` registra `ReportConsumer`
  (`@Processor('report-queue', { concurrency: 2 })`) y
  `ReportGenerateStrategyService`, que resuelve el generador por `type`.
- El consumidor genera el archivo, lo guarda en
  `APP_STATIC_PATH/reports/{pdf,excel}/report-<id>.<ext>` y actualiza el estado:
  `PENDING → PROCESSING → COMPLETED` o `FAILED` (con `error_message`).
- `GET /api/reports/queue` lista las solicitudes de forma paginada. No hay endpoint
  para consultar una solicitud por id ni para descargar el archivo generado.

### Integración con el processor

- **WebSocket al processor:** `GatewayClientHandlerService` +
  `GatewayConnectionConfig`.
  El evento `enterprises` alimenta SQLite vía `EnterprisesWsHandlerService`.

### Documentación de la API

- **Swagger** está disponible en `/api/docs` (configurado en `main.ts`).

### Pruebas

- **Unitarias:** Vitest, junto a cada archivo (`*.spec.ts`).
- **E2E:** cubren los **cuatro reportes** (`test/*.e2e-spec.ts`). La API externa de
  la empresa se simula con **MSW** (`test/setup/msw/`) y la base de datos se levanta
  en memoria (`DB_URL=:memory:`, `NODE_ENV=test`, con migraciones automáticas).
  **Requieren Redis**, porque `QueueModule` no se reemplaza en `createTestApp`.
  Detalle en [08 — Testing y calidad](./08-testing-y-calidad.md).

## Estructura de carpetas (resumen)

```text
src/
├── app.module.ts              # Config, TypeORM, HTTP client, Queue y módulos
├── main.ts                    # Bootstrap HTTP: CORS, prefijo "api", ValidationPipe, Swagger
├── config/
│   └── environment.schema.ts  # Esquema Zod de variables de entorno
├── database/
│   ├── data-source.ts         # DataSource de TypeORM para migraciones (CLI)
│   └── migrations/            # Migraciones SQL generadas
├── infrastructure/
│   └── queue/                 # Configuración de BullMQ/Redis y constantes de la cola
├── integrations/
│   ├── gateway/               # Cliente WS al processor + payload de empresas
│   └── scheduler/             # Código muerto (pendiente de eliminar)
├── modules/
│   ├── enterprise/            # CRUD de empresas + configuración (SQLite)
│   ├── event/                 # Reporte de eventos + encolado y consumidor
│   ├── progress/              # Reporte de progreso + encolado y consumidor
│   ├── rules/                 # Reporte de reglas + encolado y consumidor
│   └── registry-progress/     # Reporte de progreso de registro + encolado y consumidor
├── report-generator/          # Motor reutilizable de PDF y Excel
├── report-management/         # Entidad, productor, servicio y listado de solicitudes
├── report-processing/         # Consumidor BullMQ + estrategia de generación
├── shared/                    # Entidad base, transacciones, DTOs, utilidades, respuestas
└── types/                     # Declaraciones de tipos para dependencias sin tipos
```

En cada módulo de reporte, la lógica vive en subcarpetas:
`services/`, `dto/`, `interfaces/`, `mapper/` y `common/`.

## Deuda técnica / inconsistencias conocidas

> Esta sección documenta hallazgos **sin corregirlos**. Es intencionalmente honesta
> para que quien lea sepa qué esperar del código actual.

| # | Hallazgo | Ubicación | Impacto |
|---|---|---|---|
| 1 | **Empresas sin `PATCH`:** `UpdateEnterpriseDto` existe pero ningún endpoint lo usa. | `src/modules/enterprise/` | No se pueden actualizar empresas por HTTP. |
| 2 | **Texto "Usuario de prueba"** hardcodeado en los encabezados de todos los reportes. | `src/modules/*/services/*.service.ts` | El usuario real no se refleja en los reportes. |
| 3 | **Scheduler sin uso y con variables eliminadas:** `SchedulerCommonService` se registra en `IntegrationsModule` pero nunca se inyecta ni se llama a `start()`. Además lee con `getOrThrow` `PING_INTERVAL_MS`, `STORAGE_INTERVAL_HRS` y `SAVE_INTERVAL_MIN`, que ya no existen en el esquema ni en los `.env`. | `src/integrations/scheduler/`, `src/integrations/integrations.module.ts` | Código muerto; si se instanciara, fallaría por variables faltantes. |
| 4 | **Sin descarga de archivos generados:** el consumidor escribe en `APP_STATIC_PATH`, pero Nest no sirve `public/` estáticamente y no hay endpoint de descarga. | `src/report-processing/report-consumer.ts`, `src/main.ts` | El cliente no puede obtener el archivo por HTTP; solo conoce el `reportRequestId`. |
| 5 | **Gestión de reportes incompleta:** `ReportManagementService` está vacío y el `POST` de `ReportController` está comentado. Solo funciona `GET /api/reports/queue`. | `src/report-management/` | No hay consulta por id ni operaciones de gestión. |
| 6 | **DataSource de migraciones con ruta fija:** `data-source.ts` hardcodea `database/tracking-report.sqlite` y no lee `DB_URL`. | `src/database/data-source.ts` | Migrar una BD distinta requiere editar código. |
| 7 | **E2E dependiente de Redis:** `createTestApp` solo reemplaza `IntegrationsModule`, no `QueueModule`. | `test/setup/create-test-app.ts` | La suite e2e necesita Redis para cerrar la app sin errores. |

## Próximos pasos sugeridos (para futuras iteraciones)

- Eliminar el scheduler (`SchedulerCommonService`) y sus restos.
- Completar el `PATCH` de empresas o eliminar `UpdateEnterpriseDto`.
- Servir los archivos generados (estático o endpoint de descarga) y exponer el estado
  de una solicitud por id.
- Resolver el "Usuario de prueba" con el usuario autenticado real.
- Alinear `data-source.ts` con `DB_URL`.
- Evaluar mockear `QueueModule` en e2e para desacoplar la suite de Redis.
