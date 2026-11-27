# Guía de Arquitectura, Estándares e Invariantes para Agentes y Desarrolladores — NalunPos Frontend

Este documento define las reglas de ingeniería, invariantes arquitectónicos, contratos de seguridad y directrices de operación que **cualquier agente autónomo o desarrollador humano DEBE cumplir estrictamente** al interactuar con el repositorio `NalunPos-Front`.

---

## 1. Visión General del Proyecto y Stack Tecnológica

**NalunPos-Front** es un monorepo de arquitectura empresarial basado en **Angular 22 Zoneless** y orquestado mediante **Nx**. Provee las interfaces web para el ecosistema punto de venta (POS) y plataforma multi-tenant de NalunPos.

### 1.1 Estructura del Monorepo

- **`apps/NalunPos-Web`**: Consola operativa de negocio para puntos de venta (POS, caja, inventario, almacenes, proveedores, clientes). Tagged: `["scope:web", "type:app"]`.
- **`apps/NalunPos-Admin-Web`**: Consola administrativa global de plataforma para SuperAdmin (gestión de tenants, suscripciones, monitoreo de sharding). Tagged: `["scope:admin", "type:app"]`.
- **`libs/shared/auth`**: Autenticación, control de sesiones, `AuthService`, interceptores HTTP, guards funcionales e interfaces de usuario. Tagged: `["scope:shared", "type:data-access"]`.
- **`libs/shared/data-access`**: Configuración dinámica de runtime (`APP_CONFIG`), interceptores de telemetría y error (`correlationIdInterceptor`, `errorInterceptor`), clientes HTTP base y modelos de dominio de error (`ProblemDetails`, `AppError`). Tagged: `["scope:shared", "type:data-access"]`.
- **`libs/shared/ui`**: Componentes de presentación visual pura (`AppShellComponent`, `HeaderComponent`, `SidebarComponent`, `BaseLoginComponent`, `PageHeroCardComponent`, `MetricsBentoGridComponent`, `QuickFilterBarComponent`, `AdvancedFilterDrawerComponent`, toasts y modales de confirmación). Tagged: `["scope:shared", "type:ui"]`.
- **`libs/shared/util`**: Utilidades puras, pipes de formateo (`AppDatePipe`, `AppNumberPipe`) y tokens desacoplados de inyección (`AUTH_GATEWAY`, `APP_NAV_CONFIG`, `LOGIN_CONFIG`). Tagged: `["scope:shared", "type:util"]`.
- **`libs/shared/design-tokens`**: Tokens de diseño semánticos unificados (`theme.css`) para Angular Material M3 y Tailwind CSS v4, y fuentes auto-alojadas. Tagged: `["scope:shared", "type:util"]`.
- **`tools/`**: Herramientas nativas de automatización y verificación en Node ESM puro (`verify-csp.mjs`).
- **`e2e/`**: Suites de pruebas end-to-end de humo y validación de CSP con Playwright.
- **`docs/`**: Documentación técnica, manual de cabeceras/CSP, registros históricos (`docs/architecture/history/`) y Registro de Decisiones de Arquitectura (`docs/architecture/adr/`).

### 1.2 Stack Tecnológica y Versiones Reales (Fuente: `package.json`)

| Tecnología / Paquete                       |   Versión Exacta    | Rol en el Ecosistema                                                     |
| :----------------------------------------- | :-----------------: | :----------------------------------------------------------------------- |
| **Angular Core / Common / Router / Forms** |      `~22.2.0`      | Framework web standalone, detección zoneless, control flow nativo        |
| **Angular Material**                       |      `~22.2.0`      | Sistema de componentes accesibles Material Design 3                      |
| **Angular Build / CLI**                    |      `~22.2.0`      | Herramientas de build y compilador Vite / Application Builder            |
| **Nx Monorepo Tools**                      |      `23.3.1`       | Gestión de dependencias, grafos de compilación, caché y boundaries       |
| **TypeScript**                             |      `~6.0.3`       | Compilación estricta y tipado de dominio                                 |
| **RxJS**                                   |      `~7.8.0`       | Flujos asíncronos y operadores reactivos HTTP                            |
| **Tailwind CSS**                           |       `4.3.3`       | Estilos utilitarios, layout CSS, micro-interacciones (@tailwindcss/vite) |
| **Vitest**                                 |      `4.1.12`       | Runner de pruebas unitarias ultrarrápido con jsdom                       |
| **@vitest/coverage-v8**                    |      `4.1.12`       | Reportes de cobertura nativa V8                                          |
| **Playwright Test**                        |      `1.63.0`       | Pruebas E2E de humo en navegadores Chromium headless                     |
| **ESLint / @angular-eslint**               | `9.31.0` / `22.0.0` | Linter estático y cumplimiento de fronteras arquitectónicas              |
| **Prettier**                               |       `3.6.2`       | Formateo consistente de código y documentación                           |
| **@fontsource/\***                         |  `5.3.0` – `5.3.9`  | Fuentes tipográficas 100% auto-alojadas (cero llamadas a CDNs externas)  |

---

## 2. Reglas No Negociables (Strict Invariants)

