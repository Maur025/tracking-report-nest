# 09 — Despliegue

## Build

Compila TypeScript a JavaScript en `dist/` mediante `nest build`:

```bash
pnpm install --frozen-lockfile
pnpm build
```

La configuración de compilación:

- `tsconfig.json`: `outDir: ./dist`, `target: ES2023`, `module: nodenext`.
- `tsconfig.build.json`: `rootDir: ./src`, excluye tests (`**/*spec.ts`) y `dist`.
- `nest-cli.json`: `deleteOutDir: true` (limpia `dist/` antes de compilar).

## Ejecución en producción

```bash
pnpm start:prod      # ejecuta node dist/main
```

Antes de arrancar, asegúrate de tener:

1. **Variables de entorno** definidas (ver [04 — Variables de entorno](./04-variables-de-entorno.md)).
2. **Redis disponible** en `REDIS_HOST:REDIS_PORT`; `QueueModule` inicializa la
   conexión de BullMQ al arrancar y el consumidor de `report-processing/` procesa
   los jobs.
3. **La base de datos migrada:**
   ```bash
   pnpm migration:run
   ```
4. **Acceso de red** al host/puerto del *gateway/processor*
   (`WS_GATEWAY_HOST_PROCESSOR`, `WS_GATEWAY_PORT_PROCESSOR`).
5. **`APP_STATIC_PATH` accesible y persistente** si usás la generación asíncrona
   (por defecto `./public`).

## Despliegue administrado (NestJS Mau)

El proyecto incluye `@nestjs/mau` y el script:

```bash
pnpm deploy          # nest deploy
```

`nest deploy` usa la plataforma **NestJS Mau** (https://mau.nestjs.com) para
desplegar en AWS sin gestionar infraestructura manualmente.

## Descripción de despliegue

Este es un servicio *backend* de larga duración que:

- escucha HTTP en `APP_PORT` y expone Swagger en `/api/docs`,
- abre un WebSocket saliente hacia el *processor*,
- mantiene una conexión a Redis y consume la cola `report-queue` (BullMQ),
- persiste en un archivo SQLite (`DB_URL`),
- escribe los reportes asíncronos en `APP_STATIC_PATH`.

Consideraciones:

| Aspecto | Recomendación |
|---|---|
| **Persistencia de SQLite** | Monta un volumen persistente para el archivo de `DB_URL` (y sus `-wal`/`-shm`). |
| **Conectividad al processor** | Habilita salida hacia `WS_GATEWAY_HOST_PROCESSOR:WS_GATEWAY_PORT_PROCESSOR`. |
| **Redis** | Asegura conectividad a `REDIS_HOST:REDIS_PORT`. Es un requisito de arranque por `QueueModule` y del consumidor. |
| **`APP_STATIC_PATH`** | Monta un volumen persistente para los archivos generados. Nest **no** los sirve por HTTP; expón la carpeta desde un proxy/almacenamiento o agrega un endpoint de descarga. |
| **`UUID` único** | Cada instancia debe tener un `UUID` distinto ante el *processor*. |
| **`APP_PORT` accesible** | El *processor* usa `portHttp` (de `APP_PORT`) para llamar al servicio. |
| **Migraciones** | Ejecútalas como paso de despliegue (`pnpm migration:run`). En producción `migrationsRun` está desactivado (solo se activa con `NODE_ENV=test`). |

## Pipeline

- **CI:** `.github/workflows/ci.yml` valida `lint` + `test` + `test:e2e` + `build` en
  cada PR/push a `main`/`develop` (ver [08 — Testing y calidad](./08-testing-y-calidad.md)).
- **Dependabot:** actualiza dependencias mensualmente.
- **Deploy:** `pnpm deploy` (`@nestjs/mau`).

## Checklist de despliegue

- [ ] `pnpm install --frozen-lockfile`
- [ ] Variables de entorno configuradas en el entorno de destino
- [ ] Redis accesible (`REDIS_HOST`/`REDIS_PORT`)
- [ ] `pnpm build`
- [ ] `pnpm migration:run`
- [ ] Volumen persistente para SQLite montado
- [ ] Volumen persistente para `APP_STATIC_PATH` montado
- [ ] Swagger accesible en `/api/docs`
- [ ] Conectividad al *processor* verificada
- [ ] `pnpm start:prod`
- [ ] Health check: `curl http://<host>:<APP_PORT>/api/enterprises`
