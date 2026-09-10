# NalunPos Ecosistema Frontend (Angular 22 / Nx Monorepo)

Monorepo de arquitectura empresarial desarrollado en **Angular 22** y gestionado con **Nx**. Contiene dos aplicaciones de negocio independientes y una capa de librerías compartidas reusables.

---

## 🚀 Comandos Principales (Desarrollo Local)

Todos los comandos deben ejecutarse desde la raíz del proyecto frontend (`D:\NalunPosApp\NalunPos-Front`):

### 1. Servidores de Desarrollo (Local Dev)

| Aplicación | Descripción | Comando | URL Local |
| :--- | :--- | :--- | :--- |
| **`NalunPos-Web`** | Panel Operativo de Negocio (Ventas, Inventario, Caja, Clientes) | `npx nx serve NalunPos-Web` | `http://localhost:4200` |
| **`NalunPos-Admin-Web`** | Panel de SuperAdmin (Plataforma, Tenants, Planes, Monitoreo) | `npx nx serve NalunPos-Admin-Web` | `http://localhost:4201` |

---

### 2. Compilación de Producción (Production Builds)

```powershell
# Compilar únicamente NalunPos-Web
npx nx build NalunPos-Web

# Compilar únicamente NalunPos-Admin-Web
npx nx build NalunPos-Admin-Web

# Compilar AMBAS aplicaciones simultáneamente
npx nx run-many -t build
```

---

### 3. Verificación de Tipos y Pruebas (Quality & Testing)

```powershell
# Verificación estricta de tipos TypeScript (Web)
npx tsc -p apps/NalunPos-Web/tsconfig.app.json --noEmit

# Verificación estricta de tipos TypeScript (Admin Web)
npx tsc -p apps/NalunPos-Admin-Web/tsconfig.app.json --noEmit

# Ejecutar pruebas unitarias de NalunPos-Web
npx nx test NalunPos-Web

# Ejecutar pruebas unitarias de NalunPos-Admin-Web
npx nx test NalunPos-Admin-Web

# Ejecutar todas las pruebas del workspace
npx nx run-many -t test
```

---

### 4. Grafo de Dependencias Nx

Para explorar la arquitectura y la relación entre aplicaciones y librerías compartidas visualmente:
```powershell
npx nx graph
```

---

## 🏛️ Estructura del Monorepo

```
d:\NalunPosApp\NalunPos-Front\
├── apps/
│   ├── NalunPos-Web/           # Aplicación Standalone Angular 22 (POS Operativo)
│   └── NalunPos-Admin-Web/     # Aplicación Standalone Angular 22 (SuperAdmin)
├── libs/
│   └── shared/
│       ├── auth/               # AuthService, Signals, Interceptors, Guards, DTOs
│       ├── ui/                 # Componentes UI reutilizables
│       └── design-tokens/      # Variables SCSS y paletas de diseño globales
├── docs/
│   └── architecture/adr/       # Registros de Decisiones de Arquitectura (ADRs)
├── nx.json                     # Configuración de Nx Monorepo
└── tsconfig.base.json          # Configuración base TypeScript
```

---

## 🛠️ Estándares Tecnológicos

- **Framework:** Angular 22 (Standalone Components, OnPush Change Detection).
- **Gestión de Estado:** Angular Signals nativos (`signal`, `computed`, `resource`).
- **Formularios:** Angular 22 Signal Forms (`form()`, validadores funcionales y binding `[formField]`).
- **Estilos:** SCSS Estricto + Tailwind CSS v4.
- **Backend Conectado:** `.NET 9 Pos.Api` (`https://localhost:7232/api/v1/auth/login`).
