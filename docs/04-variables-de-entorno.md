# 04 — Variables de entorno

El servicio lee la configuración desde un archivo `.env` (o `.env.<NODE_ENV>` si
`NODE_ENV` está definido). Consulta `src/app.module.ts`:

```ts
envFilePath: !process.env.NODE_ENV ? '.env' : `.env.${process.env.NODE_ENV}`
```

- **Desarrollo:** `.env`
- **Pruebas:** `.env.test` (Vitest e2e fija `NODE_ENV=test` en `vitest.config.e2e.ts`)
- **Producción:** `.env.production` (o variables inyectadas por el entorno)

La validación la realiza **Zod** con el esquema `src/config/environment.schema.ts`.
Las variables numéricas se reciben como *string* y se convierten/validan con
`z.coerce.number()`; los defaults se aplican con `.prefault(...)` (numéricos/ports)
o `.default(...)` (strings/enums). La plantilla versionada es **`.env.example`**;
usala como punto de partida.

---

## Tabla de variables

| Variable | Tipo | Valor por defecto (esquema) | Ejemplo `.env` | Propósito |
|---|---|---|---|---|
| `APP_ID` | string | `REPORT01` | `"REP01"` | Identificador de la aplicación. |
| `APP_NAME` | string | `tracking-report` | `"tracking-report"` | Nombre legible de la aplicación. |
| `TZ` | string | `America/La_Paz` | `"America/La_Paz"` | Zona horaria por defecto del proceso. |
| `WS_PORT` | number (port) | `10701` | `10701` | Puerto WebSocket del servicio. |
| `APP_PORT` | number (port) | `10801` | `10801` | Puerto HTTP donde escucha la app y se publica ante el *processor*. |
| `APP_STATIC_PATH` | string | `./public` | `./public` | Carpeta base donde `ReportConsumer` guarda los archivos generados (`reports/pdf`, `reports/excel`). |
| `WS_GATEWAY_HOST_PROCESSOR` | string | `localhost` | `172.20.50.123` | Host del *gateway/processor* al que se conecta por WebSocket. |
| `WS_GATEWAY_PORT_PROCESSOR` | number (port) | `7170` | `7170` | Puerto del *gateway/processor*. |
| `UUID` | string | `f0f0f0f0` | `e430add2` | Identificador único con el que el servicio se registra ante el *processor*. |
| `DB_URL` | string | `./database/tracking-report.sqlite` | `./database/tracking-report.sqlite` | Ruta del archivo SQLite usado por la aplicación. |
| `NODE_ENV` | string enum | `development` | *(sin definir)* | Entorno de ejecución (`development`, `test`, `production`). Selecciona `.env.<NODE_ENV>` y activa `migrationsRun` cuando vale `test`. |
| `REDIS_HOST` | string | `localhost` | `localhost` | Host de Redis usado por BullMQ. |
| `REDIS_PORT` | number (port) | `6379` | `6379` | Puerto de Redis. |
| `BULLMQ_JOB_ATTEMPTS` | number (int ≥ 1) | `3` | `3` | Reintentos por job antes de marcarlo como fallido. |
| `BULLMQ_JOB_BACKOFF_TYPE` | string enum | `exponential` | `exponential` | Estrategia de espera entre reintentos (`exponential` o `fixed`). |
| `BULLMQ_JOB_BACKOFF_DELAY` | number (int ≥ 100) | `1000` | `1000` | Retardo base (ms) del backoff. |
| `BULLMQ_JOB_REMOVE_ON_COMPLETE` | number (int ≥ 0) | `100` | `1000` | Cantidad de jobs completados a conservar. |
| `BULLMQ_JOB_REMOVE_ON_FAIL` | number (int ≥ 0) | `500` | `2000` | Cantidad de jobs fallidos a conservar. |

---

## Detalle por variable

### Aplicación

- **`APP_ID` / `APP_NAME`** — Metadatos de identificación de la instancia. Se usan
  principalmente para logging/registro. No afectan la lógica de negocio.
- **`TZ`** — Zona horaria base del proceso Node. Los filtros de fecha se calculan
  además con la `zoneId` que envíe el cliente en cada petición (ver
  [06 — API](./06-api.md)).

### Servidor y WebSocket

- **`APP_PORT`** — Puerto donde `main.ts` expone la API HTTP
  (`app.listen(process.env.APP_PORT ?? 3000)`). También se envía al *processor* como
  `portHttp` para que este sepa cómo llamar al servicio.
- **`WS_PORT`** — Puerto WebSocket del propio servicio.
- **`WS_GATEWAY_HOST_PROCESSOR` / `WS_GATEWAY_PORT_PROCESSOR`** — Dirección del
  *gateway/processor* central. `GatewayClientHandlerService` crea un
  `NodeControllerClient` con estos valores y `type: 'tracking-report'`; al arrancar
  (`GatewayConnectionConfig.onApplicationBootstrap`) se conecta y registra el
  listener del evento `enterprises`.
