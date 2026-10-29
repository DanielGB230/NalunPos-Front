# Refactor F0-4: Eliminación de Duplicación entre Apps y Extracción a Shared-UI

## Contexto y Motivación

Las dos aplicaciones del monorepo (`NalunPos-Web` y `NalunPos-Admin-Web`) presentaban una duplicación sustancial (~100%) de:

1. **Layout Shell**:
   - `WebLayoutComponent` / `AdminLayoutComponent`
   - `SidebarComponent` (navegación vertical, acordeón de módulos, colapso responsivo y drawer móvil)
   - `HeaderComponent` (telemetría, avatar de usuario, menú contextual y título de módulo activo)
   - `LayoutService` (estado reactivo zoneless de colapso de sidebar y menú móvil)
2. **Autenticación (Login)**:
   - `LoginComponent` (diseño Ethereal Glass HUD & 3D Artwork, Signal Forms de Angular 22, validaciones reactivas, manejo de errores y estados de carga)
3. **Páginas de Error**:
   - `ForbiddenComponent` (Error 403 con estética Glassmorphism)
   - `NotFoundComponent` (Error 404 con redirección y diseño Enterprise)

## Arquitectura de Inversión de Control (IoC) y Límites de Módulos

Según las reglas estrictas de módulos (`module-boundaries` de Nx y ESLint):

- `libs/shared/ui` está etiquetada como `type:ui` y solo puede depender de librerías `type:ui` o `type:util`.
- Por tanto, `shared-ui` **no puede** importar directamente `AuthService` de `@nalunpos/shared/auth` (`type:auth`).

Para cumplir rigurosamente con esta restricción sin parches:

1. Se definió la abstracción `AUTH_GATEWAY` e interfaz `AuthGateway` en `@nalunpos/shared/ui`:
   ```typescript
   export interface AuthGateway {
     readonly currentUser: Signal<AuthUserGateway | null>;
     login(credentials: {
       email: string;
       password: string;
       tenantId?: string;
     }): Observable<unknown>;
     logout(): void;
   }
   export const AUTH_GATEWAY = new InjectionToken<AuthGateway>('AUTH_GATEWAY');
   ```
2. Cada aplicación inyecta su proveedor en `app.config.ts`:
   ```typescript
   { provide: AUTH_GATEWAY, useExisting: AuthService }
   ```
3. Se definieron tokens de configuración desacoplados:
   - `APP_NAV_CONFIG`: parametrización de títulos, badges, mapas de módulos e ítems de navegación.
   - `LOGIN_CONFIG`: parametrización del tipo de portal (`tenant` vs `admin`), placeholders, títulos y visualización condicional de empresa.

## Tabla Comparativa Antes / Después

| Componente / Servicio      | Ubicación Previa (Duplicada)                                                       | Nueva Ubicación Compartida                                                                 |
| :------------------------- | :--------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------- |
| **Error 403**              | `apps/*/src/app/shared/components/forbidden/`                                      | `libs/shared/ui/src/errors/forbidden.component.ts`                                         |
| **Error 404**              | `apps/*/src/app/shared/components/not-found/`                                      | `libs/shared/ui/src/errors/not-found.component.ts`                                         |
| **Layout Service**         | `apps/*/src/app/core/layout/services/layout.service.ts`                            | `libs/shared/ui/src/layout/layout.service.ts`                                              |
| **Header Component**       | `apps/*/src/app/core/layout/components/header/`                                    | `libs/shared/ui/src/layout/header.component.ts`                                            |
| **Sidebar Component**      | `apps/*/src/app/core/layout/components/sidebar/`                                   | `libs/shared/ui/src/layout/sidebar.component.ts`                                           |
| **App Shell**              | `apps/NalunPos-Web/.../web-layout/`<br>`apps/NalunPos-Admin-Web/.../admin-layout/` | `libs/shared/ui/src/layout/app-shell.component.ts`                                         |
| **Base Login**             | `apps/*/src/app/core/auth/components/login/`                                       | `libs/shared/ui/src/auth/base-login.component.ts`                                          |
| **Configuraciones de App** | Hardcoded en templates y componentes                                               | `apps/*/src/app/core/config/nav.config.ts`<br>`apps/*/src/app/core/config/login.config.ts` |

## Archivos Eliminados

- `apps/NalunPos-Web/src/app/core/layout/`
- `apps/NalunPos-Web/src/app/core/auth/components/login/`
- `apps/NalunPos-Web/src/app/shared/components/forbidden/`
- `apps/NalunPos-Web/src/app/shared/components/not-found/`
- `apps/NalunPos-Admin-Web/src/app/core/layout/`
- `apps/NalunPos-Admin-Web/src/app/core/auth/components/login/`
- `apps/NalunPos-Admin-Web/src/app/shared/components/forbidden/`
- `apps/NalunPos-Admin-Web/src/app/shared/components/not-found/`