1. **Soluciones de Raíz, Prohibidos los Parches (Root Cause Only):**
   - Jamás introduzcas hacks, `@ts-ignore`, bypasses de tipado o wrappers innecesarios para silenciar un error. Si un tipo o interfaz falla, investiga y resuelve la causa raíz en el origen canónico.
2. **Una Sola Responsabilidad por Archivo (Single Responsibility):**
   - Cada archivo debe poseer un único propósito cohesivo: un servicio, un componente, una interfaz o un interceptor. No mezcles lógica de datos con componentes visuales.
3. **Estabilidad Primero:**
   - Ninguna modificación de código puede degradar la suite existente de pruebas unitarias o E2E, ni generar warnings en el build de producción.
4. **Cero Dependencias Comerciales de Pago (Zero Paid Lock-In):**
   - Se exigen dependencias gratuitas y de licencia FOSS permisiva (MIT, Apache-2.0, BSD, OFL), prohibiendo paquetes con licencias comerciales o servicios SaaS de pago. El hosting de referencia contemplado es hosting estático gratuito (por ejemplo, Cloudflare Pages).
5. **Presupuesto de Rendimiento Intocable (Initial Budget 500 kB):**
   - Cada aplicación (`apps/*/project.json`) tiene configurado un límite estricto de warning en `500kb` para el bundle inicial. Todo módulo de feature debe cargarse mediante lazy loading standalone (`loadChildren` / `loadComponent`).
6. **Cero Evasiones de Tipado en Código de Producción:**
   - Queda terminantemente prohibido el uso de `any`, `eslint-disable`, `@ts-ignore` o `@ts-nocheck` en archivos de producción (`apps/**/*.ts`, `libs/**/*.ts`).
7. **Prohibido el Uso de `console.*` en Código de Producción:**
   - La telemetría se procesa mediante interceptores (`correlationIdInterceptor`) y el modelo estructurado `AppError`. No dejes trazas de depuración en commits.
8. **Aislamiento Absoluto de Storage Web:**
   - `sessionStorage` y `localStorage` están **prohibidos en todo el código** de producción y pruebas. La sesión vive solo en memoria (`AuthService`, ADR 0012) y el refresh token reside en una cookie `HttpOnly` gestionada exclusivamente por el backend. ESLint bloquea ambos globals sin excepción para `libs/shared/auth`.
9. **Cero Módulos Obsoletos de Angular:**
   - Queda vetado el uso de `CommonModule`, `NgIf`, `NgFor`, `NgClass`, `NgStyle` o `NgSwitch`. Se exige 100% de sintaxis nativa de control de flujo (`@if`, `@for`, `@switch`, `@defer`) y componentes Standalone con `ChangeDetectionStrategy.OnPush`.
10. **Rutas de Backend Siempre bajo `/api/v1/`:**
    - Todo endpoint expuesto o consumido debe adherirse al esquema canónico: `${config.apiUrl}/api/v1/<recurso>`.
11. **Angular 22 Moderno y Zoneless:**
    - El estado reactivo se maneja con Signals (`signal`, `computed`, `effect`) e inyección de dependencias funcional (`inject()`). Cero NgRx tradicional.

---

## 3. Fronteras de Módulos (Nx Module Boundaries)

El archivo [`eslint.config.js`](./eslint.config.js) aplica la regla `@nx/enforce-module-boundaries` de manera estricta. Las dependencias permitidas se rigen por la siguiente matriz:

### 3.1 Restricciones por Scope (Ámbito)

| Source Tag          | Dependencias Permitidas (`onlyDependOnLibsWithTags`) | Dependencias Prohibidas                                        |
| :------------------ | :--------------------------------------------------- | :------------------------------------------------------------- |
| **`scope:web`**     | `scope:shared`, `scope:web`                          | `scope:admin`, `scope:landing`                                 |
| **`scope:admin`**   | `scope:shared`, `scope:admin`                        | `scope:web`, `scope:landing`                                   |
| **`scope:landing`** | `scope:shared`                                       | `scope:web`, `scope:admin`, `type:data-access`, `type:feature` |
| **`scope:shared`**  | `scope:shared`                                       | `scope:web`, `scope:admin`, `scope:landing`                    |

### 3.2 Restricciones por Tipo de Módulo

| Source Tag             | Dependencias Permitidas (`onlyDependOnLibsWithTags`)       |
| :--------------------- | :--------------------------------------------------------- |
| **`type:app`**         | `type:feature`, `type:ui`, `type:data-access`, `type:util` |
| **`type:feature`**     | `type:ui`, `type:data-access`, `type:util`                 |
| **`type:ui`**          | `type:ui`, `type:util`                                     |
| **`type:data-access`** | `type:data-access`, `type:util`                            |
| **`type:util`**        | `type:util`                                                |

### 3.3 El Caso Canónico de `AUTH_GATEWAY` (Inversión de Dependencias)

- `libs/shared/ui` (`type:ui`) **no puede** importar directamente `AuthService` de `libs/shared/auth` (`type:data-access`).
- **Solución Arquitectónica (ADR 0013):**
  - La interfaz `AuthGateway` y el token de inyección `AUTH_GATEWAY` se definen en [`libs/shared/util/src/tokens/nav-config.interface.ts`](./libs/shared/util/src/tokens/nav-config.interface.ts) (`type:util`).
  - `libs/shared/ui` consume `AUTH_GATEWAY` legítimamente (`type:ui` → `type:util`).
  - Las aplicaciones (`type:app`) proveen la implementación real en su `app.config.ts`:
    `{ provide: AUTH_GATEWAY, useExisting: AuthService }` (`type:app` puede vincular `type:data-access` a `type:util`).

