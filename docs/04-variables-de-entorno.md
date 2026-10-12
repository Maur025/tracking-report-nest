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
La mayoría de las variables numéricas se reciben como *string* y se transforman a
número con `parseInt`.

---

## Tabla de variables

| Variable | Tipo | Valor por defecto (esquema) | Ejemplo `.env` | Propósito |
|---|---|---|---|---|
| `APP_ID` | string | `REPORT01` | `"REP01"` | Identificador de la aplicación. |
| `APP_NAME` | string | `tracking-report` | `"Tracking-report"` | Nombre legible de la aplicación. |
| `TZ` | string | `America/La_Paz` | `"America/La_Paz"` | Zona horaria por defecto del proceso. |
| `WS_PORT` | number (int) | `10701` | `10701` | Puerto WebSocket del servicio. |
| `APP_PORT` | number (int) | `10801` | `10801` | Puerto HTTP donde escucha la app y se publica ante el *processor*. |
| `WS_GATEWAY_HOST_PROCESSOR` | string | `localhost` | `172.20.50.123` | Host del *gateway/processor* al que se conecta por WebSocket. |
| `WS_GATEWAY_PORT_PROCESSOR` | number (int) | `7170` | `7170` | Puerto del *gateway/processor*. |
| `UUID` | string | `f0f0f0f0` | `c2dd86f2` | Identificador único con el que el servicio se registra ante el *processor*. |
| `PING_INTERVAL_MS` | number (int) | `5000` | `5000` | Intervalo (ms) del evento interno `time.ping`. |
| `STORAGE_INTERVAL_HRS` | number (int) | *(ver nota)* | `1` | Intervalo (horas) del evento interno `time.storage`. |
| `SAVE_INTERVAL_MIN` | number (int) | `5` | `5` | Intervalo (minutos) del evento interno `time.save`. |
| `DB_URL` | string | `./database/tracking-report.sqlite` | `./database/tracking-report.sqlite` | Ruta del archivo SQLite usado por la aplicación. |

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

### Intervalos internos (scheduler)

Consumidos por `SchedulerCommonService`, que crea tres intervalos y dispara eventos
en `this.events`:

- **`PING_INTERVAL_MS`** → evento `time.ping`.
- **`STORAGE_INTERVAL_HRS`** → evento `time.storage` (se multiplica ×3600×1000).
- **`SAVE_INTERVAL_MIN`** → evento `time.save` (se multiplica ×60×1000).

> ⚠️ **Inconsistencia conocida:** el esquema Zod define `STORAGE_INTERNAL_HRS`
> (con "N", no "V"), mientras que `.env`, `.env.test` y `SchedulerCommonService`
> usan `STORAGE_INTERVAL_HRS`. Como Zod no está en modo estricto, la variable del
> `.env` se conserva en `process.env` y el scheduler la lee igual, pero el esquema
> valida un nombre distinto. Ver [01 — Estado actual](./01-estado-actual.md).

### Base de datos

- **`DB_URL`** — Ruta del archivo SQLite para la aplicación en ejecución
  (`TypeOrmModule.forRootAsync`). **No** es usada por el `DataSource` de
  migraciones, que tiene la ruta fija en `src/database/data-source.ts`.

---

## Ejemplos de archivos

### `.env` (desarrollo)

```dotenv
APP_ID="REP01"
APP_NAME="Tracking-report"
TZ="America/La_Paz"

WS_PORT=10701
APP_PORT=10801

WS_GATEWAY_HOST_PROCESSOR=172.20.50.123
WS_GATEWAY_PORT_PROCESSOR=7170

UUID=c2dd86f2

PING_INTERVAL_MS=5000
STORAGE_INTERVAL_HRS=1
SAVE_INTERVAL_MIN=5

DB_URL=./database/tracking-report.sqlite
```

### `.env.test` (pruebas)

```dotenv
APP_ID="REPORT_ID"
APP_NAME="report"
TZ="America/La_Paz"

WS_PORT=10701
APP_PORT=10801

WS_GATEWAY_HOST_PROCESSOR=localhost
WS_GATEWAY_PORT_PROCESSOR=7170

UUID=ffffffff

PING_INTERVAL_MS=5000
STORAGE_INTERVAL_HRS=1
SAVE_INTERVAL_MIN=5

DB_URL=./database/test.db
```

---

## Buenas prácticas

- **No versionar secretos:** `.env*` está en `.gitignore`. Para producción usa las
  variables del entorno o el gestor de secretos de tu plataforma.
- **Mantén el esquema y el `.env` alineados:** si añades una variable, agrégala
  tanto a `environment.schema.ts` como a los `.env` correspondientes.
- **Los defaults del esquema no sustituyen al `.env`:** sirven para que la app no
  falle si falta una variable, pero conviene declararlas explícitamente.
