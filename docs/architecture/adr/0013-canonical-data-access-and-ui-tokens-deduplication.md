# ADR 0013 — Ubicación Canónica Única para Servicios de Acceso a Datos y Tokens UI

**Fecha:** 2026-10-30  
**Estado:** Aprobado  
**Contexto:**  
En la arquitectura inicial de `NalunPos-Front`, existían copias redundantes y wrappers de re-exportación de contratos y servicios de infraestructura (`WarehouseApiService`, `BranchApiService`, `SupplierApiService`, `Warehouse`, `Branch`, `Supplier`) tanto en `libs/shared/data-access` como dentro de `apps/NalunPos-Web/src/app/features/{warehouses,suppliers}`. Asimismo, los tokens de navegación (`APP_NAV_CONFIG`, `NavItem`) y autenticación (`LOGIN_CONFIG`, `LoginConfig`) estaban definidos en `@nalunpos/shared/util` pero eran re-exportados artificialmente desde `@nalunpos/shared/ui`.

Esta duplicidad violaba el principio DRY (Don't Repeat Yourself), rompía el principio de única fuente de verdad y amenazaba las fronteras de módulos establecidas en Nx (ADR 0011).

## Decisión

1. **Ubicación Canónica de Servicios y Modelos de Dominio Transversal (`@nalunpos/shared/data-access`):**
   - Entidades como `Warehouse`, `Branch`, `Supplier` y sus servicios asociados (`WarehouseApiService`, `BranchApiService`, `SupplierApiService`) representan contratos del backend consumidos de manera transversal por múltiples features (`warehouses`, `inventario`, `purchases`).
   - El ADR 0011 prohíbe las dependencias cruzadas entre features (`features/purchases` no puede importar de `features/suppliers`, ni `features/inventario` de `features/warehouses`).
   - Por tanto, la **única ubicación canónica** de estos contratos y clientes HTTP es `@nalunpos/shared/data-access`.
   - Se eliminaron todas las copias duplicadas locales en las apps y se consolidaron sus pruebas unitarias en `libs/shared/data-access/src/services/`.

2. **Ubicación Canónica de Tokens de Configuración UI (`@nalunpos/shared/util`):**
   - `LOGIN_CONFIG`, `LoginConfig`, `APP_NAV_CONFIG`, `AppNavConfig` y `NavItem` residen exclusivamente en `@nalunpos/shared/util/src/tokens/`.
   - Se eliminaron todos los re-exports intermedios en `libs/shared/ui/src/layout/nav-config.interface.ts` y `libs/shared/ui/src/auth/login-config.interface.ts`.
   - Los componentes visuales de layout y login en `shared/ui`, así como las aplicaciones (`NalunPos-Web` y `NalunPos-Admin-Web`), inyectan y consumen estos tokens importándolos directamente desde `@nalunpos/shared/util`.

## Consecuencias

- **Positivas:**
  - Cero duplicación de código y modelos en el repositorio.
  - Cumplimiento estricto de las reglas de frontera de Nx (`@nx/enforce-module-boundaries`).
  - Cobertura de pruebas unitarias consolidada directamente sobre las implementaciones canónicas en `libs/shared/data-access`.
  - Interfaces desacopladas y dependencias unidireccionales claras entre capas.
- **Negativas:**
  - Requiere que nuevas features que necesiten entidades transversales recurran directamente a `@nalunpos/shared/data-access` en lugar de crear definiciones locales.
