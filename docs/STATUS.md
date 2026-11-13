# Estado Vivo del Monorepo (STATUS)

**Fecha de Actualización:** 2026-11-12  
**Rama Base:** `main`  
**Estado de Auditoría:** Vigente en rama `main` (Cierre de Contrato de Roles y Seguridad Fail-Closed)

Este documento refleja el estado real, empírico y verificable del frontend de NalunPos (`NalunPos-Front`). Toda métrica, cifra de cobertura, tamaño de bundle y resultado de seguridad proviene de ejecuciones directas realizadas en el entorno de integración continua y desarrollo.

---

## 1. Resumen Ejecutivo: Hecho / Deuda / Pendiente

| Dimensión                                   | Estado Actual | Detalle Técnico                                                                                                                  |
| :------------------------------------------ | :-----------: | :------------------------------------------------------------------------------------------------------------------------------- |
| **Arquitectura de Monorepo (Nx)**           |   Completo    | Angular 22, Tailwind CSS v4, Signals y Signal Forms, ESLint 9 Flat Config.                                                       |
| **Políticas de Seguridad y CSP**            |   Completo    | Estrategia fail-closed, `verify:csp` en CI, SHA-256 en Beasties, segregación de entornos.                                        |
| **Pruebas Unitarias (Vitest)**              |    Parcial    | 246 tests pasando en 29 suites (100% éxito); `libs/shared/*` con 95.51% líneas (`libs/shared/auth` 100.00%), `apps/*` en 12.94%. |
| **Pruebas End-to-End (Playwright)**         |   Completo    | 11 tests E2E pasando en CI (`NalunPos-Web` y `NalunPos-Admin-Web`, incluyendo contrato fail-closed y guards por app).            |
| **Budgets de Producción**                   |   Completo    | `NalunPos-Admin-Web`: 453.76 kB; `NalunPos-Web`: 461.10 kB (ambos bajo el budget de 500 kB).                                     |
| **Auditoría de Vulnerabilidades**           |  Controlado   | 0 vulnerabilidades altas/críticas; 18 moderadas en devDependencies de tooling.                                                   |
| **Contrato de Roles (Backend ↔ Frontend)** | **RESUELTO**  | **100% Cerrado (2026-11-12):** Roles canónicos + fail-closed (`ADR 0023` backend / `ADR 0015` frontend).                         |

---

## 2. Métricas Reales Verificadas

### 2.1 Pruebas Unitarias y Cobertura V8 (`npx vitest run --coverage`)

- **Suites de Pruebas:** 29 pasadas de 29 ejecutadas.
- **Pruebas Unitarias:** 246 pasadas de 246 ejecutadas (100% de éxito).
- **Cobertura Global del Monorepo:** 45.76% Líneas (616/1346), 45.83% Sentencias (688/1501), 45.23% Ramas (313/692), 41.56% Funciones (165/397).

#### Desglose de Cobertura por Zona:

| Zona del Monorepo               | Cobertura de Líneas (%) | Líneas Cubiertas / Totales |
| :------------------------------ | :---------------------: | :------------------------: |
| `libs/shared/util`              |       **100.00%**       |          32 / 32           |
| `libs/shared/auth`              |       **100.00%**       |         147 / 147          |
| `libs/shared/data-access`       |       **98.13%**        |         105 / 107          |
| `libs/shared/ui`                |       **91.16%**        |         227 / 249          |
| **Consolidado `libs/shared/*`** |       **95.51%**        |       **511 / 535**        |
| **Consolidado `apps/*`**        |       **12.94%**        |       **105 / 811**        |

> **Nota de Trazabilidad Histórica sobre la Base de Cobertura:**  
> A partir del commit `d14aeb1` (Paso 2A), la exclusión en `vitest.config.ts` se restringió de `'**/*.model.ts'` (que excluía indiscriminadamente todos los modelos) a `'libs/shared/data-access/src/models/**/*.model.ts'` (modelos que son interfaces puras sin código ejecutable). Esto incorporó a la medición de cobertura real los archivos `user-role.model.ts` y `user-session.model.ts` de `libs/shared/auth`, los cuales albergan la lógica ejecutable de validación de contratos fail-closed con 100% de cobertura. Esta inclusión explica la variación formal respecto a la base histórica previa (43.95% global / 94.75% shared), situando la métrica real verificada en **45.76% global** y **95.51% en librerías compartidas**.

### 2.2 Pruebas End-to-End (`e2e/*.smoke.spec.ts`)

