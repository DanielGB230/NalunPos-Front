# ADR 0005 — Signal Forms en lugar de Reactive Forms clásico

**Fecha:** 2026-09-09  
**Estado:** Aprobado  
**Contexto:** Angular 22 introduce Signal Forms como la API moderna y estable para manejo de formularios.

## Decisión
Usar **Signal Forms** (`@angular/forms/signals`) para todos los formularios nuevos.

## Razones
- **API estable en Angular 22:** `form()`, `schema()`, `submit()` son la API pública oficial desde Angular 22.
- **Consistencia con Signals:** El estado del formulario (valores, errores, touched) son signals. Se integran nativamente con `computed()` y el change detection `OnPush`.
- **Menos boilerplate:** Elimina `FormBuilder`, `FormGroup`, `FormControl` y la necesidad de gestionar suscripciones RxJS para valores de formulario.
- **Type safety completo:** El schema infiere el tipo TypeScript del formulario automáticamente.

## Consecuencias
- `ReactiveFormsModule` y `FormsModule` clásicos NO se importarán en componentes nuevos.
- Si se encuentra una limitación técnica que impida usar Signal Forms (ej. integración con librería externa), debe documentarse como excepción en este ADR.
