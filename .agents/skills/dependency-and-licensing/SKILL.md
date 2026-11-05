---
name: dependency-and-licensing
description: Políticas de licenciamiento de código de terceros y reemplazo de dependencias comerciales (ADR 0013, ADR 0014). Usar al evaluar o agregar nuevos paquetes NuGet o paquetes npm.
---

<!-- Origen: D:\NalunPosApp\.agents\skills\dependency-and-licensing (copiado el 2026-11-05) -->

> **Nota:** Los números de ADR que cita este skill (ADR 0013, ADR 0014) corresponden al repositorio NalunPos-Api, NO a docs/architecture/adr de este repo. En el frontend prevalecen AGENTS.md y los ADR 0001-0014 locales.

# NalunPos Dependency & Licensing Policy Skill

## 1. Política de Licencias (ADR 0013)

- Permitidas únicamente licencias Permisivas Open Source (MIT, Apache 2.0, BSD-2/3-Clause).
- Prohibidas licencias Copyleft estrictas (GPL, AGPL) en librerías enlazadas al proyecto.

## 2. Reemplazo de Dependencias Comerciales (ADR 0014)

- Evitar librerías sujetas a licenciamiento comercial de pago o licencias duales con restricciones de producción (ej: QuestPDF comercial, Syncfusion, etc.).
- Preferir alternativas de código abierto o soluciones nativas de la plataforma (.NET 10 / Angular 22).
