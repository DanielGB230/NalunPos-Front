---
name: frontend-architecture
description: Guía y directrices de arquitectura para el desarrollo Frontend en Angular 22 y Nx Monorepo (NalunPos-Front). Usar al construir aplicaciones, componentes de UI, librerías compartidas o gestionar el estado reactivo.
---

<!-- Origen: D:\NalunPosApp\.agents\skills\frontend-architecture (copiado el 2026-11-05) -->

# NalunPos Frontend Architecture Skill (Angular 22 / Nx Monorepo)

## Estructura del Monorepo Nx

1. **Aplicaciones (`apps/`)**:
   - `NalunPos-Admin-Web`: Panel de control de plataforma para SuperAdmin (Control Plane).
   - `NalunPos-Web`: Panel operativo comercial (TenantAdmin, Cajero, Inventario).
2. **Librerías Compartidas (`libs/shared/`)**:
   - `auth`: Autenticación, guards funcionales (`authGuard`, `roleGuard`), gestión de sesión.
   - `data-access`: Clientes HTTP, interceptores globales (`correlationIdInterceptor`, `errorInterceptor`), modelos `ProblemDetails`.
   - `ui`: Componentes de presentación puros (sin llamadas HTTP directas).
   - `design-tokens`: Tokens visuales y temas unificados.
   - `util`: Funciones auxiliares puras y helpers sin estado.

## Reglas de Arquitectura Visual & UI

- **Angular Material 22**: Usar exclusivamente para componentes complejos con accesibilidad (tablas, ordenamiento, paginación, datepickers, diálogos, snackbars). **Nunca** sobreescribir estilos internos con `!important`.
- **Tailwind CSS v4**: Usar para layouts (`flex`/`grid`), espaciados, tipografías y efectos Glassmorphism Enterprise.
- **Estética Enterprise Premium**: Esquemas oscuros/elegantes, Glassmorphism, micro-animaciones fluidas.

## Gestión de Estado & Formularios

- **100% Signal-First**: Manejo de estado nativo con `signal`, `computed` y `linkedSignal`. No usar NgRx/Akita.
- **Signal Forms**: Convención estándar para formularios reactivos alineados con Signals.
- **Seguridad de Sesión**: Almacenamiento exclusivo en `sessionStorage` respaldado por Signals en memoria (prohibido `localStorage`).
