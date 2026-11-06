# Estado Vivo del Monorepo (STATUS)

**Fecha de Actualización:** 2026-11-06  
**Rama Base:** `main`  
**Estado de Auditoría:** Vigente en rama `main` (FRONT FASE 0.4)

Este documento refleja el estado real, empírico y verificable del frontend de NalunPos (`NalunPos-Front`). Toda métrica, cifra de cobertura, tamaño de bundle y resultado de seguridad proviene de ejecuciones directas realizadas en el entorno de integración continua y desarrollo.

---

## 1. Resumen Ejecutivo: Hecho / Deuda / Pendiente

| Dimensión                                   | Estado Actual | Detalle Técnico                                                                                   |
| :------------------------------------------ | :-----------: | :------------------------------------------------------------------------------------------------ |
| **Arquitectura de Monorepo (Nx)**           |   Completo    | Angular 22, Tailwind CSS v4, Signals y Signal Forms, ESLint 9 Flat Config.                        |
| **Políticas de Seguridad y CSP**            |   Completo    | Estrategia fail-closed, `verify:csp` en CI, SHA-256 en Beasties, segregación de entornos.         |
| **Pruebas Unitarias (Vitest)**              |    Parcial    | 165 tests pasando (100% éxito); `libs/shared/*` con 94.75% de cobertura, pero `apps/*` en 12.95%. |
| **Pruebas End-to-End (Playwright)**         |   Completo    | 8 smoke tests pasando en CI para `NalunPos-Web` y `NalunPos-Admin-Web`.                           |
| **Budgets de Producción**                   |   Completo    | `NalunPos-Admin-Web`: 453.28 kB; `NalunPos-Web`: 460.03 kB (ambos bajo el budget de 500 kB).      |
| **Auditoría de Vulnerabilidades**           |  Controlado   | 0 vulnerabilidades altas/críticas; 18 moderadas en devDependencies de tooling.                    |
| **Contrato de Roles (Backend ↔ Frontend)** |  **CRÍTICO**  | Mapeo fail-open en `user-session.model.ts:43`; requiere actualización de contrato backend.        |

---

## 2. Métricas Reales Verificadas

### 2.1 Pruebas Unitarias y Cobertura V8 (`npx vitest run --coverage`)

- **Suites de Pruebas:** 28 pasadas de 28 ejecutadas.
- **Pruebas Unitarias:** 165 pasadas de 165 ejecutadas (100% de éxito).
- **Cobertura Global del Monorepo:** 43.95% Líneas (574/1306), 44.17% Sentencias, 42.36% Ramas, 39.89% Funciones.

#### Desglose de Cobertura por Zona:

| Zona del Monorepo               | Cobertura de Líneas (%) | Líneas Cubiertas / Totales |
| :------------------------------ | :---------------------: | :------------------------: |
| `libs/shared/util`              |       **100.00%**       |          32 / 32           |
| `libs/shared/auth`              |       **98.13%**        |         105 / 107          |
| `libs/shared/data-access`       |       **98.13%**        |         105 / 107          |
| `libs/shared/ui`                |       **91.16%**        |         227 / 249          |
| **Consolidado `libs/shared/*`** |       **94.75%**        |       **469 / 495**        |
| **Consolidado `apps/*`**        |       **12.95%**        |       **105 / 811**        |

### 2.2 Pruebas End-to-End (`e2e/*.smoke.spec.ts`)

- **Total de Smoke Tests E2E:** 8 pasados.
  - `e2e/nalunpos-admin-web.smoke.spec.ts`: 4 tests (carga sin errores, verificación estricta de CSP, validación de campos y autenticación SuperAdmin mock).
  - `e2e/nalunpos-web.smoke.spec.ts`: 4 tests (carga de login sin errores, verificación de CSP, validación de formulario vacío y autenticación mock con redirección al dashboard).

### 2.3 Tamaños de Bundles de Producción (`npx nx run-many -t build -c production --skip-nx-cache`)

| Aplicación           | Tamaño Raw Inicial | Transferencia Estimada | Budget Inicial Configurado | Margen Disponible |
| :------------------- | :----------------: | :--------------------: | :------------------------: | :---------------: |
| `NalunPos-Admin-Web` |   **453.28 kB**    |       101.78 kB        |         500.00 kB          |     +46.72 kB     |
| `NalunPos-Web`       |   **460.03 kB**    |       103.11 kB        |         500.00 kB          |     +39.97 kB     |

