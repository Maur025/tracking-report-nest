# 03 — Instalación y ejecución

## Requisitos previos

| Requisito | Versión | Notas |
|---|---|---|
| **Node.js** | 24 (recomendado) | El CI usa `node@24`. |
| **pnpm** | 12.10.1 | La versión exacta está fijada en `package.json` (`packageManager`). |
| **Git** | Reciente | Necesario para instalar la dependencia desde GitHub. |
| **Acceso SSH a GitHub** | — | La dependencia `tracking-common` se instala desde `github:Maur025/tracking-common#main`, por lo que tu cuenta necesita acceso SSH al repositorio. |

Verifica tu entorno:

```bash
node -v
pnpm -v
```

Si no tienes pnpm 12.10.1:

```bash
corepack enable
corepack prepare pnpm@12.10.1 --activate
```

## 1. Clonar e instalar

```bash
git clone <url-del-repositorio>
cd tracking-report-nest
pnpm install
```

> Si `pnpm install` falla al resolver `tracking-common`, revisa tu acceso SSH a
> GitHub (`ssh -T git@github.com`).

## 2. Configurar variables de entorno

Copia/crea el archivo `.env` a partir de los valores documentados en
[04 — Variables de entorno](./04-variables-de-entorno.md). Ya existe un `.env` con
la configuración de desarrollo y un `.env.test` para pruebas.

## 3. Base de datos (migraciones)

El servicio usa **SQLite** con TypeORM. Las migraciones se ejecutan contra
`dist/database/data-source.js`, por lo que cada comando **compila primero**.
La ruta de la base de datos está definida en `src/database/data-source.ts`
(`database/tracking-report.sqlite`).

```bash
# Generar una migración a partir de los cambios en las entidades
pnpm migration:generate

# Aplicar migraciones pendientes
pnpm migration:run

# Revertir la última migración
pnpm migration:revert

# Ver el SQL que TypeORM generaría (validar que el esquema está sincronizado)
pnpm migration:validate
```

Detalle de los scripts (definidos en `package.json`):

| Script | Comando real |
|---|---|
| `migration:generate` | `nest build && typeorm migration:generate src/database/migrations/auto-migration -d dist/database/data-source.js` |
| `migration:run` | `nest build && typeorm migration:run -d dist/database/data-source.js` |
| `migration:revert` | `nest build && typeorm migration:revert -d dist/database/data-source.js` |
| `migration:validate` | `nest build && typeorm schema:log -d dist/database/data-source.js` |

> ⚠️ El `README.md` raíz menciona `pnpm generate:migration`, que **no existe**.
> Usa los scripts de la tabla anterior.

## 4. Ejecutar el proyecto

```bash
# Desarrollo (sin watch)
pnpm start

# Desarrollo con recarga automática
pnpm start:dev

# Desarrollo con debugger + watch
pnpm start:debug

# Producción (requiere build previo)
pnpm build
pnpm start:prod
```

Por defecto el servidor escucha en el puerto definido por `APP_PORT` (`.env`
de desarrollo: `10801`) y expone todas las rutas bajo el prefijo **`/api`**.

Comprueba que está arriba:

```bash
curl http://localhost:10801/api/enterprises
```

## 5. Base de datos local

La base SQLite se guarda en `database/tracking-report.sqlite` (más los archivos
`-wal` y `-shm` por el modo WAL). La carpeta `database/` y los `*.sqlite` están en
`.gitignore`, por lo que **no se versionan**.

> En las pruebas e2e la base se levanta **en memoria** (`.env.test` define
> `DB_URL=:memory:` y `NODE_ENV=test`, lo que además ejecuta las migraciones al
> arrancar). No se escribe ningún archivo `.sqlite`.

## Scripts disponibles (referencia completa)

| Script | Qué hace |
|---|---|
| `pnpm build` | Compila el proyecto con `nest build`. |
| `pnpm start` | Ejecuta la app (`nest start`). |
| `pnpm start:dev` | Ejecuta con watch. |
| `pnpm start:debug` | Ejecuta con debugger y watch. |
| `pnpm start:prod` | Ejecuta el `dist/main` compilado. |
| `pnpm format` | Formatea con Prettier. |
| `pnpm lint` | Ejecuta oxlint (type-aware) sobre `src/` y `test/`. |
| `pnpm test` | Ejecuta pruebas unitarias (Vitest). |
| `pnpm test:watch` | Pruebas en modo watch. |
| `pnpm test:cov` | Pruebas con cobertura. |
| `pnpm test:debug` | Pruebas con inspector. |
| `pnpm test:e2e` | Pruebas e2e (config `vitest.config.e2e.ts`). |
| `pnpm deploy` | Despliegue con `nest deploy` (`@nestjs/mau`). |

## Solución de problemas

| Síntoma | Causa probable | Solución |
|---|---|---|
| `pnpm install` falla con `tracking-common` | Sin acceso SSH a GitHub | Configura tu clave SSH (`ssh -T git@github.com`). |
| Los filtros por `STORAGE_INTERVAL_HRS` no toman el valor esperado | Inconsistencia de nombre de variable (ver [01 — Estado actual](./01-estado-actual.md)) | Revisar el esquema Zod y el `.env`. |
| Las migraciones no encuentran entidades | No se compiló (`nest build`) antes | Los scripts ya incluyen `nest build`. |
| Las pruebas e2e fallan al resolver la API externa | MSW no intercepta la petición o los handlers no cubren la ruta | Revisa los handlers en `test/setup/msw/` y que `vitest.config.e2e.ts` cargue `setupFiles`. |
| No se encuentra la fuente del PDF | Se resolvía desde `src/report/fonts` | Ejecutar desde la raíz del proyecto (usa `cwd()`). |