---

## 4. Cadena de Interceptores HTTP y Mecánica Bidireccional

Ambas aplicaciones configuran idéntica cadena de interceptores en su `app.config.ts`:

```typescript
provideHttpClient(
  withFetch(),
  withInterceptors([
    correlationIdInterceptor, // 1° — Agrega X-Correlation-Id
    sessionExpiredInterceptor, // 2° — 401 de sesión (logout) y 403 (/forbidden)
    sessionRefreshInterceptor, // 3° — 401 protegido: refresh único + reintento
    authTokenInterceptor, // 4° — Agrega Authorization: Bearer <token>
    errorInterceptor, // 5° — Traduce HttpErrorResponse → AppError
  ]),
);
```

### 4.1 Flujo Bidireccional en la Ejecución HTTP

1. **Peticiones Salientes (Request — Izquierda a Derecha / 1° → 5°):**
   - **`correlationIdInterceptor` (1°)**: Genera y adjunta la cabecera `X-Correlation-Id` con un UUIDv4.
   - **`sessionExpiredInterceptor` (2°)**: Pasa la petición intacta vía `next(req)`.
   - **`sessionRefreshInterceptor` (3°)**: Captura el token al iniciar la petición y la deja pasar. En el retorno aplica la política de refresh (ADR 0017): un único `401` protegido dispara un refresh single-flight y **un solo reintento** marcado con `SESSION_RETRIED`; los endpoints `/auth/*` quedan excluidos.
   - **`authTokenInterceptor` (4°)**: Extrae el access token de `AuthService` y lo inyecta en `Authorization: Bearer <token>`. **Invariante de Seguridad (ADR 0014):** Comprueba coincidencia estricta de origen contra `apiUrl` (previene fugas de token ante colisiones de dominios o URLs malformadas). Al ejecutarse **después** de `sessionRefreshInterceptor`, el reintento recibe el token renovado.
   - **`errorInterceptor` (5°)**: Envía la petición a la red vía `next(req)`.

2. **Respuestas y Errores Entrantes (Response / Error — Derecha a Izquierda / 5° → 1°):**
   - **`errorInterceptor` (5° en la lista — PRIMERO en ejecutarse en retorno de error):**
     Atrapa **TODOS** los errores HTTP (`HttpErrorResponse`) mediante `catchError` y los convierte inmediatamente al modelo unificado `AppError` (traduciendo `ProblemDetails` RFC 7807 o errores de conexión con status 0).
   - **`authTokenInterceptor` (4° en la lista — SEGUNDO en retorno de error):**
     Deja pasar el error sin alterarlo.
   - **`sessionRefreshInterceptor` (3° en la lista — TERCERO en retorno de error):**
     Ante un `401` de un endpoint protegido y no reintentado (`SESSION_RETRIED`), renueva la sesión con `AuthService.refreshSession()` y reintenta una sola vez. Si el token ya cambió por otro refresh concurrente, reintenta sin refrescar. Si el refresh falla, propaga el error original.
   - **`sessionExpiredInterceptor` (2° en la lista — CUARTO en retorno de error):**
     Recibe el error ya sea original (`401`) o transformado (`AppError`). Mediante `extractHttpStatus(error)` extrae el código numérico:
     - Status `401`: Si la URL no es `/auth/login`, `/auth/refresh` ni `/auth/logout`, llama a `authService.logout()` y redirige a `/login`.
     - Status `403`: Redirige a `/forbidden`, salvo en `/auth/login`, `/auth/refresh` o `/auth/logout`, donde se propaga sin navegar.
     - Re-emite el `AppError` (`throwError(() => error)`) hacia los suscriptores.
   - **`correlationIdInterceptor` (1°)**:
     Deja pasar el error hacia el suscriptor final.

> [!WARNING]
> **Advertencia Estricta:** **NO** cambies el orden de los interceptores. Modificar el arreglo alterará la secuencia bidireccional y romperá los tests de integración. El orden canónico está fijado por el ADR 0017 y se valida en [`libs/shared/auth/src/interceptors/session-expired.interceptor.spec.ts`](./libs/shared/auth/src/interceptors/session-expired.interceptor.spec.ts).

### 4.2 Guard Asíncrono de Autenticación

`authGuard` devuelve `Observable<boolean | UrlTree>` a partir de `AuthService.ensureValidSession()`: una sesión vigente resuelve `true` sin refresh; una sesión con token vencido se refresca antes de activar la ruta; si no puede garantizarse, redirige a `/login` conservando el `returnUrl`. `roleGuard` y `guestGuard` permanecen síncronos sobre la sesión ya validada (ADR 0017).

---

## 5. Seguridad Frontend y Gestión de Configuración

1. **Token de Autorización:**
   - Exclusivamente gestionado por `AuthService` en memoria. El refresh token reside en la cookie `HttpOnly` `nalunpos_rt` emitida por el backend. Nunca leas ni escribas tokens en `localStorage`, `sessionStorage`, `IndexedDB` ni cookies accesibles por JavaScript (ADR 0012).
