# Arquitectura Frontend — NalunPos Enterprise (Angular 22 Monorepo)

## 1. Propósito y Estructura Global

El ecosistema frontend de **NalunPos** está construido sobre un **Monorepo Nx** con **Angular 22** Zoneless, diseñado para máxima escalabilidad, rendimiento extremo y mantenibilidad a largo plazo (20+ años).

### 1.1 Aplicaciones (`apps/`)

- **`NalunPos-Admin-Web`**: Consola administrativa global para la gestión de la plataforma multi-tenant (SuperAdmin), monitoreo de sharding de bases de datos, métricas y administración de tenants.
- **`NalunPos-Web`**: Consola operativa de negocio (Admin Comercial / Tenant / Cajero), enfocada en el punto de venta (POS), ventas, inventario, almacenes, proveedores y clientes.

### 1.2 Librerías Compartidas (`libs/shared/`)

- **`libs/shared/auth`**: `AuthService`, `AuthApiClient`, `SessionRefreshCoordinator`, interceptores de autorización y control de sesión (`authTokenInterceptor`, `sessionExpiredInterceptor`, `sessionRefreshInterceptor`), guards funcionales (`authGuard`, `roleGuard`), interfaces tipadas y modelo de sesión de usuario `UserSession`.
- **`libs/shared/data-access`**: Configuración dinámica de runtime (`APP_CONFIG` resuelto antes del bootstrap), interceptores globales (`correlationIdInterceptor`, `errorInterceptor`) y modelos de error estandarizados (`ProblemDetails`, `AppError`).
- **`libs/shared/ui`**: Componentes visuales puros reutilizables (`AppShellComponent`, `HeaderComponent`, `SidebarComponent`, `BaseLoginComponent`, `PageHeroCardComponent`, `MetricsBentoGridComponent`, `QuickFilterBarComponent`, `AdvancedFilterDrawerComponent`, `NotificationService`).
- **`libs/shared/design-tokens`**: Fuente única de verdad visual M3 (`theme.css`), tokens de diseño semánticos y tipografías auto-alojadas (`@fontsource`).

---

## 2. Regla de Dependencias y Module Boundaries (Clean Architecture)

El monorepo hace cumplir fronteras arquitectónicas automáticas mediante `@nx/enforce-module-boundaries` en ESLint:

```mermaid
graph TD
    Web[apps/NalunPos-Web] --> Auth[shared/auth]
    Web --> DataAccess[shared/data-access]
    Web --> UI[shared/ui]
    Web --> Tokens[shared/design-tokens]

    Admin[apps/NalunPos-Admin-Web] --> Auth
    Admin --> DataAccess
    Admin --> UI
    Admin --> Tokens

    UI --> Tokens
    Auth --> DataAccess
```

1. **`apps/*`** consumen `libs/shared/*` según su scope (`scope:web`, `scope:admin`).
2. **`libs/shared/*`** **NUNCA** importan código de `apps/*`.
3. **`libs/shared/ui`** es de presentación pura; consume tokens de diseño y no realiza peticiones HTTP directas ni gestiona lógica de negocio.
4. **Cero Dependencias Circulares**: Cada capa tiene un flujo unidireccional estricto.

### 2.1 Cadena de Interceptores HTTP Funcionales y Orden Estricto

Ambas aplicaciones (`apps/NalunPos-Web/src/app/app.config.ts` y `apps/NalunPos-Admin-Web/src/app/app.config.ts`) configuran una cadena idéntica y estricta de interceptores HTTP funcionales mediante `provideHttpClient(withFetch(), withInterceptors([...]))`:

```typescript
withInterceptors([
  correlationIdInterceptor, // 1° — Agrega X-Correlation-Id
  sessionExpiredInterceptor, // 2° — 401 de sesión (logout) y 403 (/forbidden)
  sessionRefreshInterceptor, // 3° — 401 protegido: refresh único + reintento
  authTokenInterceptor, // 4° — Agrega Authorization: Bearer <token>
  errorInterceptor, // 5° — Traduce HttpErrorResponse → AppError
]);
```

#### Flujo Bidireccional de RxJS y Mecánica Real de la Cadena

En Angular `provideHttpClient(withInterceptors([...]))`, las peticiones y las respuestas/errores recorren el arreglo en sentidos opuestos:

