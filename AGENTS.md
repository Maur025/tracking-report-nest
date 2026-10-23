# AGENTS.md

Servicio NestJS (ESM) que genera reportes Excel/PDF bajo el prefijo `/api`. Los datos
de rastreo **no** viven aquí: se consultan por HTTP a las APIs de cada empresa. Hay
documentación extensa en [`docs/`](./docs/README.md) (español); este archivo recoge
solo lo que un agente suele pasar por alto.

## Comandos

| Comando          | Qué hace                                                                                                                               |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm install`   | Requiere **acceso SSH a GitHub**: `tracking-common` es `github:Maur025/tracking-common#main`.                                          |
| `pnpm start:dev` | App en watch. Escucha en `APP_PORT` (10801) con prefijo `/api`.                                                                        |
| `pnpm lint`      | oxlint _type-aware_ sobre `src/` y `test/`.                                                                                            |
| `pnpm test`      | Vitest unitario (`**/*.spec.ts`). Un solo archivo: `pnpm test <ruta/spec.ts>`.                                                         |
| `pnpm test:e2e`  | Vitest e2e (`test/*-report.e2e-spec.ts`, cubren los cuatro reportes); fuerza `NODE_ENV=test` → `.env.test` (SQLite `:memory:`). Pasan. |
| `pnpm build`     | `nest build` (borra `dist/` antes de compilar).                                                                                        |

Cada script de migración (`migration:run/generate/revert/validate`) **compila primero**
y opera sobre `dist/database/data-source.js`. El orden que valida CI es
`lint` → `test` → `test:e2e` → `build`.

## Trampas que hay que conocer

- **ESM `nodenext`:** todos los imports relativos llevan sufijo `.js` aunque el archivo
  sea `.ts` (`import { AppModule } from './app.module.js'`).
- **Pruebas:** `globals: false`, importa `describe/it/expect` desde `vitest`. Las
  unitarias van junto al código (`*.spec.ts`); las e2e solo en `test/`.
- **Pruebas e2e:** usan **MSW** (`test/setup/msw/`) para simular la API HTTP externa y
  SQLite en memoria (`DB_URL=:memory:`); no requieren red ni base de datos real.
- **`ValidationPipe` global** (`whitelist` + `forbidNonWhitelisted`): un query/body no
  declarado en el DTO responde `400` y los campos ausentes se eliminan.
- **`synchronize: false`:** el esquema SQLite no se auto-sincroniza; todo cambio de
  tabla/columna requiere una migración.
- **`src/database/data-source.ts`** fija `database/tracking-report.sqlite` y **no** lee
  `DB_URL`; solo afecta a las migraciones (la app sí usa `DB_URL`).
- **Zod no estricto:** el esquema declara `STORAGE_INTERNAL_HRS`, pero `.env`/`.env.test`
  y `SchedulerCommonService` usan `STORAGE_INTERVAL_HRS`; el servicio lo lee vía
  `ConfigService`, así que funciona por accidente. Como el scheduler es código muerto
  (pendiente de eliminar), estas variables desaparecerán con él.
- **PDF:** las fuentes se resuelven desde el `cwd` (`src/report/fonts`); ejecuta desde la
  raíz del proyecto.
- `tracking-common` no publica tipos: sus declaraciones viven en
  `src/types/tracking-common.d.ts`.

## Arquitectura

- `main.ts` (prefijo `api` + ValidationPipe) → `AppModule`.
- `src/modules/{event,progress,rules,registry-progress}`: los **cuatro reportes siguen el
  mismo patrón** (controller → service → `*-client.service` → `mapper`). Para añadir un nuevo reporte, utilizar los módulos existentes como referencia y reutilizar las abstracciones comunes.
  Evitar duplicar lógica que ya esté compartida.
- `*-client.service` pagina la API externa con `streamPaginatedData` (página 100) y la
  empresa se resuelve por `databaseName` vía `EnterpriseConfigService`.
- `src/report/`: motores PDF (PDFKit) y Excel (ExcelJS), inyectados como clases abstractas
  `PdfReportService`/`ExcelReportService` (`{ provide, useClass }` en `ReportModule`). Mismo
  patrón para `TransactionHandler` en `SharedModule`.
