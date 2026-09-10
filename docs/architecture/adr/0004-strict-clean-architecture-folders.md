# ADR 0004 — Clean Architecture Estricta: Separación components/services/models/interfaces

**Fecha:** 2026-09-09  
**Estado:** Aprobado  
**Contexto:** En proyectos Angular sin estructura formal, es común mezclar DTOs, lógica de negocio y componentes visuales en el mismo archivo o carpeta.

## Decisión
Cada feature y el core de la aplicación seguirán una separación estricta de 4 capas de carpetas:

| Carpeta | Responsabilidad |
|---|---|
| `components/` | Solo vistas (Smart y Dumb). `.ts + .html + .scss` separados. |
| `services/` | Lógica de negocio, estado (Signals) y llamadas HTTP. |
| `models/` | Entidades de dominio del frontend. Clases con comportamiento. |
| `interfaces/` | Contratos con el backend (DTOs), tipos y enums. |

## Razones
- **Localización predecible:** Un desarrollador nuevo sabe exactamente dónde buscar cada tipo de archivo.
- **Separación real:** Evita que los componentes acumulen lógica de negocio (anti-patrón "Fat Component").
- **Testabilidad:** Los servicios son fácilmente testeables sin necesidad de renderizar componentes.

## Consecuencias
- Queda **prohibido** tener HTML o SCSS inline dentro de un archivo `.ts` de componente.
- Queda **prohibido** hacer llamadas HTTP desde un componente directamente.
- Queda **prohibido** mezclar DTOs de backend con modelos de dominio frontend.
