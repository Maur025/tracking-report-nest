# 02 — Tecnologías

Este documento lista el stack, la versión declarada y **para qué se usa cada
tecnología en este proyecto**. No es un tutorial de uso: para aprender cada una,
usa el enlace oficial.

Las versiones provienen de `package.json`. El símbolo `^` indica que el
`pnpm-lock.yaml` puede resolver una versión más alta dentro del mismo *major*.

## Runtime y gestor de paquetes

| Tecnología | Versión | Propósito en este proyecto | Documentación |
|---|---|---|---|
| **Node.js** | 24 (CI) | Runtime de ejecución. El pipeline de CI fija `node@24`. | https://nodejs.org/docs/latest-v24.x/api/ |
| **pnpm** | 12.11.2 | Gestor de paquetes (declarado con `packageManager`). | https://pnpm.io |
| **TypeScript** | ^6.0.3 | Lenguaje del proyecto. Config estricta (`strict: true`, `module: nodenext`). | https://www.typescriptlang.org/docs/ |

## Framework principal

| Tecnología | Versión | Propósito en este proyecto | Documentación |
|---|---|---|---|
| **NestJS** (`@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`) | ^12.1.3 | Framework base del microservicio: módulos, inyección de dependencias, controladores HTTP sobre Express. | https://docs.nestjs.com |
| **`@nestjs/config`** | ^12.0.1 | Carga y validación de variables de entorno (con esquema Zod). | https://docs.nestjs.com/techniques/configuration |
| **`@nestjs/cli`** | ^12.0.8 | CLI de Nest: `nest build`, `nest start`, `nest deploy`. | https://docs.nestjs.com/cli/overview |
| **`@nestjs/schematics`** | ^12.0.7 | Generadores de código del CLI (`nest g ...`). | https://docs.nestjs.com/cli/usages |
| **`@nestjs/testing`** | ^12.1.3 | Utilidades de testing para levantar módulos en pruebas. | https://docs.nestjs.com/fundamentals/testing |

## HTTP, base de datos y validación

| Tecnología | Versión | Propósito en este proyecto | Documentación |
|---|---|---|---|
| **`@nestjs/typeorm`** | ^12.0.2 | Integración de TypeORM con Nest (`forRootAsync`, `forFeature`, `@InjectRepository`). | https://docs.nestjs.com/techniques/database |
| **TypeORM** | ^1.1.2 | ORM para SQLite: entidades `Enterprise`/`EnterpriseConfig`/`ReportRequest` y migraciones. | https://typeorm.io |
| **better-sqlite3** | ^13.0.3 | Driver SQLite síncrono usado por TypeORM (`type: 'better-sqlite3'`) con WAL. | https://github.com/WiseLibs/better-sqlite3 |
| **`@nestjs/http-client`** | ^0.0.2 | Cliente HTTP global (registrado con timeout `10s`) para consultar las APIs de las empresas. | *(interno del equipo)* |
| **`@nestjs/mapped-types`** | ^12.0.0 | Utilidades como `PartialType` para DTOs de actualización. | https://docs.nestjs.com/openapi/mapped-types |
| **Zod** | ^4.6.7 | Validación/tipado del esquema de variables de entorno (`environment.schema.ts`). | https://zod.dev |
| **class-validator** | ^0.15.1 | Validación declarativa de DTOs de entrada (query params y bodies). | https://github.com/typestack/class-validator |
| **class-transformer** | ^0.5.1 | Transformación de los DTOs (`@Transform`, conversión de tuplas a arrays, fechas). | https://github.com/typestack/class-transformer |
| **`@js-temporal/polyfill`** | ^0.5.1 | Manejo correcto de fechas/zonas horarias (filtros por día, mes, año) mediante `Temporal`. | https://tc39.es/proposal-temporal/docs/ |

## Generación de documentos

| Tecnología | Versión | Propósito en este proyecto | Documentación |
|---|---|---|---|
| **ExcelJS** | ^4.4.0 | Generación de reportes Excel en streaming (`WorkbookWriter`). | https://github.com/exceljs/exceljs |
| **PDFKit** | ^0.20.2 | Generación de reportes PDF (tablas, encabezados, fuentes). | https://pdfkit.org |
| **`@types/pdfkit`** | ^0.17.6 | Tipos de TypeScript para PDFKit. | https://www.npmjs.com/package/@types/pdfkit |