1. **Flujo de Peticiones Salientes (Request — Izquierda a Derecha / 1° → 5°):**
   - **`correlationIdInterceptor` (1°)**: Genera y adjunta la cabecera `X-Correlation-Id` con un UUIDv4 único a la solicitud saliente antes de que continúe su viaje.
   - **`sessionExpiredInterceptor` (2°)**: Pasa la petición intacta hacia adelante invocando `next(req)`.
   - **`sessionRefreshInterceptor` (3°)**: Captura el token al iniciar la petición y la deja pasar. En el retorno aplica la política del ADR 0017: un `401` protegido dispara un refresh single-flight y un único reintento marcado con `SESSION_RETRIED`; solo las tres rutas anónimas (`/auth/login`, `/auth/refresh`, `/auth/logout`) quedan excluidas. `/auth/me` es protegida y sí se refresca.
   - **`authTokenInterceptor` (4°)**: Inyecta la cabecera `Authorization: Bearer <token>` obtenida desde `AuthService`, tras validar coincidencia exacta de origen contra `apiUrl` (ADR 0014) y mitigar colisiones de dominios o URLs malformadas. Al declararse después de `sessionRefreshInterceptor`, el reintento recibe el token renovado.
   - **`errorInterceptor` (5°)**: Pasa la petición directamente hacia el backend invocando `next(req)`.

2. **Flujo de Respuestas y Errores Entrantes (Response / Error — Derecha a Izquierda / 5° → 1°):**
   - **`errorInterceptor` (5° en la lista — PRIMERO en la ruta de retorno de error):**
     Al ser el último interceptor declarado, su operador `catchError` se ejecuta en primer lugar ante cualquier fallo de red o respuesta HTTP de error. Convierte **TODOS** los errores HTTP (`HttpErrorResponse`) en instancias fuertemente tipadas de `AppError` (traduciendo `ProblemDetails` RFC 7807 o generando mensajes estandarizados para errores 400, 401, 403, 404, 500 y fallo de conexión con status 0).
   - **`authTokenInterceptor` (4° en la lista — SEGUNDO en la ruta de retorno):**
     Deja pasar el error sin alterarlo.
   - **`sessionRefreshInterceptor` (3° en la lista — TERCERO en la ruta de retorno de error):**
     Ante un `401` de un endpoint protegido no reintentado (`SESSION_RETRIED = false`), invoca `authService.refreshSession()` y reintenta la petición una sola vez. Si el token actual ya difiere del capturado, otro refresh concurrente se completó y reintenta sin duplicar la llamada. Si el refresh falla, propaga el error original.
   - **`sessionExpiredInterceptor` (2° en la lista — CUARTO en la ruta de retorno de error):**
     Recibe el error original o el `AppError` transformado. La función `extractHttpStatus(error)` extrae polimórficamente el código numérico `status`:
     - Si el status es `401` y la petición no es un endpoint anónimo de autenticación (`/auth/login`, `/auth/refresh` o `/auth/logout`), invoca `authService.logout()`. Se excluyen los tres para evitar cierres de sesión espurios: un `401` en el login se propaga al formulario y un `401` en el refresh o el logout no debe generar un bucle `logout -> 401 -> logout`.
     - Si el status es `403`, redirige a la vista `/forbidden`, salvo en `/auth/login`, `/auth/refresh` o `/auth/logout`, donde se propaga sin navegar.
     - Finalmente, re-lanza el error (`throwError(() => error)`) para que los suscriptores y componentes consumidores reciban el `AppError` tipado.
   - **`correlationIdInterceptor` (1°)**:
     Deja pasar la respuesta o el error hacia el suscriptor final sin interferir en la sesión.

#### ¿Por qué es crítico este orden y Advertencia de Integración?

- `errorInterceptor` debe estar al final del arreglo para que sea el primero en atrapar el `HttpErrorResponse` nativo en el flujo de retorno y transformarlo en `AppError`.
- `sessionExpiredInterceptor` debe preceder a `sessionRefreshInterceptor` en el arreglo para que en el retorno de error se ejecute después de este: el refresh se intenta primero y solo si falla el `401` original llega a `sessionExpired`, única responsable de limpiar la sesión.
- `sessionRefreshInterceptor` debe preceder a `authTokenInterceptor` para que el reintento vuelva a entrar por `authToken` y reciba el token renovado (ADR 0017).