- **Total de Tests E2E:** 11 pasados.
  - `e2e/nalunpos-web.smoke.spec.ts`: 6 tests (carga de login sin errores, verificación de CSP, validación de formulario vacío, autenticación `Cajero` mock con redirección a `/dashboard`, rechazo fail-closed en `/login` ante rol no canónico sin crear sesión en `sessionStorage`, y redirección a `/forbidden` cuando `SuperAdmin` intenta acceder al layout de `NalunPos-Web`).
  - `e2e/nalunpos-admin-web.smoke.spec.ts`: 5 tests (carga sin errores, verificación estricta de CSP, validación de campos, autenticación `SuperAdmin` mock con redirección a `/dashboard`, y redirección a `/forbidden` cuando un rol de tenant intenta acceder al layout de `NalunPos-Admin-Web`).

### 2.3 Tamaños de Bundles de Producción (`npx nx run-many -t build -c production --skip-nx-cache`)

| Aplicación           | Tamaño Raw Inicial | Transferencia Estimada | Budget Inicial Configurado | Margen Disponible |
| :------------------- | :----------------: | :--------------------: | :------------------------: | :---------------: |
| `NalunPos-Admin-Web` |   **453.76 kB**    |       101.84 kB        |         500.00 kB          |     +46.24 kB     |
| `NalunPos-Web`       |   **461.10 kB**    |       103.31 kB        |         500.00 kB          |     +38.90 kB     |

- Desglose `NalunPos-Admin-Web`: `main-BOG6NUUM.js` (316.30 kB raw / 86.20 kB transfer), `styles-QRATQTEO.css` (137.46 kB raw / 15.64 kB transfer).
- Desglose `NalunPos-Web`: `main-YLPXATXN.js` (324.47 kB raw / 87.85 kB transfer), `styles-2KA3LEAD.css` (136.63 kB raw / 15.47 kB transfer).

### 2.4 Auditoría de Seguridad de Dependencias (`npm audit`)

- **`npm audit --audit-level=high`:** **0 vulnerabilidades** de severidad alta o crítica (código de salida: 0).
- **`npm audit` (completo):** 18 vulnerabilidades de severidad moderada asociadas a `minimatch 7.0.0 - 11.0.0` (GHSA-g3hv-75wg-m249: potencial DoS por amplificación de globparts).
  - Árbol de dependencias afectado: exclusivamente herramientas de desarrollo (`@nx/devkit`, `@nx/angular`, `@nx/eslint`, `@nx/playwright`, `@typescript-eslint/parser`, etc.).
  - Presencia en producción: **Cero**. Ni `minimatch` ni `@nx/*` se incluyen en los bundles de producción distribuidos en `dist/apps/*/browser/`.
  - Acción requerida: mantener sin cambios destructivos hasta que el equipo de Nx publique versiones compatibles sin forzar regresión a `nx@17.2.8`.

---

## 3. Registro de Deuda Técnica y Riesgos Conocidos

### 1. Cobertura de Pruebas Unitarias en Pantallas Operativas (`apps/*`)

- **Estado:** Las librerías compartidas cuentan con **95.51%** de cobertura (511/535), pero las páginas operativas de `apps/NalunPos-Web` y `apps/NalunPos-Admin-Web` presentan un **12.94%** de cobertura de líneas (105/811).
- **Alcance Afectado:** `category-list`, `category-form`, `kardex`, `stock-adjustment-form`, `stock-list`, `purchase-order-create`, `purchase-order-receive`, `supplier-form`, `supplier-list`, `warehouse-form`.
- **Plan de Acción:** Extender specs unitarios con los 4 estados de componente (`loading`, `empty`, `error`, `success`) en las siguientes fases.

### 2. Fase F1: Refresh Token en Cookie HttpOnly y Permisos Efectivos

- **Estado:** Actualmente la sesión se gestiona con access token y expiración en `sessionStorage` (ADR 0003 vigente).
- **Plan de Acción:** El ADR 0012 propone almacenar el access token en memoria y el refresh token en cookie `HttpOnly` `SameSite=Strict`, junto a un endpoint de permisos efectivos `GET /api/v1/auth/permissions`. Reservado para la Fase F1 tras la estabilización de contratos.

### 3. Aplicación `NalunPos-Landing`

- **Estado:** La arquitectura y etiquetas de límites (`scope:landing`, vetando acceso a `type:data-access` y `type:feature`) están preparadas en `eslint.config.js`. La aplicación aún no ha sido generada en `apps/`.

### 4. Conteo de Usos de `any` en Tests de UI