- `src/integrations/`: cliente WebSocket al _processor_ (el evento `enterprises` alimenta
  SQLite). El `SchedulerCommonService` (`scheduler/`) es **código muerto**: se registra en
  `IntegrationsModule` pero nunca se inyecta ni se llama a `start()`. No hace falta para el
  gateway; pendiente de eliminar.

## Deuda conocida (no "corregir" sin querer)

- CRUD de empresas: solo `POST /api/enterprises` es real; `GET/PATCH/DELETE` devuelven
  strings de ejemplo.
- `src/integrations/scheduler/`: `SchedulerCommonService` es **código muerto** (se registra
  en `IntegrationsModule` pero nunca se inyecta ni se llama a `start()`); se añadió por error
  al creer que hacía falta para el gateway. Pendiente de eliminar, junto con `PING_INTERVAL_MS`,
  `STORAGE_INTERNAL_HRS`/`STORAGE_INTERVAL_HRS` y `SAVE_INTERVAL_MIN`.
- El texto `"Usuario de prueba"` está hardcodeado en los encabezados de los reportes.

## Flujo

El historial usa ramas `feature/<n>`. CI (`.github/workflows/ci.yml`) solo corre en
`Maur025/tracking-report-nest`, en push/PR a `main` y `develop`.

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

Hay **127 archivos fuente** (excluyendo `*.spec.ts` y `*.d.ts`) y **74 tests unitarios**. **53 archivos sin test unitario**.

### Prioritarios para implementar
| Archivo | Motivo |
| --- | --- |
| `src/report-generator/services/excel-report.service.ts` | Lógica core de generación Excel. |
| `src/report-generator/services/pdf-report.service.ts` | Lógica core de generación PDF. |
| `src/modules/enterprise/dto/update-enterprise.dto.ts` | Solo hay tests para `create-enterprise*.dto.ts`. Validación faltante. |
| `src/report-management/entities/report-request.entity.ts` | Entidad con lógica; revisar si requiere test. |

### Sin test (mayoría sin lógica runtime)
- **Módulos** (`*.module.ts`): `app.module.ts`, `infrastructure/queue/queue.module.ts`, `integrations/integrations.module.ts`, `modules/{enterprise,event,progress,registry-progress,rules}/*.module.ts`, `report-generator/report-generator.module.ts`, `report-management/report-management.module.ts`, `report-processing/report-processing.module.ts`, `shared/shared.module.ts`. En este proyecto no se suelen testear módulos NestJS a menos que tengan lógica.
- **Migraciones**: `src/database/migrations/*` — no requieren tests unitarios.
- **Interfaces/DTOs tipo-only/enums**: `**/interfaces/*.ts`, muchos `dto.ts` solo tipo, `report-management/enums/*`. Generalmente no se testean; solo cuando añaden validaciones/clases con comportamiento.
- **Configuración/boot**: `main.ts`, `database/data-source.ts`, `integrations/gateway/gateway-connection.config.ts`, `infrastructure/queue/queue-values.ts`. Revisar caso por caso.
- **Transacciones/shared base**: `shared/db/base-entity.ts`, `shared/db/transaction/transaction-context.ts`, `shared/db/transaction/transaction-handler.ts` (abstracto), `shared/interfaces/page-response.ts`. Normalmente tipo/abstractos.
- **Tokens/config**: `report-processing/report-generators-token.ts`.

### Patrón de tests unitarios
- **Framework:** Vitest. `globals: false` — importar `describe`, `it`, `expect`, `vi`, `beforeEach` desde `vitest`.
- **Ubicación:** junto al código (`src/**/*.spec.ts`).
- **Estructura:** usar `Test.createTestingModule` de `@nestjs/testing`. Mockear dependencias con `useValue`/`vi.fn()`.
- **Imports ESM:** seguir regla `nodenext` — imports relativos con `.js`.
- **Mocks:** preferir mocks explícitos; seguir estilo visto en `*.consumer.service.spec.ts`, `*-client.service.spec.ts`, etc.
- **Sin lógica de negocio compleja en módulos/enums/interfaces**: priorizar servicios, mappers, controllers con lógica, DTOs con validaciones Zod/class-validator, y clases utilitarias.