> [!WARNING]
> **Advertencia de Mantenibilidad:** **NO** reordenar los interceptores en `app.config.ts`. Cualquier alteración en el orden romperá el flujo bidireccional y las aserciones de integración. Toda modificación debe ser validada contra el test de integración de la cadena completa en [`libs/shared/auth/src/interceptors/session-expired.interceptor.spec.ts`](../../libs/shared/auth/src/interceptors/session-expired.interceptor.spec.ts) (`describe('Cadena Completa de Interceptores HTTP (Test de Integración Real)')`).

---

## 3. Patrón Feature Slice: Contenedores Inteligentes vs. Presentación Dumb

Cada módulo funcional (ej. `warehouses`, `categories`, `suppliers`) sigue una estructura modular estándar (ADR 0011):

```
features/<feature-name>/
├── components/          # Dumb components (presentación pura, inputs/outputs puros)
├── data-access/         # Servicios HTTP reactivos y adaptadores de datos
├── models/              # Interfaces, DTOs y tipos inmutables
├── pages/               # Smart/Container components (orquestación, señales, diálogos)
└── <feature>.routes.ts  # Rutas con lazy loading standalone
```

- **Smart / Container (`pages/`)**: Inyectan servicios, orquestan el estado reactivo con Signals (`signal`, `computed`), gestionan diálogos modales y emiten notificaciones.
- **Dumb / Presentation (`components/`)**: Reciben datos vía `input()` de Angular, emiten acciones del usuario vía `output()`, y mantienen `ChangeDetectionStrategy.OnPush` estricto sin inyectar servicios HTTP.

---

## 4. Diseño Visual: Material M3 + Tailwind CSS v4

Para erradicar conflictos de especificidad CSS y preservar una identidad visual empresarial:

1. **Angular Material M3**: Resuelve componentes complejos y accesibles (tablas con ordenamiento/paginación, diálogos, selectores, tooltips, snackbars).
2. **Tailwind CSS v4**: Resuelve layouts (`flex`/`grid`), micro-animaciones, efectos Glassmorphism y espaciados responsivos.
3. **Cero `!important`**: Queda estrictamente vetado el uso de `!important` en archivos de estilos. Toda personalización se deriva de tokens semánticos en `libs/shared/design-tokens/src/theme.css`.
4. **Tipografías Auto-Alojadas (Zero External Requests)**: Fuentes corporativas (`@fontsource/plus-jakarta-sans`, `@fontsource/inter`, `@fontsource/jetbrains-mono`, `@fontsource-variable/material-symbols-outlined`) alojadas localmente sin dependencias externas hacia CDN de Google Fonts.

---

## 5. Configuración en Runtime (12-Factor App)

Las aplicaciones no contienen URLs de backend hardcodeadas (ADR 0009 y ADR 0014):

- **Modelo en Producción**: El build de producción **NO** empaqueta ningún archivo `config.json` en `dist/` ni en `public/`. Los artefactos compilados son completamente inmutables.
- **Suministro Externo en Despliegue**: El entorno de hosting (Cloudflare Pages, Nginx, CDN o contenedor) provee `/config.json` copiando y adaptando la plantilla `apps/<app>/config/config.example.json` junto a los artefactos estáticos (ADR 0014).
- **Inyección y Validación Fuerte**: En el arranque (`main.ts`), `provideAppInitializer()` solicita `/config.json`, validándolo estrictamente mediante `validateAppConfig` e inyectándolo a través del token fuertemente tipado `APP_CONFIG`.
- **Desarrollo Local vs Producción**:
  - En desarrollo, si `/config.json` no está presente, se utiliza un fallback transparente derivado de `environment.ts` (`https://localhost:7232`).
  - En producción, opera bajo un principio **fail-closed**: si `/config.json` no existe (HTTP 404) o sus campos son inválidos, la aplicación detiene su inicialización e impide realizar peticiones a endpoints no autorizados.
- **Principio "Build Once, Deploy Anywhere"**: El mismo artefacto compilado se despliega en cualquier infraestructura modificando exclusivamente el archivo `/config.json` externo.

---

## 6. Estrategia de Calidad y Pruebas Automatizadas

