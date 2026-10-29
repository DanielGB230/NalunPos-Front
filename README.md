# NalunPos Ecosistema Frontend (Angular 22 / Nx Monorepo)

Monorepo de arquitectura empresarial desarrollado en **Angular 22** Zoneless y gestionado con **Nx**. Diseñado con principios de Clean Architecture, control de flujo nativo (`@if/@for/@defer`), Signals reactivos, tema Material M3 unificado y suites de calidad con Vitest y Playwright.

---

## 🚀 Comandos de Desarrollo y Operación

Todos los comandos deben ejecutarse desde la raíz del proyecto frontend (`d:\NalunPosApp\NalunPos-Front`):

### 1. Servidores de Desarrollo (Local Dev)

| Aplicación               | Descripción                                                     | Comando                           | URL Local               |
| :----------------------- | :-------------------------------------------------------------- | :-------------------------------- | :---------------------- |
| **`NalunPos-Web`**       | Panel Operativo de Negocio (POS, Ventas, Inventario, Almacenes) | `npx nx serve NalunPos-Web`       | `http://localhost:4200` |
| **`NalunPos-Admin-Web`** | Panel de SuperAdmin (Plataforma, Multi-Tenant, Sharding)        | `npx nx serve NalunPos-Admin-Web` | `http://localhost:4201` |

### 2. Compilación de Producción (Production Builds)

```bash
# Compilar ambas aplicaciones para producción
npm run build
# O usando Nx directamente con configuración de producción
npx nx run-many -t build -c production
```

### 3. Calidad de Código, Linting y Formateo

```bash
# Ejecutar ESLint con límites de módulo estrictos en todos los proyectos
npm run lint

# Verificar estilo de código con Prettier
npm run format

# Corregir formato automáticamente
npm run format:fix
```

### 4. Pruebas Unitarias y Cobertura (Vitest)

```bash
# Ejecutar suite completa de pruebas unitarias
npx vitest run

# Ejecutar pruebas unitarias con reporte de cobertura de código (>70%)
npx vitest run --coverage
```

### 5. Pruebas E2E de Humo (Playwright)

```bash
# Ejecutar pruebas de humo E2E automatizadas con mocks de red
npm run e2e
# O mediante Playwright CLI
npx playwright test
```

---

## 🏛️ Estructura del Monorepo

```
NalunPos-Front/
├── .github/
│   ├── workflows/ci.yml        # Pipeline CI de GitHub Actions (Lint, Test, Build, Audit, E2E)
│   └── dependabot.yml          # Actualizaciones semanales automatizadas
├── apps/
│   ├── NalunPos-Web/           # Aplicación POS Operativa Standalone (Angular 22)
│   └── NalunPos-Admin-Web/     # Aplicación Consola SuperAdmin Standalone (Angular 22)
├── libs/shared/
│   ├── auth/                   # AuthService, Guards, Interceptors, DTOs de Sesión
│   ├── data-access/            # Token APP_CONFIG, Correlation-ID, Error Interceptor
│   ├── ui/                     # Componentes visuales reutilizables, Layouts, Toasts
│   └── design-tokens/          # Tokens M3 centralizados (theme.css), fuentes auto-alojadas
├── docs/
│   ├── architecture/
│   │   ├── architecture.md     # Documento maestro de arquitectura frontend
│   │   └── adr/                # Registro de Decisiones de Arquitectura (ADR 0001 - 0012)
│   └── security/
│       └── headers-and-csp.md  # Cabeceras de seguridad y Content Security Policy
├── playwright.config.ts        # Configuración de pruebas E2E multi-proyecto
├── vitest.config.ts            # Configuración de Vitest con entorno JSDOM y cobertura V8
├── eslint.config.js            # ESLint Flat Config con @nx/enforce-module-boundaries
└── package.json
```

---

## 🛠️ Estándares Tecnológicos y Arquitectura

- **Framework**: Angular 22 (Standalone Components, OnPush, Zoneless).
- **Control de Flujo**: Sintaxis nativa `@if`, `@for`, `@defer (on idle)`.
- **Estado**: Signals nativos (`signal`, `computed`, `effect`) — Cero NgRx.
- **Formularios**: Signal Forms (`form()`, binding `[formField]`, validadores funcionales).
- **Estilos**: Tailwind CSS v4 + Angular Material M3 unificados mediante `libs/shared/design-tokens/src/theme.css` — Cero `!important`.
- **Tipografías**: 100% auto-alojadas con `@fontsource` (Plus Jakarta Sans, Inter, JetBrains Mono, Material Symbols) — Cero peticiones externas a CDNs.
- **Configuración de Runtime**: 12-factor compliant vía `/config.json` e inyección de token `APP_CONFIG`.
- **Seguridad**: 0 usos de `innerHTML` o `bypassSecurityTrust*`. Registro propuesto de in-memory auth con HttpOnly cookie ([ADR 0012](./docs/architecture/adr/0012-in-memory-token-storage-and-httponly-refresh-cookie.md)).
- **Documentación de Decisiones**: Ver índice completo en [ADR README](./docs/architecture/adr/README.md).
