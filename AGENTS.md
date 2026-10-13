# AGENTS.md

Servicio NestJS (ESM) que genera reportes Excel/PDF bajo el prefijo `/api`. Los datos
de rastreo **no** viven aquí: se consultan por HTTP a las APIs de cada empresa. Hay
documentación extensa en [`docs/`](./docs/README.md) (español); este archivo recoge
solo lo que un agente suele pasar por alto.

## Comandos

| Comando | Qué hace |
|---|---|
| `pnpm install` | Requiere **acceso SSH a GitHub**: `tracking-common` es `github:Maur025/tracking-common#main`. |
| `pnpm start:dev` | App en watch. Escucha en `APP_PORT` (10801) con prefijo `/api`. |
| `pnpm lint` | oxlint *type-aware* sobre `src/` y `test/`. |
| `pnpm test` | Vitest unitario (`**/*.spec.ts`). Un solo archivo: `pnpm test <ruta/spec.ts>`. |
| `pnpm test:e2e` | Vitest e2e (`test/*-report.e2e-spec.ts`, cubren los cuatro reportes); fuerza `NODE_ENV=test` → `.env.test` (SQLite `:memory:`). Pasan. |
| `pnpm build` | `nest build` (borra `dist/` antes de compilar). |

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
  mismo patrón** (controller → service → `*-client.service` → `mapper`). Para añadir uno,
  copia la estructura existente.
- `*-client.service` pagina la API externa con `streamPaginatedData` (página 100) y la
  empresa se resuelve por `databaseName` vía `EnterpriseConfigService`.
- `src/report/`: motores PDF (PDFKit) y Excel (ExcelJS), inyectados como clases abstractas
  `PdfReportService`/`ExcelReportService` (`{ provide, useClass }` en `ReportModule`). Mismo
  patrón para `TransactionHandler` en `SharedModule`.
- `src/integrations/`: cliente WebSocket al *processor* (el evento `enterprises` alimenta
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