1. **Pruebas Unitarias Rápidas con Vitest**:
   - Ejecutadas en entorno `jsdom` con inicialización JIT nativa de Angular 22 (`@angular/compiler` + `@angular/platform-browser/testing`).
   - Cobertura de código monitoreada con `@vitest/coverage-v8`: 246 tests unitarios en 29 suites pasando al 100%, con cobertura global de 45.76% de líneas (45.83% stmts, 45.23% branches, 41.56% funciones) en el monorepo y cobertura real por librería (`libs/shared/*`: 95.51% líneas):
     - **`libs/shared/util`**: 100.00% líneas (100% stmts, 100% branches, 100% funciones).
     - **`libs/shared/auth`**: 100.00% líneas (100% stmts, 94.82% branches, 100% funciones; 100% en `user-role.model.ts`, `user-session.model.ts`, `auth.service.ts` y `auth.guards.ts`).
     - **`libs/shared/data-access`**: 98.13% líneas (98.21% stmts, 93.05% branches, 100% funciones).
     - **`libs/shared/ui`**: 91.16% líneas (92.30% stmts, 63.96% branches, 95.38% funciones).
2. **Verificación Automatizada de Seguridad de Artefactos y CSP (`verify:csp`)**:
   - Herramienta nativa [`tools/verify-csp.mjs`](../../tools/verify-csp.mjs) ejecutada en CI tras el build de producción para validar la integridad de directivas CSP, hashes SHA-256 de scripts inline, ausencia total de `config.json` y de `localhost` en artefactos compilados.
3. **Pruebas E2E Smoke con Playwright**:
   - 11 pruebas end-to-end automatizadas en Chromium headless (`6` en `NalunPos-Web` y `5` en `NalunPos-Admin-Web`) con interceptación de red vía `page.route()`, incluyendo intercepción de `/config.json`, monitoreo de eventos DOM `securitypolicyviolation`, rechazo _fail-closed_ de roles no canónicos y separación de acceso `/forbidden` entre plataforma y tenant.

---

## 7. Directrices de Seguridad Frontend

- **Ausencia total de vulnerabilidades XSS**: 0 usos de `innerHTML` crudo y 0 usos de `bypassSecurityTrust*`.
- **Content Security Policy (CSP) Estricta (ADR 0014)**: Origen canónico fijo (`https://api.nalunpos.com`) en `connect-src`, hashes SHA-256 y cero `'unsafe-inline'` en `script-src`; `style-src` permite `'unsafe-inline'` por requerimiento dinámico de Tailwind CSS v4 y Angular Material M3, con prohibición absoluta de comodines `*` en orígenes de red.
- **Deduplicación Canónica de Datos y Tokens UI (ADR 0013)**: Centralización DRY de servicios de datos en `libs/shared/data-access` y abstracción desacoplada `AUTH_GATEWAY` en `libs/shared/util` (consumida por `libs/shared/ui` y provista en `apps/*` con `AuthService`).
- **Autenticación Zero-Trust (ADR 0012, implementada)**: access token solo en memoria (Signal de `AuthService`), refresh token en cookie `HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth` (`nalunpos_rt`), refresh de arranque vía `POST /api/v1/auth/refresh` coordinado con `SessionRefreshCoordinator` (single-flight por pestaña + Web Locks `nalunpos-session-refresh`) y logout que limpia memoria, navega a `/login` y revoca en servidor de forma no bloqueante.

---

## 8. Registro de Decisiones de Arquitectura (ADRs) y Registros Históricos

- **Contrato Canónico de Roles y Sesión Fail-Closed ([ADR 0015](./adr/0015-fail-closed-session-role-contract.md))**: Partición estricta de `PLATFORM_ROLES` (`SuperAdmin` ⇔ `tenantId === null`) y `TENANT_ROLES` (`TenantAdmin`, `Supervisor`, `InventoryManager`, `Cajero` ⇔ `tenantId` válido distinto de `EMPTY_GUID`), construcción única _fail-closed_ mediante `UserSession` con constructor privado y separación de acceso por layout raíz en `NalunPos-Admin-Web` y `NalunPos-Web`.
- **Generación de Tipos desde OpenAPI v1 y Prevención de Deriva ([ADR 0016](./adr/0016-openapi-generated-contract-types.md))**: Generación determinista de tipos TypeScript mediante `openapi-typescript` (`tools/generate-api-types.mjs`) a partir del snapshot OpenAPI v1 de `NalunPos-Api`, validación fail-closed de cero `any` y cero `eslint-disable`, y verificación de sincronización en CI con `npm run api:types:check`.
- **Índice Maestro de ADRs**: El registro maestro de decisiones se encuentra en [`docs/architecture/adr/README.md`](./adr/README.md), abarcando desde **ADR 0001** hasta **ADR 0016**.
- **Registros Históricos de Refactorización**:
  - [Refactor F0-4: Eliminación de Duplicación entre Apps y Extracción a Shared-UI](./history/refactor-f0-4-duplication-elimination.md).