- **`UUID`** — Identificador de esta instancia frente al *processor*.

### Archivos generados

- **`APP_STATIC_PATH`** — Directorio base donde `ReportConsumer` escribe los reportes
  asíncronos:
  - `reports/pdf/report-<reportRequestId>.pdf`
  - `reports/excel/report-<reportRequestId>.xlsx`

  La ruta relativa se guarda en `report_requests.file_path`. **Nest no sirve este
  directorio estáticamente** hoy, así que en despliegue conviene montarlo como
  volumen persistente y servirlo desde otro componente (o agregar un endpoint de
  descarga).

### Cola y Redis

- **`REDIS_HOST` / `REDIS_PORT`** — Dirección del broker Redis que usa BullMQ.
  `QueueModule` los pasa a `BullModule.forRootAsync` al inicializar la conexión.
  Redis es necesario para arrancar la app y **también para `pnpm test:e2e`**.
- **`BULLMQ_JOB_ATTEMPTS`** — Número de intentos por job.
- **`BULLMQ_JOB_BACKOFF_TYPE` / `BULLMQ_JOB_BACKOFF_DELAY`** — Estrategia y retardo
  del backoff entre reintentos.
- **`BULLMQ_JOB_REMOVE_ON_COMPLETE` / `BULLMQ_JOB_REMOVE_ON_FAIL`** — Cuántos jobs
  completados/fallidos se conservan en Redis (`removeOnComplete` / `removeOnFail`).
  El `.env` actual usa `1000` y `2000`, valores distintos de los defaults del
  esquema (`100` y `500`).

### Base de datos

- **`DB_URL`** — Ruta del archivo SQLite para la aplicación en ejecución
  (`TypeOrmModule.forRootAsync`). **No** es usada por el `DataSource` de
  migraciones, que tiene la ruta fija en `src/database/data-source.ts`. En las
  pruebas vale `:memory:`.
- **`NODE_ENV`** — Entorno (`development` si no se define). `ConfigModule` lo usa para
  elegir `.env.<NODE_ENV>` (`vitest.config.e2e.ts` fija `test`) y `TypeOrmModule`
  ejecuta las migraciones al arrancar (`migrationsRun`) cuando vale `test`.

### Variables eliminadas (scheduler)

`PING_INTERVAL_MS`, `STORAGE_INTERNAL_HRS`/`STORAGE_INTERVAL_HRS` y
`SAVE_INTERVAL_MIN` **ya no forman parte del esquema** ni de los `.env`. Solo las
referencia `SchedulerCommonService`, que es código muerto: se registra en
`IntegrationsModule` pero nunca se inyecta ni se llama a `start()`. Si se instanciara,
`getOrThrow` fallaría porque las variables no existen. Ver
[01 — Estado actual](./01-estado-actual.md).

---

## Ejemplos de archivos

### `.env` (desarrollo)

```dotenv
APP_ID="REP01"
APP_NAME="tracking-report"
TZ="America/La_Paz"

WS_PORT=10701
APP_PORT=10801
APP_STATIC_PATH=./public

WS_GATEWAY_HOST_PROCESSOR=172.20.50.123
WS_GATEWAY_PORT_PROCESSOR=7170

UUID=e430add2

DB_URL=./database/tracking-report.sqlite

REDIS_HOST=localhost
REDIS_PORT=6379

BULLMQ_JOB_ATTEMPTS=3
BULLMQ_JOB_BACKOFF_TYPE=exponential
BULLMQ_JOB_BACKOFF_DELAY=1000
BULLMQ_JOB_REMOVE_ON_COMPLETE=1000
BULLMQ_JOB_REMOVE_ON_FAIL=2000
```

### `.env.test` (pruebas)

```dotenv
APP_ID="REPORT_ID"
APP_NAME="report"
TZ="America/La_Paz"

WS_PORT=10701
APP_PORT=10801
APP_STATIC_PATH=./public

WS_GATEWAY_HOST_PROCESSOR=localhost
WS_GATEWAY_PORT_PROCESSOR=7170

UUID=ffffffff

DB_URL=:memory:

REDIS_HOST=localhost
REDIS_PORT=6379

BULLMQ_JOB_ATTEMPTS=3
BULLMQ_JOB_BACKOFF_TYPE=exponential
BULLMQ_JOB_BACKOFF_DELAY=1000
BULLMQ_JOB_REMOVE_ON_COMPLETE=1000
BULLMQ_JOB_REMOVE_ON_FAIL=2000
```

---

## Buenas prácticas

- **No versionar secretos:** `.env` está en `.gitignore`. Para producción usa las
  variables del entorno o el gestor de secretos de tu plataforma.
- **Mantén el esquema, `.env.example` y los `.env` alineados:** si añades una variable,
  agrégala en los tres lugares.
- **Los defaults del esquema no sustituyen al `.env`:** sirven para que la app no
  falle si falta una variable, pero conviene declararlas explícitamente.
- **Monta `APP_STATIC_PATH` como volumen persistente** si usás la generación asíncrona.
