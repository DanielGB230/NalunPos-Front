# ARQUITECTURA FRONTEND — NALUNPOS MONOREPO (ANGULAR 22)

## 1. Propósito y Estructura Global

El ecosistema frontend de NalunPOS está construido sobre un **Monorepo Nx** con **Angular 22**, preparado para mantenibilidad a largo plazo (20+ años).

### Aplicaciones (`apps/`)

- **`NalunPos-Admin-Web`**: Panel de control global para la gestión de la plataforma multi-tenant (SuperAdmin), monitoreo de sharding, planes y administración de tenants.
- **`NalunPos-Web`**: Panel operativo del negocio (Admin Comercial / Tenant), enfocado en la gestión del POS, ventas, productos, clientes, categorías e inventario.

### Librerías Compartidas (`libs/shared/`)

- **`libs/shared/auth`**: `AuthService`, interceptores de autenticación, guards funcionales (`authGuard`, `roleGuard`), interfaces y modelo de sesión del usuario.
- **`libs/shared/data-access`**: Clientes HTTP, interceptores globales (`correlationIdInterceptor`, `errorInterceptor`) y modelos de respuesta estandarizados (`ProblemDetails`, `AppError`).
- **`libs/shared/ui`**: Componentes de UI de presentación reutilizables entre aplicaciones (ej. `NotificationComponent` para SnackBars Glassmorphism).
- **`libs/shared/design-tokens`**: Tokens de diseño unificados y configuración de temas.
- **`libs/shared/util`**: Helpers puros, funciones sin estado ni dependencias de Angular.

---

## 2. Regla de Dependencias (Clean Architecture)

- `apps/*` pueden depender libremente de `libs/shared/*`.
- `libs/shared/*` **nunca** dependen de `apps/*`.
- `libs/shared/ui` es de presentación pura; no depende de `libs/shared/data-access` ni realiza peticiones HTTP directamente.

---

## 3. Separación de Responsabilidades: Tailwind CSS v4 vs. Angular Material 22

Para evitar conflictos de especificidad CSS y mantener una única fuente de verdad visual:

1. **Angular Material 22**: Resuelve componentes complejos con lógica de accesibilidad integrada (tablas con ordenamiento/paginación, datepickers, selects, modales/diálogos, snackbars). Nunca se reconstruyen desde cero con Tailwind.
2. **Tailwind CSS v4**: Resuelve layouts (`flex`/`grid`), espaciados, tipografías, degradados, responsive design y estilos Glassmorphism Enterprise.
3. **Regla de No Conflictos**: Nunca se sobreescriben estilos internos de Angular Material mediante `!important` arbitrarios en Tailwind. La personalización se realiza a través de tokens de diseño e integración de temas M3.

---

## 4. Convención de Estado y Signal Forms

- **Estado 100% Signal-First**: Manejo de estado nativo (`signal`, `computed`, `linkedSignal`) sin sobreingeniería de NgRx/Akita.
- **Signal Forms**: Convención estándar desde Angular 22 para formularios reactivos simplificados y alineados con el modelo de signals.
- **Persistencia de Sesión**: Almacenamiento seguro en `sessionStorage` (nunca `localStorage`) respaldado en memoria por signals.