2. **Content Security Policy Fija en Producción (ADR 0014):**
   - La directiva `script-src` es estricta: incluye `'self'` y el hash SHA-256 del script inline generado por Angular CLI (`'sha256-LMY6wYoFV9I4wWzxaq1N/dTpl4iurQktw706UCHK3vM='`). **Cero `'unsafe-inline'` para scripts.**
   - La directiva `style-src` permite `'unsafe-inline'` debido a requerimientos de inyección dinámica de estilos de Tailwind CSS v4 y Angular Material M3.
   - `connect-src` lista únicamente `'self'` y el origen canónico fijo: `https://api.nalunpos.com`. Prohibido el comodín `*` o `localhost` en artefactos de producción.
3. **Inmutabilidad de Artefactos de Producción:**
   - Los builds de producción en `dist/` **NO** empaquetan `config.json`.
   - El despliegue suministra `/config.json` en runtime basándose en la plantilla [`apps/<app>/config/config.example.json`](./apps/NalunPos-Web/config/config.example.json) (ADR 0014).
   - En producción, si `/config.json` falta o falla, la aplicación opera bajo modo **fail-closed** deteniendo el arranque. En desarrollo local, se utiliza el fallback automático de `environment.ts`.

---

## 6. Comandos de Verificación Obligatorios

Antes de considerar cualquier tarea o paso como terminado, ejecuta la suite de validación completa desde la raíz:

```bash
# 1. Linting y límites de módulos en todos los proyectos
npm run lint

# 2. Verificación de estilo de código con Prettier
npm run format

# 3. Verificación de tipos OpenAPI v1 sin deriva (ADR 0016)
npm run api:types:check

# 4. Compilación limpia de producción sin caché
npx nx run-many -t build -c production --skip-nx-cache

# 5. Verificación automática de CSP y artefactos compilados en dist
npm run verify:csp

# 6. Pruebas unitarias completas con reporte de cobertura V8
npx vitest run --coverage

# 7. Pruebas E2E de humo en navegadores headless
npm run e2e

# 8. Auditoría de seguridad de dependencias
npm audit --audit-level=high
```

---

## 7. Lista Corta de "NO HAGAS ESTO" (Anti-Patrones Prohibidos)

- ❌ **NO** uses `npm install --force` ni modifiques `package-lock.json` manualmente.
- ❌ **NO** uses `git commit --amend` ni `git push --force` en ramas de trabajo sincronizadas.
- ❌ **NO** utilices `innerHTML` ni `DomSanitizer.bypassSecurityTrust*` bajo ninguna circunstancia.
- ❌ **NO** crees scripts inline en templates HTML sin auditar su impacto en la CSP.
- ❌ **NO** coloques archivos `config.json` de desarrollo en carpetas `public/`.
- ❌ **NO** importes librerías de `apps/*` desde `libs/*`.
- ❌ **NO** importes `AuthService` en `libs/shared/ui`; utiliza la abstracción `AUTH_GATEWAY` de `libs/shared/util`.
- ❌ **NO** incluyas cadenas de `localhost` en los artefactos generados para producción.
- ❌ **NO** inventes rutas de API que no empiecen por `/api/v1/`.

---

## 8. Gestión de Decisiones de Arquitectura (ADRs)

Cualquier cambio estructural, introducción de una nueva librería, alteración en el almacenamiento de credenciales o ajuste de fronteras de módulos requiere un ADR formal:

1. **Ubicación:** `docs/architecture/adr/`.
2. **Numeración:** Consecutiva de 4 dígitos, ej. `0015-<titulo-en-kebab-case>.md`.
3. **Formato:** Estructura basada en MADR con formato mínimo obligatorio: **`Contexto, Decisión, Consecuencias`** (dejando `Alternativas Evaluadas` como sección recomendada cuando aplique, no obligatoria).
4. **Registro:** Añadir la entrada al índice maestro en [`docs/architecture/adr/README.md`](./docs/architecture/adr/README.md) y referenciarlo en [`docs/architecture/architecture.md`](./docs/architecture/architecture.md).

---

## 9. Estado Actual y Deuda Técnica Conocida

El estado con cifras y fecha vigente está detallado en [`docs/STATUS.md`](./docs/STATUS.md):

1. **Cobertura Real por Zonas (`npx vitest run --coverage`):**
   - **Métricas Globales del Monorepo:** 45.76% de líneas (246 pruebas en 29 suites pasando al 100%).
   - **Zona de Librerías Core (`libs/shared/*`):** **95.51% de líneas** (511/535 líneas cubiertas):
     - `libs/shared/util`: **100.00% líneas** (32/32 líneas, 39/39 stmts, 3/3 funciones).
     - `libs/shared/auth`: **100.00% líneas** (147/147 líneas, 153/153 stmts, 31/31 funciones; 100% en `user-role.model.ts`, `user-session.model.ts`, `auth.service.ts` y `auth.guards.ts`).
     - `libs/shared/data-access`: **98.13% líneas** (105/107 líneas, 110/112 stmts, 31/31 funciones).
     - `libs/shared/ui`: **91.16% líneas** (227/249 líneas, 264/286 stmts, 62/65 funciones).
   - **Zona de Aplicaciones (`apps/*`):** **12.94% de líneas** (105/811 líneas cubiertas):
     - La mayor parte de vistas operativas y componentes en `apps/NalunPos-Web` y `apps/NalunPos-Admin-Web` carecen de tests unitarios de componente, lo que constituye la deuda prioritaria a saldar en la **Fase 1** del frontend.
