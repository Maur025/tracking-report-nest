# 01 — Estado actual del proyecto

## Qué es

`tracking-report-nest` es un **microservicio backend** (NestJS) que genera y
sirve **reportes** de una plataforma de rastreo vehicular. No almacena los datos de
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

## Qué hace hoy (funcionalidad implementada)

### Reportes disponibles (implementados de extremo a extremo)

Cada reporte sigue el mismo patrón: controller → service → `*-client.service`
(consulta HTTP externa) → motor de reporte (`report/`) → `StreamableFile`.

| Reporte | Endpoint | Estado |
|---|---|---|
| **Eventos** | `GET /api/events/reports` | ✅ Implementado |
| **Progreso** | `GET /api/progress/reports` | ✅ Implementado |
| **Reglas** | `GET /api/rules/reports` | ✅ Implementado |
| **Progreso de registro** | `GET /api/registry-progress/reports` | ✅ Implementado |

Cada uno puede devolverse en formato **`excel`** (por defecto) o **`pdf`**.

### Gestión de empresas

- **Ingesta por WebSocket:** `EnterprisesWsHandlerService` recibe el payload de
  empresas desde el *processor* y hace *upsert* de `Enterprise` y
  `EnterpriseConfig` en SQLite (ver [05 — Arquitectura](./05-arquitectura.md)).
- **CRUD HTTP de empresas:** `EnterpriseController` expone `POST/GET/PATCH/DELETE
  /api/enterprises`. **Solo `POST` (crear) está implementado de verdad**; el resto
  son *stubs* (ver deuda técnica).

### Motor de reportes

- **PDF:** PDFKit, con plantillas de tablas, encabezados de página, logos de empresa
  y fuentes locales (Inter, Roboto) en `src/report/fonts/`.
- **Excel:** ExcelJS en modo streaming (`WorkbookWriter`).

### Integración y scheduler

- **WebSocket al processor:** `GatewayClientHandlerService` + `GatewayConnectionConfig`.
- **Scheduler interno:** `SchedulerCommonService` emite eventos recurrentes
  (`time.ping`, `time.save`, `time.storage`) con intervalos configurables.

## Estructura de carpetas (resumen)

```
src/
├── app.module.ts              # Módulo raíz: registra config, TypeORM, HTTP client y todos los módulos
├── main.ts                    # Bootstrap HTTP: prefijo global "api" + ValidationPipe
├── config/
│   └── environment.schema.ts  # Esquema Zod de variables de entorno
├── database/
│   ├── data-source.ts         # DataSource de TypeORM para migraciones (CLI)
│   └── migrations/            # Migraciones SQL generadas
├── integrations/
│   ├── gateway/               # Cliente WS al processor + manejo de payload de empresas
│   ├── scheduler/             # Intervalos internos (ping/save/storage)
│   └── integrations.module.ts
├── modules/
│   ├── enterprise/            # CRUD + configuración de empresas (SQLite)
│   ├── event/                 # Reporte de eventos
│   ├── progress/              # Reporte de progreso
│   ├── rules/                 # Reporte de reglas
│   └── registry-progress/     # Reporte de progreso de registro
├── report/                    # Motor reutilizable de PDF y Excel
├── shared/                    # Entidad base, transacciones, DTOs, utilidades, respuestas
└── types/                     # Declaraciones de tipos para dependencias sin tipos (tracking-common)
```

## Deuda técnica / inconsistencias conocidas

> Esta sección documenta hallazgos **sin corregirlos**. Es intencionalmente honesta
> para que quien lea sepa qué esperar del código actual.

| # | Hallazgo | Ubicación | Impacto |
|---|---|---|---|
| 1 | **Nombre de variable inconsistente:** el esquema define `STORAGE_INTERNAL_HRS`, pero `.env`, `.env.test` y el scheduler usan `STORAGE_INTERVAL_HRS` (typo). El scheduler lee el valor real vía `ConfigService`, que accede a `process.env`, no al esquema validado. | `src/config/environment.schema.ts`, `.env`, `.env.test`, `src/integrations/scheduler/scheduler-common.service.ts` | Confuso; el valor del esquema nunca coincide con el del `.env`. |
| 2 | **README desactualizado:** menciona el script `pnpm generate:migration` (el script real es `migration:generate`) y ejemplos que no coinciden con `package.json`. | `README.md` | Un desarrollador nuevo sigue instrucciones que no funcionan. |
| 3 | **DataSource de migraciones con ruta fija:** `data-source.ts` hardcodea `database/tracking-report.sqlite` y no lee `DB_URL` del entorno. | `src/database/data-source.ts` | Migrar una BD distinta a la fija requiere editar código. |
| 4 | **CRUD de empresas incompleto:** `findAll`, `findOne`, `update` y `remove` devuelven strings de ejemplo en lugar de operar sobre la base de datos. | `src/modules/enterprise/enterprise.service.ts` | Los endpoints `GET/PATCH/DELETE /api/enterprises` no funcionan realmente. |
| 5 | **Test e2e desalineado:** `app.e2e-spec.ts` espera `Hello World!` en `GET /`, pero la app usa prefijo global `api` y no existe esa ruta. | `test/app.e2e-spec.ts`, `src/main.ts` | El test e2e falla con el estado actual. |
| 6 | **`console.log` de depuración** en el flujo de obtención de datos de progreso. | `src/modules/progress/progress-client.service.ts` | Ruido en logs. |
| 7 | **Texto "Usuario de prueba"** hardcodeado en los encabezados de todos los reportes. | `src/modules/*/*.service.ts` | El usuario real no se refleja en los reportes. |

## Próximos pasos sugeridos (para futuras iteraciones)

- Completar el CRUD real de empresas.
- Unificar el nombre de la variable de almacenamiento y hacer que el scheduler lea
  del `ConfigService` validado.
- Actualizar el `README.md` raíz para que apunte a `docs/`.
- Corregir o eliminar el test e2e desalineado.
- Resolver el "Usuario de prueba" con el usuario autenticado real.