- **Estado:** Existen **47 usos de `any`** en el repositorio (**46 ocurrencias de `as any`** y **1 ocurrencia de `: any`** en `libs/shared/ui/src/layout/header.component.spec.ts:17`), concentrados exclusivamente en los specs de `libs/shared/ui/src/**/*.spec.ts`. Cero usos en código de producción (`apps/` o `libs/*/src/lib/`).

### 5. Endpoints de Modificación en `WarehouseApiService`

- **Estado:** `WarehouseApiService` (`libs/shared/data-access/src/services/warehouse-api.service.ts`) implementa operativamente `getWarehouses` y `createWarehouse`. Los métodos de modificación (`updateWarehouse` [PUT], `changeWarehouseStatus` [PATCH status] y `setDefaultWarehouse` [PATCH default]) sí están declarados en el servicio y lanzan errores descriptivos en espera de la activación de sus endpoints en el backend.

### 6. Normalización de Encabezados en ADRs Históricos

- **Estado:** De los 15 ADRs (`0001` a `0015`), **5 ADRs** (`0003`, `0004`, `0009`, `0012`, `0015`) cuentan con la estructura completa de encabezados estándar (`## Contexto`, `## Decisión`, `## Consecuencias`). 10 ADRs históricos (`0001`, `0002`, `0005`, `0006`, `0007`, `0008`, `0010`, `0011`, `0013`, `0014`) están catalogados para normalización de encabezados en una tarea futura de limpieza documental.

### 7. Contrato de Roles y Sesión Fail-Closed — **RESUELTO (100% Cerrado — 2026-11-12)**

- **Estado:** **RESUELTO (100% Cerrado)** el **2026-11-12**. Eliminado el mapeo _fail-open_ por defecto y formalizado el contrato canónico bidireccional.
- **Evidencia en Backend (`NalunPos-Api` commit `6bc7cb0`, `ADR 0023`):**
  - `docs/architecture/adr/0023-contrato-de-roles-y-sesion-de-autenticacion.md:1-99`: Formaliza los roles canónicos (`PlatformRoles.SuperAdmin`, `TenantRoles`), resolución fail-closed bajo RLS y contrato HTTP/JWT.
  - `src/Pos.Application/Authentication/Commands/Login/LoginResponse.cs:6-15` y `LoginCommandHandler.cs:49-69`: Emiten `Role` canónico plano junto a `RoleId`, `UserId`, `TenantId`, `Token`, `Email`, `FullName` y `ExpiresAtUtc`.
  - `src/Pos.Infrastructure/Authentication/AuthUserLookup.cs:58-83` y `JwtTokenGenerator.cs:27-91`: Exigen `SuperAdmin` ⇔ `(SuperAdminRoleId, TenantId == null)` y rechazan combinaciones inconsistentes o nombres reservados en roles de tenant.
- **Evidencia en Frontend (`NalunPos-Front`, [ADR 0015](./architecture/adr/0015-fail-closed-session-role-contract.md)):**
  - `libs/shared/auth/src/models/user-role.model.ts:6-43`: Define `EMPTY_GUID`, `PLATFORM_ROLES`, `TENANT_ROLES`, `USER_ROLES`, `isNonEmptyIdentifier`, `isUserRole` e `isRoleTenantCoherent` (100% cobertura V8).
  - `libs/shared/auth/src/models/user-session.model.ts:16-145`: Constructor `private` (`L17-25`), `isSuperAdmin` (`L31-33`) y validación única _fail-closed_ (`fromAuthResponse` `L52-66`, `fromStoredSession` `L72-87`, `validateAndCreate` `L89-144`; 100% cobertura V8).
  - `libs/shared/auth/src/services/auth.service.ts:57-74,90-109`: Aborta login con `AUTH_INVALID_SESSION` (401) si `UserSession.fromAuthResponse` devuelve `null` y purga `sessionStorage` si falla `fromStoredSession` (100% cobertura V8).
  - `libs/shared/auth/src/guards/auth.guards.ts:35-57`: `roleGuard` valida `isUserRole` e `isRoleTenantCoherent` (defensa en profundidad) antes de autorizar rutas (100% cobertura V8).
  - `apps/NalunPos-Admin-Web/src/app/app.routes.ts:23-60` y `apps/NalunPos-Web/src/app/app.routes.ts:25-90`: Aíslan los layouts protegidos con `canActivate: [authGuard, roleGuard(PLATFORM_ROLES)]` y `canActivate: [authGuard, roleGuard(TENANT_ROLES)]`, validado mediante E2E reales en `e2e/nalunpos-web.smoke.spec.ts:75-167` y `e2e/nalunpos-admin-web.smoke.spec.ts:73-128`.
