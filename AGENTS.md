# AGENTS.md

Servicio NestJS (ESM) que genera reportes Excel/PDF bajo el prefijo `/api`. Los datos
de rastreo **no** viven aquí: se consultan por HTTP a las APIs de cada empresa. Hay
documentación extensa en [`docs/`](./docs/README.md) (español); este archivo recoge
solo lo que un agente suele pasar por alto.

## Comandos

| Comando          | Qué hace                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm install`   | Requiere **acceso SSH a GitHub**: `tracking-common` es `github:Maur025/tracking-common#main`.                                  |
| `pnpm start:dev` | App en watch. Escucha en `APP_PORT` (10801) con prefijo `/api`; Swagger en `/api/docs`.                                        |
| `pnpm lint`      | oxlint _type-aware_ sobre `src/` y `test/`.                                                                                    |
| `pnpm test`      | Vitest unitario (`**/*.spec.ts`). Un solo archivo: `pnpm test <ruta/spec.ts>`.                                                  |
| `pnpm test:e2e`  | Vitest e2e (`test/*-report.e2e-spec.ts`, cubren los cuatro reportes). Fuerza `NODE_ENV=test` → `.env.test` (SQLite `:memory:`). |
| `pnpm test:cov`  | Cobertura con `@vitest/coverage-v8`.                                                                                           |
| `pnpm build`     | `nest build` (borra `dist/` antes de compilar).                                                                                 |
| `pnpm format`    | Prettier sobre `src/` y `test/`.                                                                                               |

Cada script de migración (`migration:run/generate/revert/validate`) **compila primero**
y opera sobre `dist/database/data-source.js`. El orden que valida CI es
`lint` → `test` → `test:e2e` → `build`.

> **e2e requiere Redis.** `createTestApp` solo reemplaza `IntegrationsModule`; `QueueModule`
> queda activo y BullMQ intenta conectarse a `REDIS_HOST:REDIS_PORT`. Sin Redis, los tests
> pueden pasar pero el `afterAll` falla por timeout de conexión. CI provee `redis:7.4-alpine`.

## Trampas que hay que conocer

- **ESM `nodenext`:** todos los imports relativos llevan sufijo `.js` aunque el archivo
  sea `.ts` (`import { AppModule } from './app.module.js'`).
- **Pruebas:** `globals: false`, importa `describe/it/expect` desde `vitest`. Las
  unitarias van junto al código (`*.spec.ts`); las e2e solo en `test/`.
- **Pruebas e2e:** usan **MSW** (`test/setup/msw/`) para simular la API HTTP externa y
  SQLite en memoria (`DB_URL=:memory:`). No requieren red, pero sí **Redis** (ver arriba).
- **`ValidationPipe` global** (`whitelist` + `forbidNonWhitelisted` + `transform`): un
  query/body no declarado en el DTO responde `400` y los campos ausentes se eliminan.
- **`synchronize: false`:** el esquema SQLite no se auto-sincroniza; todo cambio de
  tabla/columna requiere una migración.
- **`src/database/data-source.ts`** fija `database/tracking-report.sqlite` y **no** lee
  `DB_URL`; solo afecta a las migraciones (la app sí usa `DB_URL`).
- **Zod con `prefault`:** `environment.schema.ts` usa `.prefault(...)` para valores por
  defecto, no `.default(...)`. Si agregás una variable, declarala también en `.env.example`.
- **Scheduler roto además de muerto:** `SchedulerCommonService` sigue registrado en
  `IntegrationsModule`, pero ya no se inyecta. Además lee con `getOrThrow`
  `PING_INTERVAL_MS`, `STORAGE_INTERVAL_HRS` y `SAVE_INTERVAL_MIN`, variables que se
  eliminaron del esquema y de los `.env`: instanciarlo lanzaría un error.
- **PDF:** las fuentes se resuelven desde el `cwd` (`src/report-generator/fonts`); ejecuta
  desde la raíz del proyecto.
- **Archivos generados:** `ReportConsumer` escribe en
  `APP_STATIC_PATH/reports/{pdf,excel}/report-<id>.<ext>`. Hoy Nest **no** sirve `public/`
  estáticamente ni existe endpoint de descarga; el archivo solo se registra en
  `report_requests.file_path`.
- `tracking-common` no publica tipos: sus declaraciones viven en
  `src/types/tracking-common.d.ts`.

## Arquitectura

- `main.ts` (CORS + prefijo `api` + ValidationPipe + Swagger en `/api/docs`) → `AppModule`.
- `src/modules/{event,progress,rules,registry-progress}`: los **cuatro reportes siguen el
  mismo patrón**:
  - `*.controller.ts`: `GET /<reporte>/reports` (stream PDF/Excel) y
    `POST /<reporte>/reports/queue` (`202` con `{ reportRequestId }`).
  - `services/<reporte>.service.ts`: orquesta, resuelve la empresa y define columnas.
  - `services/<reporte>-client.service.ts`: pagina la API externa con
    `streamPaginatedData` (página 100).
  - `services/queue.service.ts`: crea el `ReportRequest` y publica el job.
  - `services/<reporte>-consumer.service.ts`: implementa `ReportGenerator` para el
    procesamiento asíncrono.
  - `dto/`, `interfaces/`, `mapper/`, `common/`.
  - La empresa se resuelve por `databaseName` vía `EnterpriseConfigService`.
  Para añadir un nuevo reporte, usa los módulos existentes como referencia y reutiliza
  las abstracciones comunes. Evitá duplicar lógica ya compartida.
- `src/report-generator/`: motores PDF (PDFKit) y Excel (ExcelJS), inyectados como clases
  abstractas `PdfReportService`/`ExcelReportService` (`{ provide, useClass }` en
  `ReportGeneratorModule`). Mismo patrón para `TransactionHandler` en `SharedModule`.
