# ADR 0001 — Estrategia de Monorepo con Nx

**Fecha:** 2026-09-09  
**Estado:** Aprobado  
**Contexto:** El ecosistema frontend de NalunPos requiere dos aplicaciones (NalunPos-Web y NalunPos-Admin-Web) que comparten lógica de autenticación, componentes UI y design tokens.

## Decisión
Usar Nx como herramienta de monorepo para gestionar ambas aplicaciones y las librerías compartidas en un único repositorio.

## Razones
- **Compartición de código:** La librería `@nalunpos/shared/auth` es usada por ambas apps sin duplicación.
- **Build incremental:** Nx cachea los builds por proyecto; solo recompila lo que cambió.
- **Nx sin Cloud:** Se usa la versión gratuita sin Nx Cloud para evitar dependencias de terceros.
- **Separación clara:** `apps/` contiene código específico de cada app; `libs/` contiene código compartido.

## Consecuencias
- Todos los proyectos nuevos (apps y libs) se crean con `nx g @nx/angular:*`.
- El `tsconfig.base.json` en la raíz gestiona los `paths` de TypeScript para imports limpios.

## Comandos de Ejecución Local
- **Servir POS Operativo (`http://localhost:4200`):** `npx nx serve NalunPos-Web`
- **Servir SuperAdmin (`http://localhost:4201`):** `npx nx serve NalunPos-Admin-Web`
- **Compilación Producción Web:** `npx nx build NalunPos-Web`
- **Compilación Producción Admin:** `npx nx build NalunPos-Admin-Web`
- **Compilación Ecosistema Completo:** `npx nx run-many -t build`

