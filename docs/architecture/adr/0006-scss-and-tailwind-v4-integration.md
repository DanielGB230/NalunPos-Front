# ADR 0006 — Integración de SCSS y Tailwind CSS v4

**Fecha:** 2026-09-09  
**Estado:** Aprobado  
**Contexto:** El proyecto usa tanto SCSS para estilos de componentes como Tailwind CSS para utilidades de layout.

## Decisión
- **SCSS** es el preprocesador oficial. **Queda prohibido CSS puro** en cualquier archivo de estilos.
- **Tailwind CSS v4** se inyecta en el SCSS global vía `@use "tailwindcss";`.
- La coexistencia respeta responsabilidades distintas:

| Herramienta | Responsabilidad |
|---|---|
| Tailwind CSS v4 | Layout (flex/grid), espaciado, tipografía en el HTML mediante clases utilitarias. |
| SCSS | Variables (design tokens), estilos específicos de componente, animaciones, BEM. |
| Angular Material | Componentes complejos (tablas, diálogos, date pickers). |

## Reglas Irrompibles
1. **No usar `!important`** para sobreescribir estilos internos de Angular Material con Tailwind.
2. **Design tokens como Custom Properties CSS** (no como variables SCSS), para que sean accesibles desde cualquier contexto.
3. Si un componente de Material necesita personalización visual profunda, se construye el componente desde cero con Tailwind + SCSS.

## Consecuencias
- Todos los componentes generados con `ng g c` usan `.scss` por defecto (configurado en `project.json`).
- Los archivos `.css` están excluidos del proyecto.