## Colas y mensajería

| Tecnología | Versión | Propósito en este proyecto | Documentación |
|---|---|---|---|
| **`@nestjs/bullmq`** | ^12.0.0 | Integración de BullMQ con Nest (`BullModule.forRootAsync`, `@InjectQueue`, `@Processor`). Usado por `QueueModule` y `ReportManagementModule`. | https://docs.nestjs.com/techniques/queues |
| **BullMQ** | ^6.3.14 | Cola de jobs `report-queue` (`generate-pdf`, `generate-excel`) con reintentos y backoff. | https://docs.bullmq.io |
| **ioredis** | ^6.0.0 | Cliente Redis usado por BullMQ para conectarse al broker. | https://github.com/redis/ioredis |
| **Redis** | Servidor externo | Broker que transporta y persiste los jobs de la cola. Requerido para `pnpm start`/`pnpm start:dev`; en e2e el `QueueModule` se reemplaza por un mock. | https://redis.io/docs/ |

## Integración y dominio

| Tecnología | Versión | Propósito en este proyecto | Documentación |
|---|---|---|---|
| **`tracking-common`** | `github:Maur025/tracking-common#main` | Librería compartida del equipo que expone `NodeControllerClient` (cliente WS al *processor*). Se instala desde GitHub vía SSH. Sus tipos se declaran localmente en `src/types/tracking-common.d.ts`. | https://github.com/Maur025/tracking-common |
| **rxjs** | ^7.8.2 | Dependencia requerida por NestJS (observables). | https://rxjs.dev |
| **reflect-metadata** | ^0.2.2 | Requerido por los decoradores de Nest/TypeORM. | https://github.com/rbuckton/reflect-metadata |

## Testing y calidad

| Tecnología | Versión | Propósito en este proyecto | Documentación |
|---|---|---|---|
| **Vitest** | ^4.1.11 | Runner de pruebas unitarias y e2e. | https://vitest.dev |
| **`@vitest/coverage-v8`** | ^4.1.11 | Cobertura de pruebas. | https://vitest.dev/guide/coverage |
| **Supertest** | ^7.3.1 | Pruebas e2e de endpoints HTTP. | https://github.com/ladjs/supertest |
| **`@types/supertest`** | ^7.2.1 | Tipos de TypeScript para Supertest. | https://www.npmjs.com/package/@types/supertest |
| **MSW** (`msw`) | ^3.0.3 | Intercepta y simula la API HTTP externa de las empresas en las pruebas e2e. Declarado en `dependencies` (no en `devDependencies`). | https://mswjs.io |
| **oxlint** | ^1.87.0 | Linter rápido (reemplaza a ESLint). | https://oxc.rs/docs/guide/usage/linter.html |
| **`oxlint-tsgolint`** | ^7.0.2004 | Reglas *type-aware* de oxlint. | https://oxc.rs |
| **Prettier** | ^3.9.10 | Formateo de código. | https://prettier.io/docs/ |
| **`source-map-support`** | ^0.5.21 | Trazas legibles al ejecutar el JS compilado. | https://www.npmjs.com/package/source-map-support |

## Despliegue

| Tecnología | Versión | Propósito en este proyecto | Documentación |
|---|---|---|---|
| **`@nestjs/mau`** | ^0.2.8 | Despliegue administrado de NestJS (`nest deploy`). | https://mau.nestjs.com |
| **`@types/node`** | ^26.6.5 | Tipos de Node.js. | https://www.npmjs.com/package/@types/node |
| **`@types/express`** | ^5.0.6 | Tipos de Express (plataforma HTTP). | https://www.npmjs.com/package/@types/express |

## Herramientas de entorno (no en `package.json`)

| Herramienta | Propósito |
|---|---|
| **GitHub Actions** | CI en `.github/workflows/ci.yml` (lint + tests + build). |
| **Dependabot** | Actualización semanal de dependencias npm y GitHub Actions. |
| **VS Code** | Configuración en `.vscode/settings.json`. |
