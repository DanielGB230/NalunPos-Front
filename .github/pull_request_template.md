## Descripción del Cambio

<!-- Explica de forma concisa qué problema resuelve este Pull Request o qué funcionalidad introduce. -->

**Tipo de Cambio:**

- [ ] `feat`: Nueva funcionalidad
- [ ] `fix`: Corrección de un defecto o bug
- [ ] `docs`: Modificación o adición de documentación
- [ ] `style`: Formateo de código o estilo Prettier
- [ ] `refactor`: Refactorización de código sin cambios en funcionalidad
- [ ] `test`: Incorporación o mejora de pruebas unitarias o E2E
- [ ] `chore` / `ci`: Mantenimiento, dependencias o pipelines de integración continua

---

## Checklist de Definición de "Hecho" (Definition of Done)

Todo Pull Request debe cumplir y marcar obligatoriamente los siguientes criterios antes de fusionarse en `main` (consultar [`CONTRIBUTING.md`](../CONTRIBUTING.md)):

- [ ] **Servicios con Pruebas Unitarias:** Todo servicio HTTP en `libs/` o `apps/` incluye pruebas unitarias con `HttpTestingController` (casos de éxito, error `ProblemDetails` y mapeo a `AppError`).
- [ ] **Componentes con Pruebas de Estados:** Todo componente de UI cuenta con tests unitarios validando sus 4 estados: cargando (`loading`), vacío (`empty`), error (`error`) y éxito (`success`).
- [ ] **Linting en Verde:** `npm run lint` (`nx run-many -t lint`) pasa sin errores ni advertencias.
- [ ] **Build de Producción y Presupuesto:** `npm run build` (`nx run-many -t build`) compila con éxito y respeta estrictamente el presupuesto inicial de **500 kB** sin advertencias.
- [ ] **Verificación de Seguridad CSP:** `npm run verify:csp` (`node tools/verify-csp.mjs`) pasa en verde (exclusión de `config.json` en artefactos, ausencia de `localhost`, hashes SHA-256 válidos y origen canónico `https://api.nalunpos.com` en `connect-src`).
- [ ] **Suite de Tests y Cobertura:** `npm test` y `npx vitest run --coverage` pasan al 100% sin degradar la cobertura de líneas del proyecto.
- [ ] **Pruebas End-to-End (E2E):** `npm run e2e` (`playwright test`) pasa en verde si se alteraron rutas públicas, flujos de autenticación o layouts generales.
- [ ] **Decisiones de Arquitectura (ADR):** Si se introdujo una decisión arquitectónica, nueva dependencia o alteración de fronteras, se incluye un nuevo ADR numerado en `docs/architecture/adr/` con formato `Contexto, Decisión, Consecuencias` y se registró en [`docs/architecture/adr/README.md`](../docs/architecture/adr/README.md).
- [ ] **Convención de Commits:** Todos los commits del PR respetan el estándar Conventional Commits en español y en minúsculas.
- [ ] **Formato de Código:** `npm run format` verifica que todos los archivos cumplan con las reglas de estilo de Prettier.
