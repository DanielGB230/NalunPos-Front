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
# Ejecutar suite completa de pruebas unitarias (165 tests en 28 suites)
npx vitest run

# Ejecutar pruebas unitarias con reporte de cobertura de código v8 (43.95% líneas global; por librería: util 100%, auth 98.13%, data-access 98.13%, ui 91.16%)
npx vitest run --coverage
```

### 5. Pruebas E2E de Humo (Playwright)

```bash
# Ejecutar pruebas de humo E2E automatizadas con mocks de red
npm run e2e
# O mediante Playwright CLI
npx playwright test
```

### 6. Verificación de Seguridad y CSP (Build Artifacts)

```bash
# Verificar integridad de CSP, hashes SHA-256 de scripts inline y ausencia de config.json / localhost en dist
npm run verify:csp
```

Herramienta Node nativa ([`tools/verify-csp.mjs`](./tools/verify-csp.mjs)) que valida automáticamente los artefactos de producción en `dist/apps/`. Comprueba que la metaetiqueta CSP exista, que cada `<script>` inline tenga su hash SHA-256 en base64 en `script-src`, que no existan atributos de eventos inline (`on*=`), que `connect-src` apunte al origen canónico de producción (`https://api.nalunpos.com` según ADR 0014) sin `localhost` ni comodines `*`, y que ningún archivo de distribución contenga cadenas `localhost` ni archivos `config.json` de desarrollo.

### 7. Verificación Documental y Candados Automáticos

```bash
# Ejecutar suite de pruebas unitarias de herramientas de verificación (node:test nativo)
npm run test:tools

# Auditar integridad documental y cumplimiento de las 9 reglas de documentación
npm run verify:docs
```