2. **Autenticación Zero-Trust (ADR 0012) — RESUELTO (2026-11-26):**
   - El access token vive solo en memoria (`AuthService`) y el refresh token en la cookie `HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth` `nalunpos_rt`. El arranque se restaura con `POST /api/v1/auth/refresh` a través de `SessionRefreshCoordinator` (single-flight por pestaña + Web Locks `nalunpos-session-refresh`), sin `/auth/me` y sin storage local. El logout limpia memoria, navega a `/login` y revoca la cookie de forma no bloqueante; si la revocación falla, la cookie sobrevive hasta su expiración.
3. **Deuda de Landing Page:**
   - La etiqueta `scope:landing` está reservada en las reglas de ESLint, pero la aplicación correspondiente aún no ha sido generada en `apps/`.
4. **Tipado `any` en Pruebas Unitarias de UI:**
   - Existen exactamente **46 ocurrencias de `as any`** y **1 ocurrencia de `: any`** (en `header.component.spec.ts:17`), totalizando 47 usos de `any` concentrados exclusivamente en `libs/shared/ui/src/**/*.spec.ts` catalogados para refactorización en fases de limpieza de tests.
5. **Endpoints de Almacenes Pendientes en Backend:**
   - En `WarehouseApiService`, los métodos de modificación (`PUT`, `PATCH status`, `PATCH default`) lanzan errores descriptivos en espera de disponibilidad de endpoints en la API.
6. **Normalización de Encabezados en ADRs Históricos:**
   - De los 17 ADRs existentes (`0001` a `0017`), **7 ADRs** (`0003`, `0004`, `0009`, `0012`, `0015`, `0016` y `0017`) cumplen explícitamente con los tres encabezados mínimos (`Contexto`, `Decisión`, `Consecuencias`). Los **10 ADRs restantes** (`0001`, `0002`, `0005`, `0006`, `0007`, `0008`, `0010`, `0011`, `0013` y `0014`) no cuentan con la terna completa (los ADRs `0001`, `0002`, `0006`, `0007`, `0008`, `0010`, `0011`, `0013` y `0014` carecen de `## Contexto` explícito al residir en el párrafo introductorio o en razones, y el ADR `0005` carece de `## Consecuencias`), quedando catalogados para normalización en una tarea futura de limpieza documental sin alterar sus decisiones.
