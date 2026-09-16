# ADR 0004 — Uso Exclusivo de Componentes Standalone (Sin NgModules)

**Fecha:** 2026-09-09  
**Estado:** Aprobado  

## Contexto
Angular desde la versión 19+ y consolidado en Angular 22 promovió la arquitectura basada en componentes Standalone (`standalone: true`) como el estándar único oficial, tornando obsoletos los `NgModule`.

## Decisión
Todos los componentes, directivas y pipes creados en la plataforma NalunPOS deben ser 100% Standalone. Queda **estrictamente prohibida** la creación de `NgModule`.

## Razones
- **Menor Boilerplate**: Elimina la necesidad de declarar e importar módulos intermedios.
- **Tree-Shaking y Carga Diferida (Lazy Loading)**: Carga nativa simplificada mediante `loadComponent` y `loadChildren` en las rutas.
- **Alineación con Angular 22**: Estándar nativo soportado sin riesgo de deprecación a futuro.

## Consecuencias
- Todo componente nuevo incluye `standalone: true` en su decorador `@Component`.
- Los imports de dependencias (Material, CommonModule, RouterLink) se gestionan directamente a nivel del componente.
