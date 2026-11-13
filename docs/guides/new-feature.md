# Guía para la Creación de Nuevas Features

Esta guía establece el procedimiento estándar, la arquitectura modular y las reglas de diseño para incorporar un nuevo módulo o funcionalidad (feature) dentro del monorepo **NalunPos-Front**.

Todos los lineamientos están fundamentados en las Decisiones de Arquitectura vigentes (**ADR 0001** a **ADR 0016**) y las restricciones del linter en `eslint.config.js`.

---

## 1. Arquitectura y Estructura de Carpetas

Toda feature debe crearse dentro de la carpeta `features/` de la aplicación correspondiente (`apps/NalunPos-Web/src/app/features/` o `apps/NalunPos-Admin-Web/src/app/features/`).

La distribución interna se rige por el **ADR 0007** (estructura de carpetas), **ADR 0011** (rutas desacopladas) y **ADR 0016** (tipado desde OpenAPI):

```text
apps/<app>/src/app/features/<nombre-feature>/
├── components/                  # Componentes de presentación (dumb/presentational)
│   └── <feature>-form/
│       ├── <feature>-form.component.ts
│       └── <feature>-form.component.html
├── pages/                       # Componentes contenedores / enrutables (smart/containers)
│   └── <feature>-list/
│       ├── <feature>-list.component.ts
│       ├── <feature>-list.component.html
│       └── <feature>-list.component.spec.ts
├── data-access/                 # Servicios de API locales (si la feature es exclusiva de la app)
│   ├── <feature>-api.service.ts
│   └── <feature>-api.service.spec.ts
├── models/                      # Interfaces, DTOs y tipos locales tipados desde OpenAPI (ADR 0016)
│   └── <feature>.model.ts
└── <nombre-feature>.routes.ts   # Declaración de rutas hijas exportadas por defecto
```

> **Servicios Compartidos vs Locales (ADR 0013) y Contratos OpenAPI (ADR 0016):**
>
> - Si la entidad o servicio HTTP es de alcance exclusivo de una aplicación (por ejemplo, gestión de tenants en `NalunPos-Admin-Web`), se aloja en `features/<feature>/data-access/`.
> - Si la entidad es transversal o consumida por múltiples aplicaciones/módulos (por ejemplo, `WarehouseApiService`, `SupplierApiService`, `BranchApiService`), debe implementarse dentro de `libs/shared/data-access/src/services/` y exportarse en su `index.ts`.
> - Todo DTO o modelo de solicitud/respuesta debe tiparse utilizando los esquemas de `@nalunpos/shared/data-access` (`components['schemas']` o `paths`) generados desde el contrato OpenAPI v1 mediante `npm run api:types` (ADR 0016). Prohibido definir tipos manuales redundantes que diverjan del backend.

---

## 2. Separación entre Contenedor (Pages) y Presentación (Components)

Para maximizar el rendimiento, la testeabilidad y la mantenibilidad (ADR 0002 y ADR 0004):

### 2.1 Componente Contenedor (`pages/`)

- Es el componente vinculado a la ruta (`loadComponent`).
- Inyecta los servicios de acceso a datos (`inject(FeatureApiService)`), notificaciones o enrutamiento.
- Orquesta el estado reactivo utilizando **Signals** (`signal`, `computed`, `toSignal`).
- Maneja los 4 estados de la vista: **`loading`**, **`empty`**, **`error`** y **`success`**.
- Configurado obligatoriamente con `changeDetection: ChangeDetectionStrategy.OnPush`.

### 2.2 Componente de Presentación (`components/`)

- Recibe datos mediante **Signal Inputs** (`input()`, `input.required()`).
- Notifica interacciones mediante **Signal Outputs** (`output()`).
- No inyecta servicios de infraestructura ni realiza llamadas HTTP directas.
- Para formularios interactivos, implementa formularios tipados con **Signal Forms** y validación desacoplada.
- Configurado obligatoriamente con `changeDetection: ChangeDetectionStrategy.OnPush`.

---

## 3. Carga Diferida en Rutas (Lazy Loading)

Cada feature debe exponer su propio archivo de rutas (`<nombre-feature>.routes.ts`) con exportación tipada `Routes`, y montarse en el enrutador principal de la app mediante `loadChildren`:

```typescript
// apps/<app>/src/app/app.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '<feature>',
    loadChildren: () => import('./features/<feature>/<feature>.routes').then((m) => m.routes),
  },
];
```

Y en el archivo de la feature:

```typescript
// apps/<app>/src/app/features/<feature>/<feature>.routes.ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/<feature>-list/<feature>-list.component').then((m) => m.FeatureListComponent),
  },
];
```

---

## 4. Matriz de Etiquetas Nx y Fronteras Arquitectónicas

El archivo `eslint.config.js` valida estrictamente la matriz de dependencias según las etiquetas (`tags`) definidas en cada `project.json`:

### 4.1 Etiquetas Registradas en el Monorepo

| Proyecto / Librería         | Scope (`scope:*`) | Tipo (`type:*`)    |
| :-------------------------- | :---------------- | :----------------- |
| `apps/NalunPos-Web`         | `scope:web`       | `type:app`         |
| `apps/NalunPos-Admin-Web`   | `scope:admin`     | `type:app`         |
| `libs/shared/auth`          | `scope:shared`    | `type:data-access` |
| `libs/shared/data-access`   | `scope:shared`    | `type:data-access` |
| `libs/shared/ui`            | `scope:shared`    | `type:ui`          |
| `libs/shared/util`          | `scope:shared`    | `type:util`        |
| `libs/shared/design-tokens` | `scope:shared`    | `type:util`        |

