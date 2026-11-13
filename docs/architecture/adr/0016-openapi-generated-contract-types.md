# ADR 0016 — Generación Determinista de Tipos TypeScript desde OpenAPI v1 y Prevención de Deriva

- **Estado:** Aceptado
- **Fecha:** 2026-11-13
- **Ámbito:** Integración Backend ↔ Frontend, Contratos API, Tipado Estricto (`libs/shared/data-access`, `tools/generate-api-types.mjs`, CI)

---

## Contexto

1. En el backend (`NalunPos-Api`), el **ADR 0024** formalizó el snapshot determinista del contrato OpenAPI v1 (`docs/api/openapi.v1.json`) y la suite de prevención de deriva contractual en integración continua (`OpenApiContractSnapshotTests.cs`).
2. En el frontend (`NalunPos-Front`), los contratos y modelos de datos (DTOs) se mantenían históricamente mediante interfaces escritas a mano (`auth.interfaces.ts`, `warehouse.model.ts`, etc.), exponiendo al monorepo a riesgos de discrepancias silenciosas en propiedades, tipos opcionales u omisiones de campos ante cambios en el backend.
3. Para mantener la solidez y estabilidad de la arquitectura:
   - Se requiere un mecanismo automatizado y determinista que genere tipos TypeScript directamente a partir del snapshot OpenAPI v1 del backend.
   - Prohibido adoptar generadores pesados de clientes HTTP (como generadores basados en Axios o librerías externas de runtime) que vulneren o reemplacen la cadena canónica de interceptores de Angular (`HttpClient`, `correlationIdInterceptor`, `authTokenInterceptor`, `sessionExpiredInterceptor`, `errorInterceptor`, `AppError`). Los clientes HTTP deben continuar siendo manuales, minimalistas y basados en `HttpClient` + Signals (ADR 0002, ADR 0013).
   - El código generado de tipos debe cumplir estrictamente con los estándares de calidad del repositorio: **cero `any`**, **cero directivas `eslint-disable`** y formateo consistente con Prettier (`.prettierrc`).
   - La integración continua (CI) debe validar automáticamente que no exista deriva entre el snapshot OpenAPI y los tipos TypeScript generados.
   - Cualquier dependencia incorporada debe cumplir con la política de licenciamiento permisivo (ADR 0013 / MIT, Apache 2.0, BSD-3-Clause) y mantener 0 vulnerabilidades altas o críticas.

---

## Decisión

1. **Adopción de `openapi-typescript` como Herramienta de Tipado:**
   - Se incorpora `openapi-typescript` (~7.13.0, licencia **MIT**) exclusivamente como dependencia de desarrollo (`devDependencies`).
   - Genera tipos estáticos TypeScript nativos (`export interface paths`, `export interface components`, etc.) a partir de la especificación OpenAPI 3.1.1 sin incorporar ningún runtime, polyfill ni peso a los bundles de producción de las aplicaciones.

2. **Snapshot de Contrato Versionado en `@nalunpos/shared/data-access`:**
   - La copia local del contrato emitido y normalizado por `NalunPos-Api` (ADR 0024) se almacena versionada en Git dentro de `libs/shared/data-access/openapi/openapi.v1.json`.
   - Queda formalmente prohibida la modificación manual de este archivo en el frontend; toda actualización proviene directamente del snapshot verificado de `NalunPos-Api`.

3. **Script Determinista y Validaciones Fail-Closed (`tools/generate-api-types.mjs`):**
   - Se crea la herramienta `tools/generate-api-types.mjs` para orquestar la generación y verificación de tipos:
     - Lee `libs/shared/data-access/openapi/openapi.v1.json` y compila el AST tipado mediante `openapiTS`.
     - Aplica un encabezado informativo normativo y formatea el resultado utilizando Prettier con la configuración local (`endOfLine: 'lf'`).
     - **Validación Fail-Closed:** Escanea el contenido resultante y aborta con código de salida 1 si detecta cualquier ocurrencia del tipo `any` o de comentarios `eslint-disable`.
     - Escribe el resultado en `libs/shared/data-access/src/generated/openapi.types.ts`.
     - **Modo `--check`:** En lugar de sobreescribir, compara de forma determinista el archivo existente en disco contra el código generado; si detecta diferencias (deriva), aborta con código 1 e instruye ejecutar `npm run api:types`.

4. **Exposición de Contratos y Reglas de Cobertura:**
   - `libs/shared/data-access/src/index.ts` re-exporta los tipos generados: `export * from './generated/openapi.types';`.
   - En `vitest.config.ts`, se añade `'libs/shared/data-access/src/generated/openapi.types.ts'` a `coverage.exclude`, ya que el archivo alberga definiciones 100% de tipos sin lógica ejecutable en runtime.

5. **Automatización en Scripts y Pipeline de CI:**
   - Se registran en `package.json` los scripts normativos:
     - `"api:types": "node tools/generate-api-types.mjs"`
     - `"api:types:check": "node tools/generate-api-types.mjs --check"`
   - En `.github/workflows/ci.yml`, el job `lint-and-format` ejecuta obligatoriamente `npm run api:types:check`, bloqueando cualquier fusión si los tipos generados difieren del contrato OpenAPI.

6. **Pruebas Estáticas de Tipos con Vitest (`expectTypeOf`):**
   - Se incorpora la suite `libs/shared/auth/src/interfaces/auth-openapi-contract.spec.ts`, validando en tiempo de compilación y prueba que:
     - `LoginRequest` y `AuthResponse` son exacta y bidireccionalmente compatibles con `components['schemas']['LoginRequest']` y `components['schemas']['LoginResponse']`.
     - La respuesta tipada de `paths['/api/v1/auth/login']['post']['responses'][200]` coincide con el esquema `LoginResponse`.
     - Esquemas canónicos como `WarehouseDto` y `CreateWarehouseRequest` exponen todas las propiedades y tipos requeridos por la arquitectura.

---

## Consecuencias

### Positivas

- **Seguridad Contractual Bidireccional:** El frontend cuenta con tipos tipados estricta y automáticamente desde el contrato formal emitido por el backend, previniendo regresiones de integración.
- **Cero Impacto en Bundle:** La herramienta opera únicamente en tiempo de compilación/desarrollo; el bundle de producción no sufre ningún incremento por librerías cliente pesadas.
- **Arquitectura Preservada:** La cadena de interceptores HTTP (`correlationIdInterceptor`, `authTokenInterceptor`, `sessionExpiredInterceptor`, `errorInterceptor`) y la gestión de errores con `AppError` continúan operando de forma idéntica e inmutable.
- **Pipeline Blindado:** CI garantiza que cualquier modificación de contrato en el backend sea adoptada explícitamente mediante `npm run api:types`.
- **Calidad Absoluta de Código:** Cero `any`, cero `eslint-disable` y cumplimiento total de ESLint y Prettier.

### Negativas / Compromisos

- Ante cualquier actualización del contrato en `NalunPos-Api`, el desarrollador o agente debe copiar el snapshot a `libs/shared/data-access/openapi/openapi.v1.json`, ejecutar `npm run api:types` y confirmar las pruebas de tipos.