Herramienta Node nativa modular ([`tools/verify-docs/`](./tools/verify-docs/index.mjs)) que audita en tiempo real que ningún enlace relativo esté roto, que los ADRs y el índice estén sincronizados 1:1, que los comandos `npm run` citados existan en `package.json`, que no se usen términos obsoletos, que la tabla de skills coincida con el disco, que los frontmatters de skills sean válidos, que los disclaimers de ADR existan, que las rutas de código citadas existan físicamente y que las etiquetas de Nx (`scope:*`, `type:*`) coincidan con los `project.json`.

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
├── e2e/
│   ├── nalunpos-web.smoke.spec.ts       # Pruebas de humo E2E y verificación de CSP en NalunPos-Web
│   └── nalunpos-admin-web.smoke.spec.ts # Pruebas de humo E2E y verificación de CSP en NalunPos-Admin-Web
├── libs/shared/
│   ├── auth/                   # AuthService, Guards, Interceptors (token, session-expired), Interfaces
│   ├── data-access/            # Token APP_CONFIG, Correlation-ID, Error Interceptor, Servicios API
│   ├── ui/                     # Componentes visuales reutilizables, Layouts, Toasts, Consumo de Auth Gateway
│   ├── util/                   # Pipes de formato, Tokens desacoplados (AUTH_GATEWAY, APP_NAV_CONFIG)
│   └── design-tokens/          # Tokens M3 centralizados (theme.css), fuentes auto-alojadas
├── tools/
│   ├── verify-csp.mjs          # Script nativo de verificación de CSP y artefactos compilados
│   └── verify-docs/            # Candado modular de integridad documental y sus pruebas unitarias
├── docs/
│   ├── architecture/
│   │   ├── architecture.md     # Documento maestro de arquitectura frontend
│   │   ├── history/            # Registros históricos de refactorizaciones de hitos
│   │   └── adr/                # Registro de Decisiones de Arquitectura (ADR 0001 - 0014)
│   ├── guides/
│   │   └── new-feature.md      # Guía estándar para creación de nuevas features
│   ├── security/
│   │   └── headers-and-csp.md  # Cabeceras de seguridad y Content Security Policy
│   ├── deployment.md           # Guía de despliegue estático, runtime config y cabeceras
│   └── STATUS.md               # Estado vivo, métricas reales, suites y registro de deudas
├── .agents/skills/             # Skills auditados para agentes de IA en el monorepo
├── AGENTS.md                   # Reglas, límites y directrices para agentes y desarrolladores
├── CONTRIBUTING.md             # Guía de contribución, conventional commits y DoD
├── SECURITY.md                 # Política de seguridad y divulgación responsable
├── playwright.config.ts        # Configuración de pruebas E2E multi-proyecto
├── vitest.config.ts            # Configuración de Vitest con entorno JSDOM y cobertura V8
├── eslint.config.js            # ESLint Flat Config con @nx/enforce-module-boundaries
└── package.json
```

---

## 📚 Documentación y Guías del Proyecto

- **Directrices de Desarrollo y Agentes:** [`AGENTS.md`](./AGENTS.md)
- **Guía de Contribución y Definition of Done:** [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- **Política de Seguridad:** [`SECURITY.md`](./SECURITY.md)
- **Estado Vivo y Métricas Reales:** [`docs/STATUS.md`](./docs/STATUS.md)
- **Guía de Despliegue en Producción:** [`docs/deployment.md`](./docs/deployment.md)
- **Guía para Creación de Nuevas Features:** [`docs/guides/new-feature.md`](./docs/guides/new-feature.md)
- **Arquitectura del Sistema Frontend:** [`docs/architecture/architecture.md`](./docs/architecture/architecture.md)
- **Registro de Decisiones de Arquitectura (ADR 0001 - 0014):** [`docs/architecture/adr/README.md`](./docs/architecture/adr/README.md)
- **Directrices de Seguridad HTTP y CSP:** [`docs/security/headers-and-csp.md`](./docs/security/headers-and-csp.md)

---

## 🛠️ Estándares Tecnológicos y Arquitectura

- **Framework**: Angular 22 (Standalone Components, OnPush, Zoneless).
- **Control de Flujo**: Sintaxis nativa `@if`, `@for`, `@defer (on idle)`.
- **Estado**: Signals nativos (`signal`, `computed`, `effect`) — Cero NgRx.
- **Formularios**: Signal Forms (`form()`, binding `[formField]`, validadores funcionales).
- **Estilos**: Tailwind CSS v4 + Angular Material M3 unificados mediante `libs/shared/design-tokens/src/theme.css` — Cero `!important`.
- **Tipografías**: 100% auto-alojadas con `@fontsource` (Plus Jakarta Sans, Inter, JetBrains Mono, Material Symbols) — Cero peticiones externas a CDNs.
- **Configuración de Runtime**: 12-factor compliant inyectada vía token `APP_CONFIG`. En producción, `/config.json` es suministrado externamente por el hosting conforme al [ADR 0014](./docs/architecture/adr/0014-canonical-api-origin-and-csp.md).
- **Seguridad**: 0 usos de `innerHTML` o `bypassSecurityTrust*`. CSP estricta en producción: sin `'unsafe-inline'` en `script-src` (hashes SHA-256 para scripts inline); `style-src` permite `'unsafe-inline'` por requerimiento de Tailwind CSS v4 y Angular Material ([ADR 0014](./docs/architecture/adr/0014-canonical-api-origin-and-csp.md)). Registro propuesto de in-memory auth con HttpOnly cookie ([ADR 0012](./docs/architecture/adr/0012-in-memory-token-storage-and-httponly-refresh-cookie.md)). Deduplicación canónica de datos y tokens ([ADR 0013](./docs/architecture/adr/0013-canonical-data-access-and-ui-tokens-deduplication.md)).
- **Documentación de Decisiones**: Ver índice completo en [ADR README](./docs/architecture/adr/README.md) (ADR 0001 a 0014) y [Arquitectura](./docs/architecture/architecture.md).