### 4.2 Reglas de Importación Permitidas

1. **`scope:web`**: Solo puede depender de librerías con `scope:shared` o `scope:web`.
2. **`scope:admin`**: Solo puede depender de librerías con `scope:shared` o `scope:admin`.
3. **`scope:landing`** (preparado): Solo puede depender de `scope:shared`, vetando `type:data-access` y `type:feature`.
4. **`scope:shared`**: Solo puede depender de `scope:shared` (nunca de `scope:web` ni `scope:admin`).
5. **Jerarquía por Tipo (`type:*`)**:
   - `type:app` → puede importar `type:feature`, `type:ui`, `type:data-access`, `type:util`.
   - `type:feature` → puede importar `type:ui`, `type:data-access`, `type:util`.
   - `type:ui` → puede importar `type:ui`, `type:util` (prohibido `type:data-access`).
   - `type:data-access` → puede importar `type:data-access`, `type:util`.
   - `type:util` → solo puede importar `type:util`.

---

## 5. Ejemplo Real Verificado: Feature `warehouses`

Como referencia de implementación limpia en producción, examine los archivos existentes de la feature de almacenes:

- **Rutas de la Feature:**
  `apps/NalunPos-Web/src/app/features/warehouses/warehouses.routes.ts`
- **Página Contenedora (Smart):**
  `apps/NalunPos-Web/src/app/features/warehouses/pages/warehouse-list/warehouse-list.component.ts`
  `apps/NalunPos-Web/src/app/features/warehouses/pages/warehouse-list/warehouse-list.component.html`
  `apps/NalunPos-Web/src/app/features/warehouses/pages/warehouse-list/warehouse-list.component.spec.ts`
- **Componente de Presentación (Dumb):**
  `apps/NalunPos-Web/src/app/features/warehouses/components/warehouse-form/warehouse-form.component.ts`
  `apps/NalunPos-Web/src/app/features/warehouses/components/warehouse-form/warehouse-form.component.html`
- **Servicio Compartido de Acceso a Datos (ADR 0013):**
  `libs/shared/data-access/src/services/warehouse-api.service.ts`
  `libs/shared/data-access/src/services/warehouse-api.service.spec.ts`

---

## 6. Pruebas Mínimas Obligatorias

Toda nueva feature debe incorporar pruebas unitarias completas ejecutables con `npx vitest`:

1. **Para Servicios HTTP (`*api.service.spec.ts`):**
   - Uso de `HttpTestingController` de `@angular/common/http/testing`.
   - Verificación de URL de solicitud, método HTTP (`GET`, `POST`, etc.) y cabeceras.
   - Verificación de deserialización y emisión de errores HTTP mediante `HttpErrorResponse` / `AppError`.
   - Invocación de `httpMock.verify()` en `afterEach` para garantizar que no existan solicitudes pendientes.

2. **Para Componentes Contenedores (`*.component.spec.ts`):**
   - Cobertura de los **4 estados de la interfaz**:
     a) **`loading`**: El indicador de carga es visible mientras la promesa/observable está en tránsito.
     b) **`empty`**: Mensaje de lista vacía cuando el resultado retorna un arreglo sin registros (`[]`).
     c) **`error`**: Renderizado de alerta o componente de error cuando el servicio falla.
     d) **`success`**: Renderizado correcto de la lista o datos recibidos.

---

## 7. Errores Frecuentes a Evitar

Para garantizar la integridad arquitectónica y superar las verificaciones de CI (`lint`, `test`, `verify:csp`):

1. **NO importar directamente entre features:** Las features no deben acoplarse transversalmente (ej. `import ... from '../suppliers/...'`). Si una funcionalidad es requerida por dos features, debe extraerse a una librería compartida en `libs/shared/`.
2. **NO importar `AuthService` en `libs/shared/ui`:** `libs/shared/ui` (`type:ui`) tiene terminantemente prohibido depender de `libs/shared/auth` (`type:data-access`). El estado de autenticación debe inyectarse mediante tokens de abstracción (`AUTH_GATEWAY`).
3. **NO usar `localStorage` ni acceder a `sessionStorage` fuera de `AuthService`:** Toda persistencia de credenciales se centraliza en `AuthService` (ADR 0003). Ningún componente o servicio de feature debe invocar `sessionStorage` o `localStorage` directamente.
4. **NO utilizar `console.log`, `console.error` ni similares:** La regla `@typescript-eslint/no-console` rechaza cualquier llamada a consola en código de producción. Use servicios de notificación o monitoreo.
5. **NO importar `CommonModule`:** En Angular 22 standalone, utilice directivas individuales (`@if`, `@for`, `@let`) y pipes específicos (`AppDatePipe`, `AppNumberPipe` de `@nalunpos/shared/util`).
6. **NO usar `any`:** Está prohibido el uso de `as any` o `: any` en código de aplicación o librerías. Todo modelo debe estar formalmente tipado.
7. **NO usar `!important` en hojas de estilo:** La especificidad debe manejarse a través del diseño estructurado en Tailwind CSS v4 y tokens de diseño corporativos (ADR 0005).
