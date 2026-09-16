# ADR 0005 — Separación de Responsabilidades entre Tailwind CSS v4 y Angular Material 22

**Fecha:** 2026-09-09  
**Estado:** Aprobado  

## Contexto
El uso desordenado de librerías de componentes UI (Angular Material) y frameworks utilitarios (Tailwind CSS) puede generar guerras de especificidad CSS y estilos inconsistentes.

## Decisión
Establecer un límite estricto de responsabilidades entre ambas herramientas:

1. **Angular Material 22**: Resuelve componentes complejos y con accesibilidad resuelta (tablas con paginación/ordenamiento, diálogos, datepickers, selects, snackbars).
2. **Tailwind CSS v4**: Resuelve layouts (`flex`/`grid`), espaciados, tipografías, degradados, responsive design y estilos de componentes propios.

## Reglas
- **No usar `!important`** para sobreescribir estilos internos de Angular Material con clases Tailwind.
- La personalización de Material se realiza mediante tokens M3 y variables CSS globales en `styles.css`.
- Si un componente de Material requiere cambios visuales destructivos, se construye un componente custom con Tailwind.
