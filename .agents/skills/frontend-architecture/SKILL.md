---
name: frontend-architecture
description: Guía y directrices de arquitectura para el desarrollo Frontend en Angular 22 y Nx Monorepo (NalunPos-Front). Usar al construir aplicaciones, componentes de UI, librerías compartidas o gestionar el estado reactivo.
---

<!-- Origen: D:\NalunPosApp\.agents\skills\frontend-architecture (copiado el 2026-11-05) -->

> **Nota:** En el frontend prevalecen siempre [`AGENTS.md`](../../AGENTS.md), [`docs/architecture/architecture.md`](../../docs/architecture/architecture.md) y los ADRs locales `0001–0014` (`docs/architecture/adr/`). Este skill resume las directrices esenciales para agentes y desarrolladores sin duplicar especificaciones normativas.

# NalunPos Frontend Architecture Skill (Angular 22 / Nx Monorepo)

## 1. Estructura del Monorepo Nx y Fronteras de Módulos

Para reglas de aislamiento e invariantes estrictos, consultar [AGENTS.md (secciones 2 y 3)](../../AGENTS.md#2-reglas-no-negociables-strict-invariants) y [docs/architecture/architecture.md](../../docs/architecture/architecture.md).

1. **Aplicaciones (`apps/`)**:
   - `NalunPos-Admin-Web`: Panel de control de plataforma para SuperAdmin (Control Plane). Tagged: `["scope:admin", "type:app"]`.
   - `NalunPos-Web`: Panel operativo comercial (TenantAdmin, Cajero, Inventario). Tagged: `["scope:client", "type:app"]`.
2. **Librerías Compartidas (`libs/shared/`)**:
   - `auth`: `AuthService`, guards funcionales (`authGuard`, `roleGuard`), gestión de sesión y los interceptores `authTokenInterceptor` (2°) y `sessionExpiredInterceptor` (3°). Tagged: `["scope:shared", "type:auth"]`.
   - `data-access`: Clientes HTTP base, configuración dinámica `APP_CONFIG`, modelos de error (`AppError`, `ProblemDetails`) y los interceptores `correlationIdInterceptor` (1°) y `errorInterceptor` (4°). Tagged: `["scope:shared", "type:data-access"]`.
   - `ui`: Componentes de presentación puros desacoplados de llamadas HTTP directas. Tagged: `["scope:shared", "type:ui"]`.
   - `util`: Funciones auxiliares puras, pipes de formateo (`AppDatePipe`, `AppNumberPipe`) y tokens desacoplados de inyección como `AUTH_GATEWAY` e interfaz `AuthGateway` ([`libs/shared/util/src/tokens/nav-config.interface.ts`](../../libs/shared/util/src/tokens/nav-config.interface.ts)). Tagged: `["scope:shared", "type:util"]`.
   - `design-tokens`: Tokens visuales y temas unificados (CSS/JSON). Tagged: `["scope:shared", "type:design-tokens"]`.

## 2. Cadena de Interceptores HTTP y Mecánica Bidireccional

La cadena HTTP está registrada en `app.config.ts` de ambas aplicaciones. Su orden exacto y mecánica de ejecución bidireccional es:

1. `correlationIdInterceptor` (`data-access`): Inyecta la cabecera `X-Correlation-Id` con UUIDv4 único en la solicitud saliente.
2. `authTokenInterceptor` (`auth`): Inyecta `Authorization: Bearer <token>` tras validar coincidencia estricta de origen contra `apiUrl` (ADR 0014).
3. `sessionExpiredInterceptor` (`auth`): Pasa la petición hacia adelante. En retorno de error, intercepta fallos de autenticación 401 (despachando logout/redirección a login) y 403 (`/forbidden`), consumiendo el error estructurado mediante `extractHttpStatus`.
4. `errorInterceptor` (`data-access`): Pasa la petición a la red y, en el flujo de retorno de error, es el PRIMERO en atrapar `HttpErrorResponse` nativo para transformarlo en `AppError`.
   _Detalle completo en [AGENTS.md sección 4](../../AGENTS.md#4-cadena-de-interceptores-http-y-mecánica-bidireccional)._

## 3. Seguridad, Configuración en Runtime y CSP

Para la política completa, consultar [AGENTS.md sección 5](../../AGENTS.md#5-seguridad-frontend-y-gestión-de-configuración) y ADRs `0003`, `0009`, `0012` y `0014`.

- **`config.json` fuera del bundle**: No se incluye ningún archivo `config.json` dentro del bundle de producción compilado ni en `public/`. Se versionan plantillas en `apps/<app>/config/config.example.json` y el entorno de hosting aprovisiona `/config.json` dinámicamente en runtime.
- **Almacenamiento de Tokens Zero-Trust**: Tokens gestionados en memoria volátil (Signals). Prohibido `localStorage` y `sessionStorage` para credenciales de acceso JWT bajo el modelo de refresh token en cookie HttpOnly.
- **Content Security Policy (CSP)**: `default-src 'self'`; `script-src 'self'` con hash SHA-256 para scripts inline (sin `'unsafe-inline'`); `style-src 'self' 'unsafe-inline'` (requerido por Tailwind CSS v4 y Angular Material M3); `connect-src 'self' https://api.nalunpos.com` (origen canónico estricto según ADR 0014). Validado automáticamente con `npm run verify:csp`.

## 4. Arquitectura Visual & UI Enterprise

- **Angular Material (~22.2.0)**: Reservado exclusivamente para componentes complejos y accesibles (tablas, ordenamiento, paginación, datepickers, diálogos, snackbars). Prohibido sobreescribir estilos internos con `!important`.
- **Tailwind CSS v4**: Utilizado para layouts (`flex`/`grid`), espaciados, tipografías y efectos visuales.
- **Estética Enterprise**: Esquemas sobrios, consistentes y profesionales con paletas de tokens (`brand`, `neutral`, `emerald`, `crimson`), layouts limpios y micro-interacciones sutiles.

## 5. Gestión de Estado & Formularios

- **100% Signal-First**: Manejo de estado nativo con `signal`, `computed` y `linkedSignal` (ADR 0002). No usar NgRx ni librerías externas de gestión de estado.
- **Signal Forms**: Convención estándar para formularios reactivos alineados con Signals (ADR 0006).
