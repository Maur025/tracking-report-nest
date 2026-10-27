# 10 — Glosario

Términos del dominio y técnicos usados a lo largo del proyecto.

## Dominio de negocio

| Término | Significado |
|---|---|
| **Enterprise (empresa)** | Cliente/organización de la plataforma de rastreo. Cada empresa tiene su propia base de datos operativa. |
| **EnterpriseConfig** | Configuración de conexión de una empresa: `host`, `port`, `database` (codename) y `referenceId`. Permite saber a qué API llamar para obtener datos. |
| **database / databaseName** | Codename de la base de datos de una empresa. En los reportes es el parámetro que identifica la empresa. |
| **referenceId** | ID de referencia de la base de datos dentro de la plataforma. |
| **zoneId** | Zona horaria IANA (p. ej. `America/La_Paz`) usada para calcular los límites de día/mes/año de los filtros. |
| **Event (evento)** | Suceso generado por una regla (exceso de velocidad, geocerca, etc.) sobre un vehículo. |
| **Progress (progreso)** | Avance de un recorrido/programación planificada. |
| **Registry Progress (progreso de registro)** | Registro del progreso por rango de fechas y vehículo. |
| **Rules (reglas)** | Reglas configuradas que disparan eventos (alertas/notificaciones). |
| **Geofence (geocerca)** | Área geográfica delimitada. |
| **Interest Point / ipoints** | Punto de interés geográfico. |
| **Gateway / Processor** | Servicio central al que este microservicio se conecta por WebSocket para recibir el catálogo de empresas. |
| **disposition** | Indica si un PDF se sirve en línea (`inline`) o como descarga (`attachment`). |

## Técnicos

| Término | Significado |
|---|---|
| **DTO** | *Data Transfer Object*: objeto que define y valida la forma de los datos de entrada/salida. |
| **Mapper** | Función/servicio que transforma la respuesta externa al modelo interno. |
| **Client service** | Servicio (`*-client.service.ts`) encargado de comunicarse con la API HTTP externa de una empresa. |
| **dataSource (de reporte)** | Función que devuelve un `AsyncGenerator` de filas; el motor de reporte lo consume en streaming. |
| **StreamableFile** | Tipo de Nest para devolver archivos (Excel/PDF) en streaming. |
| **ReportRequest** | Entidad que representa una solicitud de reporte y su estado (`PENDING`, `PROCESSING`, `COMPLETED`, `FAILED`). |
| **ReportStatus** | Enumeración `ReportStatusEnum` con los estados de una `ReportRequest`. |
| **BullMQ** | Librería de colas basada en Redis; gestiona los jobs de generación de reportes (`report-queue`). |
| **Redis** | Almacén de datos en memoria usado como broker por BullMQ. Requerido por `QueueModule` y por la suite e2e. |
| **Job** | Unidad de trabajo encolada en BullMQ (`generate-pdf`, `generate-excel`). |
| **Queue (cola)** | Cola `report-queue` donde el productor publica jobs y el consumidor los procesa. |
| **Producer (productor)** | Componente (`ReportProducer`) que agrega jobs a la cola. |
| **Consumer (consumidor)** | Componente (`ReportConsumer`) que toma el job, genera el documento con la estrategia y persiste estado + archivo. |
| **report-generator** | Módulo (`src/report-generator/`) con el motor reutilizable de PDF y Excel. |
| **report-management** | Módulo (`src/report-management/`) con `ReportRequest`, el productor, `ReportRequestService` y el listado de solicitudes. |
| **report-processing** | Módulo (`src/report-processing/`) con el consumidor BullMQ, la estrategia de generación y el token de generadores. |
| **ReportGenerator** | Interfaz que implementan los `*ConsumerService` para generar un reporte a partir de un `ReportRequest`. |
| **Strategy (estrategia)** | `ReportGenerateStrategyService`: resuelve el `ReportGenerator` según el `type` del reporte. |
| **`REPORT_GENERATORS`** | Token de inyección con la lista de los cuatro generadores de reporte. |
| **ReportRequestService** | Servicio que crea, busca, lista y actualiza `ReportRequest`. |
| **PageResponse** | Forma de respuesta paginada `{ data, pagination: { count, pages } }`. |
| **`APP_STATIC_PATH`** | Carpeta base donde se guardan los archivos generados (`reports/pdf`, `reports/excel`). |
| **Archivo generado** | Documento PDF/Excel producido por el consumidor; su ruta relativa queda en `report_requests.file_path`. |
| **Swagger** | Documentación OpenAPI interactiva expuesta en `/api/docs`. |
| **`format`** | Formato de salida del reporte: `pdf` (default) o `excel`. |
| **WAL** | *Write-Ahead Logging* de SQLite; por eso hay archivos `.sqlite-wal` y `.sqlite-shm`. |
| **Entidad** | Clase TypeORM mapeada a una tabla (`Enterprise`, `EnterpriseConfig`, `ReportRequest`). |
| **Migración** | Script versionado que aplica cambios de esquema (`src/database/migrations`). |
| **Upsert** | Insertar o actualizar si ya existe (por clave de conflicto). |
| **Prefijo global** | `api`, aplicado a todas las rutas en `main.ts`. |
| **ValidationPipe** | Pipe global de Nest que valida y transforma DTOs (`whitelist`, `forbidNonWhitelisted`, `transform`). |
| **Scheduler** | Servicio interno (`SchedulerCommonService`) pensado para disparar eventos recurrentes; hoy es **código muerto** (no se inyecta ni se arranca) y sus variables de entorno fueron eliminadas. |
| **ESM** | *ECMAScript Modules*; el proyecto es `"type": "module"` y usa imports con extensión `.js`. |
| **type-aware linting** | Linting que usa información de tipos (oxlint + tsgolint). |
| **MSW** | *Mock Service Worker*: intercepta peticiones HTTP en las pruebas e2e para simular la API externa de cada empresa. |
| **E2E** | *End-to-end*: pruebas que levantan la app completa y validan el flujo HTTP de cada reporte. |
| **`:memory:`** | Ruta especial de SQLite que crea la base de datos en memoria (sin archivo); usada por las pruebas. |

## Abreviaturas

| Abreviatura | Significado |
|---|---|
| **WS** | WebSocket. |
| **PK** | *Primary Key*. |
| **FK** | *Foreign Key*. |
| **CI** | *Continuous Integration* (Integración Continua). |
| **DTO** | *Data Transfer Object*. |
| **IANA** | *Internet Assigned Numbers Authority* (zona horaria estándar). |
