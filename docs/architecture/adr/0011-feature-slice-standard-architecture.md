# ADR 0011 — Estructura Estándar por Feature Slice y Separación Container/Presentation

**Fecha:** 2026-10-28  
**Estado:** Aprobado  
**Contexto:**
Con el crecimiento de `NalunPos-Front`, las features mostraban variabilidad en su estructura interna (mezcla de `components/`, `services/`, `interfaces/` y `models/`), así como componentes que actuaban como páginas completas ubicados dentro de `components/` sin una distinción explícita entre componentes inteligentes (Smart/Container) y componentes de presentación puros (Dumb/Presentation).

## Decisión
Se establece una estructura canónica obligatoria para cada feature slice en `apps/*/src/app/features/<feature-name>/`:

```text
features/<feature-name>/
├── <feature>.routes.ts          # Declaración de rutas hijas (lazy loaded)
├── pages/                       # Smart / Container Components (acoplados al router)
│   └── <page-name>/
│       ├── <page-name>.component.ts
│       ├── <page-name>.component.html
│       └── <page-name>.component.scss (opcional)
├── components/                  # Dumb / Presentational Components (reutilizables)
│   └── <component-name>/
│       ├── <component-name>.component.ts
│       ├── <component-name>.component.html
│       └── <component-name>.component.scss (opcional)
├── data-access/                 # Servicios HTTP, State Stores y Gateways
│   └── <feature>-api.service.ts
└── models/                      # Interfaces, DTOs, Enums y Types de la feature
    └── <feature>.model.ts (o <entity>.interface.ts)
```

### Reglas de Responsabilidad Única
1. **`pages/` (Smart / Container Components)**:
   - Son el destino de las rutas en `<feature>.routes.ts`.
   - Inyectan servicios de `data-access/` y servicios globales (Notificaciones, Diálogos, Router).
   - Gestionan el ciclo de vida y orquestan llamadas asíncronas con Signals de Angular 22.
   - Pasan datos a componentes dumb mediante signal inputs (`input()`) y escuchan eventos vía outputs (`output()`).

2. **`components/` (Dumb / Presentational Components)**:
   - Prohibido inyectar servicios HTTP directamente.
   - Estado local estrictamente ligado a la interacción visual.
   - Comunicación unidireccional: inputs reactivos y outputs tipados.
   - ChangeDetectionStrategy.OnPush obligatorio.

3. **`data-access/`**:
   - Contiene únicamente servicios de comunicación HTTP (`HttpClient`, `inject()`) y adaptadores de datos.
   - No mantiene estado de UI (e.g. apertura de drawers, modales o filtros temporales).

4. **Features con solo routing (`ventas`, `clientes`, `productos`, `usuarios`, `planes`, etc.)**:
   - Permanecen limpias con su `<feature>.routes.ts` sin crear carpetas vacías innecesarias.

## Consecuencias
- **Positivas:** Predictibilidad absoluta del código, alta reutilización de componentes visuales, desacoplamiento de capas para pruebas unitarias sin mocks de infraestructura complejos.
- **Negativas:** Requiere mover archivos en refactors cuando un componente escala de presentacional a página o viceversa.