- Desglose `NalunPos-Admin-Web`: `main-UEA5SAZM.js` (315.82 kB raw / 86.14 kB transfer), `styles-QRATQTEO.css` (137.46 kB raw / 15.64 kB transfer).
- Desglose `NalunPos-Web`: `main-T2LEEJPF.js` (323.40 kB raw / 87.65 kB transfer), `styles-2KA3LEAD.css` (136.63 kB raw / 15.47 kB transfer).

### 2.4 Auditoría de Seguridad de Dependencias (`npm audit`)

- **`npm audit --audit-level=high`:** **0 vulnerabilidades** de severidad alta o crítica (código de salida: 0).
- **`npm audit` (completo):** 18 vulnerabilidades de severidad moderada asociadas a `minimatch 7.0.0 - 11.0.0` (GHSA-g3hv-75wg-m249: potencial DoS por amplificación de globparts).
  - Árbol de dependencias afectado: exclusivamente herramientas de desarrollo (`@nx/devkit`, `@nx/angular`, `@nx/eslint`, `@nx/playwright`, `@typescript-eslint/parser`, etc.).
  - Presencia en producción: **Cero**. Ni `minimatch` ni `@nx/*` se incluyen en los bundles de producción distribuidos en `dist/apps/*/browser/`.
  - Acción requerida: mantener sin cambios destructivos hasta que el equipo de Nx publique versiones compatibles sin forzar regresión a `nx@17.2.8`.

---

## 3. Registro de Deuda Técnica y Riesgos Conocidos

### 1. Cobertura de Pruebas Unitarias en Pantallas Operativas (`apps/*`)

- **Estado:** Las librerías compartidas cuentan con **94.75%** de cobertura, pero las páginas operativas de `apps/NalunPos-Web` presentan un **12.95%** de cobertura de líneas (105/811).
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

- **Estado:** 4 ADRs (`0003`, `0004`, `0009`, `0012`) cuentan con la estructura completa de encabezados estándar (`## Contexto`, `## Decisión`, `## Consecuencias`). 10 ADRs históricos (`0001`, `0002`, `0005`, `0006`, `0007`, `0008`, `0010`, `0011`, `0013`, `0014`) están catalogados para normalización de encabezados en una tarea futura de limpieza documental.

### 7. RIESGO CRÍTICO DE ROLES (Prioridad Inmediata tras Cierre Documental)

- **Diagnóstico del Riesgo:**
  - Existe una discrepancia sustancial de nomenclatura entre los roles definidos en el backend (`NalunPos-Api`: `Cajero`, `InventoryManager`, `Supervisor` ausente en frontend) y los reconocidos en el frontend (`USER_ROLES = ['SuperAdmin', 'TenantAdmin', 'Cashier', 'Inventory']` en `libs/shared/auth/src/interfaces/auth.interfaces.ts`).
  - El endpoint de autenticación backend (`LoginResponse`) retorna únicamente el `RoleId` numérico/Guid sin el nombre textual del rol, y el token JWT solo emite el claim `ClaimTypes.Role` para usuarios con rol `SuperAdmin`.
  - Como mecanismo de tolerancia temporal ante la falta de nombres de roles en el backend, la línea 43 de `libs/shared/auth/src/models/user-session.model.ts` asigna:
    ```typescript
    let role: UserRole = 'SuperAdmin';
    ```
    lo que produce un comportamiento _fail-open_, donde cualquier usuario autenticado sin claim explícito recibe privilegios elevados en el cliente.
- **Orden Estricto de Ejecución Registrado:**
  1. **Completar Pasos 3, 4 y 5 de Cierre Documental (`FRONT FASE 0.4`):** Asegurar el monorepo, auditorías y guías operativas.
  2. **Actualización del Contrato de Roles en Backend (PRIMERO):** El backend debe emitir el nombre canónico del rol en `LoginResponse` y como claim tipado en el JWT para todos los roles del sistema (`SuperAdmin`, `TenantAdmin`, `Cashier`, `Inventory`, `Supervisor`).
  3. **Adopción en Frontend y Operación Fail-Closed (SEGUNDO):** Adoptar los nombres canónicos en el frontend, eliminar la asignación por defecto `'SuperAdmin'`, conmutar a una política estricta de denegación por defecto (_fail-closed_) y añadir cobertura de pruebas unitarias por cada caso de rol.
  4. **Inicio de Lógica de Negocio:** Comenzar la implementación de las pantallas operativas y flujos de negocio garantizando el control de acceso en cada vista.
