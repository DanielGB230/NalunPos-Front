# ADR 0002 — Angular Signals en lugar de NgRx

**Fecha:** 2026-09-09  
**Estado:** Aprobado  
**Contexto:** El estado de la aplicación (sesión, datos de features) necesita una solución de gestión.

## Decisión
Usar Angular Signals nativos (`signal`, `computed`, `resource`) en lugar de NgRx/Akita.

## Razones
- **Menos boilerplate:** NgRx requiere Actions, Reducers, Selectors, Effects. Signals resuelve el mismo problema con una fracción del código.
- **Parte del framework:** No es una dependencia externa; está en `@angular/core`.
- **OnPush nativo:** Los componentes con `ChangeDetectionStrategy.OnPush` se actualizan automáticamente cuando los signals que leen cambian.
- **Signal Forms:** La API de formularios de Angular 22 está construida sobre Signals; la coherencia es total.

## Consecuencias
- NgRx no se instalará en este proyecto.
- El estado global se expone como señales readonly desde los servicios.
- El estado mutable solo existe dentro del servicio que lo posee (principio de encapsulación).
