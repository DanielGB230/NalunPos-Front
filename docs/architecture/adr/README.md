# Registro de Decisiones de Arquitectura (ADR) — NalunPos Frontend

Este directorio documenta todas las decisiones arquitectónicas fundamentales adoptadas para el ecosistema frontend de **NalunPos** (`NalunPos-Front`), compuesto por las aplicaciones `NalunPos-Web` y `NalunPos-Admin-Web`, así como sus librerías compartidas en el monorepo Nx.

---

## Índice Maestro de Decisiones de Arquitectura

|                                  ADR                                  | Título                                                                         |                     Estado                     |   Fecha    | Ámbito                      |
| :-------------------------------------------------------------------: | :----------------------------------------------------------------------------- | :--------------------------------------------: | :--------: | :-------------------------- |
|                [0001](./0001-nx-monorepo-strategy.md)                 | **Estrategia de Nx Monorepo y Delimitación de Módulos**                        |                    Aprobado                    | 2026-09-09 | Workspace / Nx Boundaries   |
|                  [0002](./0002-signals-over-ngrx.md)                  | **Signals Nativos y Signal Store sobre NgRx Tradicional**                      |                    Aprobado                    | 2026-09-09 | Estado Reactivo Zoneless    |
|               [0003](./0003-token-storage-strategy.md)                | **Estrategia de Almacenamiento de Tokens (Fase 0 sessionStorage)**             |        **Aceptado — Vigente en Fase 0**        | 2026-09-09 | Autenticación Temporal      |
|             [0004](./0004-standalone-components-only.md)              | **Componentes Standalone Exclusivos (Angular 22)**                             |                    Aprobado                    | 2026-09-09 | Arquitectura de Componentes |
|       [0005](./0005-tailwind-material-responsibility-split.md)        | **Separación de Responsabilidades: Tailwind CSS v4 y Angular Material M3**     |                    Aprobado                    | 2026-09-09 | Sistema de Diseño / UI      |
|          [0006](./0006-signal-forms-over-reactive-forms.md)           | **Signal Forms en lugar de Reactive Forms Clásico**                            |                    Aprobado                    | 2026-09-09 | Manejo de Formularios       |
|          [0007](./0007-strict-clean-architecture-folders.md)          | **Clean Architecture Estricta: Separación de Capas por Feature**               |                    Aprobado                    | 2026-09-09 | Estructura de Carpetas      |
|          [0008](./0008-scss-and-tailwind-v4-integration.md)           | **Integración de Estilos Globales, Tokens M3 y Tailwind CSS v4**               |                    Aprobado                    | 2026-09-09 | Estilos y Tokens            |
| [0009](./0009-runtime-configuration-and-environment-sanitization.md)  | **Carga de Configuración en Runtime mediante APP_CONFIG Token**                |                    Aprobado                    | 2026-10-28 | 12-Factor App / Deploy      |
|      [0010](./0010-exact-optional-property-types-evaluation.md)       | **Evaluación Técnica de exactOptionalPropertyTypes**                           |                    Aprobado                    | 2026-10-28 | Compilador TypeScript       |
|         [0011](./0011-feature-slice-standard-architecture.md)         | **Arquitectura Estándar de Feature Slices (Smart/Container vs Dumb)**          |                    Aprobado                    | 2026-10-28 | Modularidad de Features     |
| [0012](./0012-in-memory-token-storage-and-httponly-refresh-cookie.md) | **In-Memory Access Token Storage con HttpOnly SameSite=Strict Refresh Cookie** | **Propuesto — Dependiente de Fase F1 Backend** | 2026-10-28 | Seguridad Zero-Trust / Auth |
|  [0013](./0013-canonical-data-access-and-ui-tokens-deduplication.md)  | **Ubicación Canónica Única para Servicios de Acceso a Datos y Tokens UI**      |                    Aprobado                    | 2026-10-30 | Deduplicación / DRY / Datos |

---

## Criterios de Aceptación Arquitectónica

1. **Standalone & Zoneless**: 100% de los componentes, directivas y pipes son standalone bajo detección de cambios reactiva Signal-First (`ChangeDetectionStrategy.OnPush`).
2. **Desacoplamiento Estricto**: Ninguna librería o feature importa dependencias internas violando las reglas de módulos configuradas en `eslint.config.js`.
3. **Cero Dependencias Comerciales**: El monorepo utiliza exclusivamente librerías de código abierto permissivo (MIT, Apache 2.0, BSD-3-Clause, OFL).
4. **Configuración Dinámica**: No existen URLs ni endpoints codificados estáticamente en el código fuente de los clientes web.
