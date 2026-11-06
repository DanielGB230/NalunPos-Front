# Guía de Contribución a NalunPos Frontend

Bienvenido al repositorio de frontend de **NalunPos** (`NalunPos-Front`). Este monorepo alberga las aplicaciones web de la plataforma (`NalunPos-Web` y `NalunPos-Admin-Web`) y sus librerías compartidas bajo Angular 22, Vite, Tailwind CSS v4 y herramientas Nx.

Antes de comenzar a trabajar en cualquier cambio, lee con atención estas directrices, las cuales son de cumplimiento estricto para desarrolladores y agentes de IA.

---

## 1. Principios de Ingeniería y Flujo de Trabajo

### Invariantes No Negociables

1. **Cero Parches (Root-Cause Fixes Only):** Si una prueba o proceso falla, se investiga y corrige la causa raíz. Están prohibidos los workarounds, excepciones puntuales o listas manuales cuando existe una fuente de verdad verificable.
2. **Escalabilidad y Mantenibilidad:** Cada módulo tiene una única responsabilidad. La configuración de runtime está desacoplada de la lógica de negocio y ningún código de verificación o infraestructura debe romperse al agregar un nuevo componente o librería.
3. **Estabilidad Primero:** Ningún cambio puede degradar el build, lint, tests unitarios, pruebas E2E ni los presupuestos de rendimiento.
4. **Presupuesto de Rendimiento Intocable (500 kB):** El bundle inicial de cada aplicación no puede superar los 500 kB de advertencia. Toda feature operativa debe cargarse mediante lazy loading standalone (`loadChildren` / `loadComponent`).
5. **Cero Dependencias de Pago:** Se utilizan exclusivamente dependencias FOSS de licencia permisiva (MIT, Apache-2.0, BSD, OFL). Prohibido introducir paquetes o servicios comerciales de pago.

### Flujo de Trabajo en Git

- **Rama Principal:** `main`. Es la única rama productiva y está protegida por pipelines de integración continua (CI).
- **Ramas de Trabajo:** Todo desarrollo se realiza en ramas secundarias descriptivas partiendo de `main` actualizado:
  - `feature/<nombre-de-la-funcionalidad>`
  - `fix/<nombre-del-bug>`
  - `refactor/<nombre-del-refactor>`
  - `docs/<nombre-de-la-documentacion>`
- **Commits Atómicos:** Realiza commits frecuentes, descriptivos y atómicos. Queda estrictamente proscrito el uso de `--amend` o `--force` sobre ramas compartidas o una vez entregados los cambios para revisión.
- **Pull Requests:** La integración a `main` se realiza exclusivamente mediante Pull Request, cumpliendo íntegramente la **Definición de "Hecho" (DoD)** y con todos los checks de CI en estado exitoso.

---

## 2. Convención de Commits

El proyecto sigue rigurosamente el estándar **Conventional Commits** con descripciones redactadas en **español**, en minúsculas y modo imperativo:

```text
<tipo>(<ámbito opcional>): <descripción imperativa en español> [(paso opcional)]
```

### Tipos Permitidos

- **`feat`**: Nueva funcionalidad o característica.
- **`fix`**: Corrección de un defecto o error de lógica.
- **`docs`**: Modificaciones exclusivas en documentación (README, ADRs, AGENTS.md, guías).
- **`style`**: Ajustes de formato, espaciado o Prettier sin impacto en lógica de código.
- **`refactor`**: Reestructuración de código que no altera funcionalidad ni corrige bugs.
- **`test`**: Incorporación o corrección de pruebas unitarias o E2E.
- **`chore`**: Tareas de mantenimiento, sincronización de dependencias o ajustes de tooling.
- **`ci`**: Cambios en flujos de GitHub Actions o scripts de integración continua.

### Ámbitos (`scope`) Frecuentes

`auth`, `data-access`, `ui`, `util`, `security`, `config`, `adr`, `deps`, `tools`.

### Ejemplos Reales del Historial del Repositorio

- `feat(security): implementar csp estricta de produccion sin localhost ni comodines y template dev (paso 2)`
- `refactor(deps): eliminar @angular/animations no requerido por material ni cdk (paso 4)`
- `docs(adr): registrar adr 0014 sobre origen canonico de api y csp fija, y extender verify-csp (paso 2)`
- `test(data-access): incorporar app-config.token a cobertura real y anadir tests exhaustivos de validacion (paso 3)`
- `fix(auth): comparar origen exacto con URL.origin en authTokenInterceptor y mitigar colisiones (paso 1)`

---

## 3. Definición de "Hecho" (Definition of Done — DoD)

Para que cualquier feature, componente o servicio se considere terminado y apto para fusión en `main`, debe cumplir obligatoriamente con todos los siguientes puntos:

1. **Servicios de Datos con Pruebas Unitarias:**
   - Todo servicio HTTP en `libs/shared/data-access` o en módulos de feature debe contar con tests unitarios exhaustivos utilizando `HttpTestingController` (o testing harness equivalente).
   - Se deben probar respuestas exitosas, manejo de errores tipados (`ProblemDetails`), deserialización y mapeo a `AppError`.
2. **Componentes con Pruebas de Estados:**
   - Todo componente interactivo o vista debe incluir pruebas unitarias validando sus cuatro estados fundamentales:
     - **Cargando (`loading`):** Indicador de progreso o skeleton activo.
     - **Vacío (`empty`):** Estado amigable cuando la colección o respuesta no contiene datos.
     - **Error (`error`):** Visualización adecuada de mensajes de error estructurados.
     - **Éxito (`success`):** Renderizado correcto de datos y vinculación de eventos.
3. **Linting Estricto en Verde:**
   - La suite de ESLint debe pasar sin errores ni advertencias: `npm run lint`.
4. **Build de Producción y Presupuesto Intacto:**
   - Compilación exitosa en modo producción (`npm run build`) para ambas aplicaciones.
   - Presupuesto de bundle inicial estrictamente por debajo del límite de advertencia de **500 kB** (`apps/*/project.json`).
5. **Verificación de Seguridad CSP en Verde:**
   - Ejecución limpia de `npm run verify:csp` (`node tools/verify-csp.mjs`):
     - Exclusión de `config.json` dentro de los artefactos compilados.
     - Ausencia total de cadenas `localhost` o comodines `*` en conectividad.
     - Hashes SHA-256 válidos en scripts inline.
     - Presencia estricta del origen canónico de API (`https://api.nalunpos.com`) en `connect-src` (ADR 0014).
6. **Tests Unitarios y Cobertura en Verde:**
   - `npm test` debe completar al 100% de pruebas pasando.
   - La cobertura de pruebas reportada por `npx vitest run --coverage` no debe degradarse.
7. **Pruebas End-to-End (E2E) en Verde:**
   - Si el cambio impacta rutas públicas, autenticación, layout o navegación general, las pruebas de Playwright deben ejecutarse y aprobar: `npm run e2e`.
8. **Documentación de Decisiones de Arquitectura (ADR):**
   - Si el cambio altera estructuras de módulos, introduce dependencias, modifica políticas de seguridad o define nuevos patrones, debe redactarse un nuevo Architectural Decision Record en `docs/architecture/adr/`.
   - El ADR debe cumplir el formato mínimo obligatorio: **`Contexto, Decisión, Consecuencias`**, integrarse en el índice maestro [`docs/architecture/adr/README.md`](./docs/architecture/adr/README.md) y seguir las directrices de [`AGENTS.md` (sección 8)](./AGENTS.md#8-gestión-de-decisiones-de-arquitectura-adrs).

---

## 4. Comandos de Desarrollo y Verificación Local

Todos los comandos se ejecutan desde la raíz del monorepo y se encuentran declarados en `package.json`:

| Comando npm              | Script Subyacente           | Propósito                                                                  |
| :----------------------- | :-------------------------- | :------------------------------------------------------------------------- |
| **`npm run lint`**       | `nx run-many -t lint`       | Analiza límites de módulos y reglas de ESLint en todos los proyectos.      |
| **`npm run format`**     | `prettier --check .`        | Verifica el estilo y formateo de todo el repositorio.                      |
| **`npm run format:fix`** | `prettier --write .`        | Aplica el formateo automático de Prettier a todos los archivos soportados. |
| **`npm test`**           | `nx run-many -t test`       | Ejecuta la suite completa de pruebas unitarias con Vitest.                 |
| **`npm run build`**      | `nx run-many -t build`      | Compila las aplicaciones para producción validando presupuestos y tipos.   |
| **`npm run verify:csp`** | `node tools/verify-csp.mjs` | Audita artefactos compilados, plantillas de configuración y CSP estricta.  |
| **`npm run e2e`**        | `playwright test`           | Ejecuta las pruebas automatizadas de extremo a extremo (E2E Smoke Tests).  |

---

## 5. Enlaces y Documentación de Referencia

- [**`AGENTS.md`**](./AGENTS.md): Reglas de ingeniería no negociables, fronteras de Nx, interceptores bidireccionales y deuda técnica conocida.
- [**`docs/architecture/architecture.md`**](./docs/architecture/architecture.md): Documento integral de diseño y arquitectura de NalunPos Frontend.
- [**`docs/architecture/adr/`**](./docs/architecture/adr/): Repositorio central de Architectural Decision Records (ADRs 0001–0014).
- [**`docs/security/headers-and-csp.md`**](./docs/security/headers-and-csp.md): Guía de seguridad sobre cabeceras HTTP y Content Security Policy.
- [**`SECURITY.md`**](./SECURITY.md): Política de seguridad y proceso para reporte responsable de vulnerabilidades.