- `src/report-management/`: `ReportRequest` (`report_requests`), `ReportProducer`
  (jobs `generate-pdf`/`generate-excel` en `report-queue`), `ReportRequestService` y
  `ReportController` (`GET /api/reports/queue`; el `POST` está comentado).
- `src/report-processing/`: `ReportConsumer` (`@Processor('report-queue')`), la estrategia
  `ReportGenerateStrategyService` y el token `REPORT_GENERATORS`, que inyecta los cuatro
  `*ConsumerService`.
- `src/integrations/`: cliente WebSocket al _processor_ (el evento `enterprises` alimenta
  SQLite). `SchedulerCommonService` sigue siendo código muerto (ver trampas).
- `src/infrastructure/queue/`: configuración global de BullMQ (`QueueModule`) y constantes
  de la cola (`report-queue`, jobs).

## Deuda conocida (no "corregir" sin querer)

- **Empresas sin `PATCH`:** existen `POST`, `GET`, `GET /:id` y `DELETE /:id` reales.
  `UpdateEnterpriseDto` existe pero no se usa.
- `"Usuario de prueba"` está hardcodeado en los encabezados de los cuatro reportes.
- `SchedulerCommonService` es código muerto y sus variables de entorno ya no existen
  (`PING_INTERVAL_MS`, `STORAGE_INTERVAL_HRS`, `SAVE_INTERVAL_MIN`).
- `ReportManagementService` está vacío; el `POST` de `ReportController` está comentado.
- No hay endpoints para consultar una solicitud por id ni para descargar el archivo
  generado; solo `GET /api/reports/queue` paginado.
- `src/database/data-source.ts` no lee `DB_URL`.
- El e2e depende de Redis (no se mockea `QueueModule`).
- El esquema y los `.env` deben mantenerse alineados; `.env.example` es la referencia.

## Flujo

El historial usa ramas `feature/<n>`. CI (`.github/workflows/ci.yml`) solo corre en
`Maur025/tracking-report-nest`, en push/PR a `main` y `develop`, con un servicio Redis.

## Reglas de trabajo

- Inspeccionar primero los archivos relacionados con la tarea.
- No modificar módulos ajenos al alcance solicitado.
- No corregir deuda técnica conocida salvo petición expresa.
- Reutilizar helpers y patrones existentes.
- No ejecutar suites completas después de cada cambio menor.
- Ejecutar primero las pruebas directamente afectadas.
- Si una prueba falla repetidamente, investigar la causa antes de seguir modificando código.
- Al finalizar, resumir cambios, pruebas y pendientes.

## Cobertura de tests (unitarios)

Hay **131 archivos fuente** (excluyendo `*.spec.ts` y `*.d.ts`), **78 archivos de test
unitario** y **53 archivos sin test unitario**.

### Prioritarios para implementar
| Archivo | Motivo |
| --- | --- |
| `src/modules/enterprise/dto/update-enterprise.dto.ts` | No tiene test y el DTO no se usa todavía (no hay `PATCH`). |
| `src/report-management/entities/report-request.entity.ts` | Entidad con lógica; revisar si requiere test. |
| `src/report-management/services/report-management.service.ts` | Clase vacía; probablemente se elimine o se complete. |

> `PdfReportService` y `ExcelReportService` son clases abstractas sin spec; sus
> implementaciones (`*ReportImplService`) sí están cubiertas.

### Sin test (mayoría sin lógica runtime)
- **Módulos** (`*.module.ts`): `app.module.ts`, `infrastructure/queue/queue.module.ts`,
  `integrations/integrations.module.ts`, `modules/{enterprise,event,progress,registry-progress,rules}/*.module.ts`,
  `report-generator/report-generator.module.ts`, `report-management/report-management.module.ts`,
  `report-processing/report-processing.module.ts`, `shared/shared.module.ts`. En este proyecto
  no se suelen testear módulos NestJS a menos que tengan lógica.
- **Migraciones**: `src/database/migrations/*` — no requieren tests unitarios.
- **Interfaces/DTOs tipo-only/enums**: `**/interfaces/*.ts`, muchos `dto.ts` solo tipo,
  `report-management/enums/*`. Generalmente no se testean; solo cuando añaden
  validaciones/clases con comportamiento.
- **Configuración/boot**: `main.ts`, `database/data-source.ts`,
  `integrations/gateway/gateway-connection.config.ts`, `infrastructure/queue/queue-values.ts`.
  Revisar caso por caso.
- **Transacciones/shared base**: `shared/db/base-entity.ts`,
  `shared/db/transaction/transaction-context.ts`, `shared/db/transaction/transaction-handler.ts`
  (abstracto), `shared/interfaces/page-response.ts`. Normalmente tipo/abstractos.
- **Tokens/config**: `report-processing/report-generators-token.ts`.

### Patrón de tests unitarios
- **Framework:** Vitest. `globals: false` — importar `describe`, `it`, `expect`, `vi`,
  `beforeEach` desde `vitest`.
- **Ubicación:** junto al código (`src/**/*.spec.ts`).
- **Estructura:** usar `Test.createTestingModule` de `@nestjs/testing`. Mockear
  dependencias con `useValue`/`vi.fn()`.
- **Imports ESM:** seguir regla `nodenext` — imports relativos con `.js`.
- **Mocks:** preferir mocks explícitos; seguir estilo visto en
  `*.consumer.service.spec.ts`, `*-client.service.spec.ts`, etc.
- **Sin lógica de negocio compleja en módulos/enums/interfaces**: priorizar servicios,
  mappers, controllers con lógica, DTOs con validaciones y clases utilitarias.
