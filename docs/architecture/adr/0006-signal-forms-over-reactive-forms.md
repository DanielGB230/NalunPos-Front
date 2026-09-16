# ADR 0006 — Signal Forms en lugar de Reactive Forms Clásico

**Fecha:** 2026-09-09  
**Estado:** Aprobado  

## Contexto
Angular 22 introduce Signal Forms (`@angular/forms/signals`) como la API moderna y estable para manejo de formularios reactivos simplificados y alineados con Signals.

## Decisión
Adopción prioritaria de **Signal Forms** o formularios reactivos signal-friendly para todos los componentes de formulario en la plataforma.

## Razones
- **Consistencia con Signals**: El estado del formulario se integra nativamente con `computed()` y `OnPush`.
- **Menos Boilerplate**: Reduce la necesidad de gestionar suscripciones manuales a Observables.
- **Type Safety**: Inferencia y validación de esquemas tipados.
