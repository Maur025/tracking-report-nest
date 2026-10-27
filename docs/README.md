# Documentación — tracking-report-nest

Bienvenido a la documentación del servicio **tracking-report-nest**.

`tracking-report-nest` es un **microservicio de generación de reportes** para una
plataforma de rastreo vehicular. Recibe peticiones HTTP, las filtra (fechas, zona
horaria, vehículos, reglas, etc.), consulta las bases de datos operativas de cada
empresa vía HTTP en forma paginada, y devuelve el resultado como **Excel** o
**PDF** en streaming. Además se conecta por **WebSocket** a un *gateway/processor*
central desde el que recibe el catálogo de empresas y sus configuraciones de base
de datos, e integra una **cola BullMQ/Redis** para la gestión de reportes (en fase
inicial).

Esta carpeta está pensada para que **cualquier persona pueda entender el proyecto sin
necesidad de que alguien se lo explique de viva voz**.

---

## Índice

| Documento | Contenido |
|---|---|
| [01 — Estado actual](./01-estado-actual.md) | Qué hace el servicio hoy, qué está completo y qué está pendiente (deuda técnica). |
| [02 — Tecnologías](./02-tecnologias.md) | Stack completo, versiones, propósito de cada tecnología en el proyecto y enlaces oficiales. |
| [03 — Instalación y ejecución](./03-instalacion-y-ejecucion.md) | Requisitos, instalación, scripts, migraciones y solución de problemas. |
| [04 — Variables de entorno](./04-variables-de-entorno.md) | Propósito, tipo, valor por defecto y ejemplo de cada variable. |
| [05 — Arquitectura](./05-arquitectura.md) | Módulos, flujo de datos, procesamiento asíncrono (BullMQ/Redis) e integraciones (HTTP y WebSocket). |
| [06 — API](./06-api.md) | Endpoints, parámetros de consulta y ejemplos `curl`. |
| [07 — Base de datos](./07-base-de-datos.md) | SQLite, entidades, transacciones y migraciones. |
| [08 — Testing y calidad](./08-testing-y-calidad.md) | Vitest, oxlint, Prettier y CI. |
| [09 — Despliegue](./09-despliegue.md) | Build, ejecución en producción y pipeline. |
| [10 — Glosario](./10-glosario.md) | Términos del dominio usados a lo largo del proyecto. |

---

## Lectura rápida por perfil

- **Quiero levantar el proyecto ya:** [03 — Instalación y ejecución](./03-instalacion-y-ejecucion.md).
- **Soy nuevo en el equipo:** [01 — Estado actual](./01-estado-actual.md) → [05 — Arquitectura](./05-arquitectura.md) → [10 — Glosario](./10-glosario.md).
- **Voy a consumir la API:** [06 — API](./06-api.md).
- **Voy a operar/configurar el servicio:** [04 — Variables de entorno](./04-variables-de-entorno.md) → [09 — Despliegue](./09-despliegue.md).
- **Voy a contribuir código:** [02 — Tecnologías](./02-tecnologias.md) → [07 — Base de datos](./07-base-de-datos.md) → [08 — Testing y calidad](./08-testing-y-calidad.md).

> **Nota:** este proyecto se desarrolla normalmente en español (comentarios y
> documentación), pero el código (nombres de variables, funciones, clases) está en
> inglés.