7. **Mapeo de rol de la sesión, contrato canónico y separación por app — RESUELTO (100% Cerrado — 2026-11-12):**
   - **Evidencia en Backend (`NalunPos-Api` commit `6bc7cb0`, `ADR 0023`):**
     - `docs/architecture/adr/0023-contrato-de-roles-y-sesion-de-autenticacion.md:1-99`: Formaliza los 5 roles canónicos (`PlatformRoles.SuperAdmin`, `TenantRoles`), resolución fail-closed bajo RLS y contrato estable HTTP/JWT.
     - `src/Pos.Application/Authentication/Commands/Login/LoginResponse.cs:6-15` y `LoginCommandHandler.cs:49-69`: Emiten el contrato plano con `Role` textual canónico, `RoleId`, `UserId`, `TenantId`, `Token`, `Email`, `FullName` y `ExpiresAtUtc`.
     - `src/Pos.Infrastructure/Authentication/AuthUserLookup.cs:58-83` y `JwtTokenGenerator.cs:27-91`: Exigen `(SuperAdminRoleId, TenantId == null)` para plataforma y fallan cerrado ante cualquier inconsistencia o colisión de nombres reservados.
   - **Evidencia en Frontend (`NalunPos-Front`, [`ADR 0015`](./docs/architecture/adr/0015-fail-closed-session-role-contract.md)):**
     - [`libs/shared/auth/src/models/user-role.model.ts:6-43`](./libs/shared/auth/src/models/user-role.model.ts#L6-L43): Define `EMPTY_GUID`, `PLATFORM_ROLES`, `TENANT_ROLES`, `USER_ROLES`, `isNonEmptyIdentifier`, `isUserRole` e `isRoleTenantCoherent`.
     - [`libs/shared/auth/src/models/user-session.model.ts:16-145`](./libs/shared/auth/src/models/user-session.model.ts#L16-L145): Constructor `private` (`L17-25`), `isSuperAdmin` (`L31-33`) y pipeline único fail-closed (`fromAuthResponse`, `fromStoredSession`, `validateAndCreate`) sin fallback a `'SuperAdmin'` ni roles legacy.
     - [`libs/shared/auth/src/services/auth.service.ts:57-74`](./libs/shared/auth/src/services/auth.service.ts#L57-L74): Rechaza respuestas inválidas con `AUTH_INVALID_SESSION` (401) sin persistir sesión, y `restoreSessionFromStorage` (`L90-109`) purga registros inválidos.
     - [`libs/shared/auth/src/guards/auth.guards.ts:35-57`](./libs/shared/auth/src/guards/auth.guards.ts#L35-L57): `roleGuard` valida `isUserRole` e `isRoleTenantCoherent` (defensa en profundidad) redirigiendo a `/forbidden`.
     - [`apps/NalunPos-Admin-Web/src/app/app.routes.ts:23-60`](./apps/NalunPos-Admin-Web/src/app/app.routes.ts#L23-L60) y [`apps/NalunPos-Web/src/app/app.routes.ts:25-90`](./apps/NalunPos-Web/src/app/app.routes.ts#L25-L90): Aplican `canActivate: [authGuard, roleGuard(PLATFORM_ROLES)]` y `canActivate: [authGuard, roleGuard(TENANT_ROLES)]` en los layouts protegidos, verificados por E2E en [`e2e/nalunpos-web.smoke.spec.ts`](./e2e/nalunpos-web.smoke.spec.ts) y [`e2e/nalunpos-admin-web.smoke.spec.ts`](./e2e/nalunpos-admin-web.smoke.spec.ts).
8. **Generación determinista de tipos desde OpenAPI v1 y prevención de deriva — RESUELTO (100% Cerrado — 2026-11-13):**
   - **Evidencia en Backend (`NalunPos-Api` commit `f867fb2`, `ADR 0024`):** Snapshot de contrato OpenAPI v1 versionado en `docs/api/openapi.v1.json` con detección de deriva en CI.
   - **Evidencia en Frontend (`NalunPos-Front`, [`ADR 0016`](./docs/architecture/adr/0016-openapi-generated-contract-types.md)):**
     - [`libs/shared/data-access/openapi/openapi.v1.json`](./libs/shared/data-access/openapi/openapi.v1.json): Snapshot local del contrato backend.
     - [`tools/generate-api-types.mjs`](./tools/generate-api-types.mjs): Script generador determinista con validación fail-closed de 0 `any` y 0 `eslint-disable`.
     - [`libs/shared/data-access/src/generated/openapi.types.ts`](./libs/shared/data-access/src/generated/openapi.types.ts): Tipos exportados vía `@nalunpos/shared/data-access`.
     - [`libs/shared/auth/src/interfaces/auth-openapi-contract.test-d.ts`](./libs/shared/auth/src/interfaces/auth-openapi-contract.test-d.ts): Verificación estática de tipos con `expectTypeOf` de Vitest Typecheck (`npm run test:types`).
     - Scripts `api:types` y `api:types:check` en `package.json` integrados en el flujo de CI (`.github/workflows/ci.yml`).

---

## 10. Skills de Agentes (`.agents/skills/`)

El repositorio cuenta con skills de agentes estructurados en `.agents/skills/` que proporcionan directrices especializadas y reglas de negocio para tareas específicas en el monorepo.

**Regla de Oro:** **La lectura del `SKILL.md` correspondiente es obligatoria antes de ejecutar cualquier tarea que cubra dicho dominio.** En caso de cualquier discrepancia histórica entre un skill y las decisiones del proyecto, **prevalecen siempre los ADRs (`docs/architecture/adr/`) y este documento (`AGENTS.md`)** hasta que el skill sea formalmente sincronizado.

| Skill                                | Ubicación en el Repositorio                                                                                          | Cuándo Usarlo / Dominio                                                                                                                                                                      |
| :----------------------------------- | :------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`frontend-architecture`**          | [`.agents/skills/frontend-architecture/SKILL.md`](./.agents/skills/frontend-architecture/SKILL.md)                   | Guía y directrices de arquitectura para desarrollo Frontend en Angular 22 y Nx Monorepo (construcción de aplicaciones, componentes UI, librerías compartidas y gestión del estado reactivo). |
| **`dependency-and-licensing`**       | [`.agents/skills/dependency-and-licensing/SKILL.md`](./.agents/skills/dependency-and-licensing/SKILL.md)             | Políticas de licenciamiento permisivo FOSS y reemplazo de dependencias comerciales (al evaluar o agregar nuevos paquetes npm al monorepo).                                                   |
| **`saas-multitenancy-and-security`** | [`.agents/skills/saas-multitenancy-and-security/SKILL.md`](./.agents/skills/saas-multitenancy-and-security/SKILL.md) | Arquitectura de multi-tenancy SaaS, aislamiento de datos, onboarding y seguridad (al trabajar con tenants, autenticación, claims o roles).                                                   |
| **`inventory-domain-rules`**         | [`.agents/skills/inventory-domain-rules/SKILL.md`](./.agents/skills/inventory-domain-rules/SKILL.md)                 | Reglas del dominio de inventario, Kardex/Ledger inmutable de stock y concurrencia optimista (al trabajar con vistas de stock, movimientos de almacén, transferencias o ajustes).             |

### 10.1 Skill complementario del workspace: `modern-web-guidance`

`modern-web-guidance` es una referencia de plataforma web (HTML, CSS y JavaScript nativos) instalada **a nivel de workspace**, no dentro del repositorio versionado. Se invoca como herramienta de consulta, no como dependencia de runtime, y su contenido **nunca** sustituye a los ADRs ni a este documento.

| Elemento            | Valor verificado                                                                                                                                                          |
| :------------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Skill               | `modern-web-guidance`                                                                                                                                                     |
| Ruta en disco       | `D:\NalunPosApp\.agents\skills\modern-web-guidance` (raíz del workspace, fuera de `NalunPos-Front`)                                                                       |
| Pin de instalación  | `D:\NalunPosApp\skills-lock.json` → `source: GoogleChrome/modern-web-guidance`, `commit 64a6d70`                                                                          |
| Licencia            | Apache-2.0 (permisiva; compatible con la política FOSS del ADR 0013)                                                                                                      |
| Contenido           | `SKILL.md` más 210 guías en 17 categorías (`ui-components`, `ui-behaviors`, `css`, `forms`, `html`, `js`, `performance`, `accessibility`, `security`, `visual-design`, …) |
| Invocación          | `npx -y modern-web-guidance@latest search "<consulta>"` y `npx -y modern-web-guidance@latest retrieve "<id>"`                                                             |
| Requisito operativo | Salida a red para resolver el paquete; sin red, `npx --offline`. Nunca se declara en `package.json`                                                                       |
| Cobertura de CI     | Ninguna: las 9 reglas de `verify:docs` solo escanean el repositorio, por lo que este skill no está versionado ni validado por CI                                          |

**Motivo de no vendorizar:** las 210 guías son contenido de terceros en inglés. Al copiarlas dentro de `.agents/skills/` quedan sujetas a las reglas documentales del monorepo y generan hallazgos ajenos al proyecto (se comprobó un falso positivo de `obsolete-terms` en `guides/forms/brand-consistent-forms.md`). Versionarlas exigiría editar contenido ajeno o relajar reglas de CI; ambas opciones se rechazan.

### 10.2 Jerarquía normativa (precedencia inquebrantable)

1. **ADRs vigentes** en `docs/architecture/adr/` (ADR 0001 a ADR 0017) y las guardas de CI.
2. **`AGENTS.md`** (este documento), incluida la Tabla de Blindaje Arquitectónico de §10.3.
3. **Skills versionados** en `NalunPos-Front/.agents/skills/`.
4. **`modern-web-guidance`** y cualquier guía externa: referencia de sintaxis, nunca autoridad arquitectónica.

Ninguna recomendación de `modern-web-guidance` autoriza una excepción. Si una guía propone algo incompatible (Reactive Forms, archivos `.css`, orígenes estáticos, polyfills sin revisión, `role="dialog"` manual, `!important`, etc.), **prevalece la regla local** y la divergencia se registra aquí. Una exención real exige un ADR nuevo, no un cambio directo de código.

### 10.3 Tabla de Blindaje Arquitectónico (invariantes que no se rompen jamás)

| #   | Invariante                         | ADRs                 | Regla vinculante                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| :-- | :--------------------------------- | :------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Fronteras Nx y licencias           | ADR 0001, 0011, 0013 | Prohibidas las dependencias cruzadas entre features de `apps/*/src/app/features/*`. Prohibidos Nx Cloud y cualquier herramienta comercial; solo licencias permisivas (MIT, Apache-2.0, BSD-3-Clause, OFL). Las entidades y clientes HTTP transversales viven solo en `libs/shared/data-access` y los tokens UI transversales solo en `libs/shared/util`: cero copias locales y cero wrappers de re-exportación.                                                                                                                    |
| 2   | Standalone explícito y zoneless    | ADR 0002, 0004       | Declarar siempre `standalone: true` de forma explícita en todo `@Component`, `@Directive` y `@Pipe` nuevo, junto con `ChangeDetectionStrategy.OnPush`, aunque Angular lo infiera. Prohibido `NgModule` y prohibido retirar `standalone: true` de código existente. Reactividad con Signals (`signal`, `computed`, `effect`, `input`, `output`, `model`) y control flow nativo (`@if`, `@for` con `track`, `@switch`, `@defer`); prohibidos NgRx tradicional y `*ngIf`, `*ngFor`, `*ngSwitch` en código nuevo.                      |
| 3   | Signal Forms exclusivos            | ADR 0006             | Todo formulario nuevo usa exclusivamente Signal Forms de `@angular/forms/signals` (`form()`, `schema()`, `submit()`). Prohibido importar `ReactiveFormsModule` o `FormsModule` en código nuevo, incluso si una guía externa sugiere Reactive Forms.                                                                                                                                                                                                                                                                                |
| 4   | Separación de estilos              | ADR 0005, 0008       | Prohibido crear archivos `.css` nuevos. Tailwind CSS v4 para layout y espaciado en plantillas HTML; SCSS para variables, Custom Properties y estilos de componente; Angular Material M3 para controles complejos. Prohibido `!important`.                                                                                                                                                                                                                                                                                          |
| 5   | Configuración pre-bootstrap y CSP  | ADR 0009, 0014       | `APP_CONFIG` se resuelve y valida **antes** de `bootstrapApplication()` en `main.ts` mediante `await loadAppConfig('/config.json', environment)` e inyección `{ provide: APP_CONFIG, useValue: config }`. Prohibidas URLs estáticas (`localhost`, orígenes fijos) y prohibido leer `environment` directamente desde servicios o componentes. CSP con hash en `script-src`: sin `'unsafe-inline'` para scripts y sin manejadores inline en plantillas.                                                                              |
| 6   | Contratos OpenAPI v1 y cadena HTTP | ADR 0016, 0017       | Prohibido escribir DTO a mano o adoptar generadores pesados basados en Axios o `fetch`. Los contratos se derivan de `libs/shared/data-access/openapi/openapi.v1.json` hacia `libs/shared/data-access/src/generated/openapi.types.ts` (0 `any`, 0 `eslint-disable`) y se consumen con `HttpClient`, preservando la cadena `correlationIdInterceptor` → `sessionExpiredInterceptor` → `sessionRefreshInterceptor` → `authTokenInterceptor` → `errorInterceptor`.                                                                     |
| 7   | Seguridad multi-tenant fail-closed | ADR 0003, 0012, 0015 | Sesión gobernada por `USER_ROLES` (`PLATFORM_ROLES` frente a `TENANT_ROLES`), `UserSession` con validación fail-closed y `roleGuard` en el layout raíz de cada aplicación (`NalunPos-Admin-Web` frente a `NalunPos-Web`). Prohibido persistir tokens en `localStorage`, `sessionStorage`, `IndexedDB` o cookies accesibles por JavaScript: el access token vive solo en memoria y el refresh token en la cookie `HttpOnly` `nalunpos_rt` (ADR 0012). El refresh de arranque se coordina con Web Locks y nunca bloquea el arranque. |
| 8   | Compilador TypeScript estricto     | ADR 0010             | Intactos los flags de `tsconfig.base.json` (`exactOptionalPropertyTypes: false`, `noImplicitOverride: true`, `noPropertyAccessFromIndexSignature: true`, `noUncheckedIndexedAccess: true`). Prohibidos `any` y `eslint-disable`.                                                                                                                                                                                                                                                                                                   |

### 10.4 Convenciones de plataforma admitidas (adaptadas a Angular 22)

`modern-web-guidance` describe HTML, CSS y JavaScript nativos. Al aplicarlo dentro de este monorepo se traduce obligatoriamente así:

- **Overlays modales:** usar `<dialog>` nativo abierto con `showModal()` o, de forma declarativa, con `command="show-modal"` y `commandfor`. Nombrarlo con `aria-labelledby` y cerrarlo con `<form method="dialog">` o `command="close"`, leyendo y reiniciando `dialog.returnValue` en el evento `close`. Prohibido añadir `role="dialog"`, `aria-modal`, trampas de foco manuales o conmutación de `inert`: el modal nativo ya los aporta. Nunca `show()` ni el atributo `open` para un modal.
- **Scroll bajo el modal:** son obligatorias las dos reglas CSS de la guía (`dialog:modal { overscroll-behavior: contain; }` y `dialog::backdrop { overflow: hidden; overscroll-behavior: contain; }`), escritas en el `.scss` del componente. Prohibido bloquear el scroll con `overflow: hidden` o `position: fixed` sobre `html` o `body`.
- **`closedby` y Baseline:** `closedby="any"` degrada de forma elegante donde no existe (Safari), ya que `Esc` y el gesto de retroceso siguen cerrando. Toda función fuera de Baseline Widely available (Invoker Commands, Popover) se adopta con detección de capacidad y degradación elegante, nunca con polyfill incondicional; añadir un polyfill exige revisión de dependencias y licencia (ADR 0013, ADR 0014).
- **Popover API:** para menús, tooltips y toasts (`popover`, `popovertarget`) cuando no exista un control Material M3 equivalente. Los diálogos de confirmación existentes basados en `MatDialog` se mantienen; migrarlos exige tarea propia y ADR.
- **Identificadores e instancias:** cada overlay necesita un `id` único por instancia (generado con Signals o mediante el índice de `@for`), y los atributos nuevos se enlazan con `[attr.*]` cuando el tipado de plantilla no los conozca.
- **Estilos:** los fragmentos CSS de las guías se traducen a Tailwind CSS v4 o al `.scss` del componente; nunca a un archivo `.css` nuevo y nunca con `!important`.
- **Plantillas:** los ejemplos en React o Vue no se copian; se adaptan a componente standalone, Signals y control flow nativo. Prohibidos `innerHTML`, `DomSanitizer.bypassSecurityTrust*` y los manejadores inline por CSP.
- **Alcance:** aplicar una guía a código existente es una tarea explícita y con pruebas; queda prohibido usar el flujo de modernización masiva (`legacy-scan`) como efecto colateral de otra tarea.
- **Trazabilidad:** cuando una guía origine una decisión de implementación, se cita su `id` y la regla textual aplicada en el reporte de la tarea.

---

## 11. Documentos de Referencia del Repositorio

- **Estado y Métricas Reales:** [`docs/STATUS.md`](./docs/STATUS.md)
- **Guía de Despliegue en Producción:** [`docs/deployment.md`](./docs/deployment.md)
- **Guía para Nuevas Features:** [`docs/guides/new-feature.md`](./docs/guides/new-feature.md)
- **Guía de Contribución y DoD:** [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- **Política de Seguridad:** [`SECURITY.md`](./SECURITY.md)
- **Arquitectura Frontend:** [`docs/architecture/architecture.md`](./docs/architecture/architecture.md)
- **Registro de ADRs (0001 a 0017):** [`docs/architecture/adr/README.md`](./docs/architecture/adr/README.md)
- **Cabeceras HTTP y Content Security Policy:** [`docs/security/headers-and-csp.md`](./docs/security/headers-and-csp.md)
