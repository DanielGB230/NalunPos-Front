# ADR 0010 — Evaluación de exactOptionalPropertyTypes en TypeScript

**Fecha:** 2026-10-28  
**Estado:** Aprobado  
**Contexto:** Como parte del saneamiento de arquitectura y fortalecimiento del compilador TypeScript (F0-3), se evaluó la activación de la bandera estricta `exactOptionalPropertyTypes: true` junto con `noImplicitOverride`, `noPropertyAccessFromIndexSignature` y `noUncheckedIndexedAccess`.

## Decisión

Mantener `exactOptionalPropertyTypes: false` de manera explícita y documentada en `tsconfig.base.json`, habilitando plenamente el resto de directivas estrictas (`noImplicitOverride: true`, `noPropertyAccessFromIndexSignature: true`, `noUncheckedIndexedAccess: true`).

## Razones Técnicas

1. **Incompatibilidad con Tipos Opcionales Semánticos:** En TypeScript, `{ field?: T }` con `exactOptionalPropertyTypes: true` prohíbe explícitamente pasar `{ field: undefined }`, requiriendo que la propiedad sea omitida físicamente del objeto en lugar de recibir un valor `undefined` (e.g. `title || undefined`, `notes: val || undefined`).
2. **Fricción con Contratos HTTP y DTOs de Backend:** Los contratos de la API REST de NalunPos (y las interfaces de petición en `@nalunpos/shared/data-access`) representan atributos opcionales que comúnmente viajan como `undefined` o `null` en serialización/deserialización HTTP de Angular `HttpClient`.
3. **Fricción con Interfaces de UI Compartidas:** Tipos utilitarios como `NotificationData` y configuraciones de componentes dialog/drawer reciben propiedades opcionales que pueden ser evaluadas como `undefined` desde Signals computados o expresiones condicionales sin que represente un defecto de diseño o bug de runtime.
4. **Cero Parches:** Para satisfacer `exactOptionalPropertyTypes: true`, se requeriría reescribir docenas de interfaces con `field?: T | undefined` o introducir mutaciones de objetos (`delete obj.prop`) para eliminar llaves con valores `undefined`, violando la regla de "Cero parches" y añadiendo complejidad innecesaria sin aportar seguridad en tiempo de ejecución.
5. **Valor Aportado por Otras Reglas Estrictas:** `noUncheckedIndexedAccess: true` se mantiene activado y ya identificó y protegió accesos indexados a arrays potencialmente indefinidos (e.g. accesos a listas de sucursales en formularios).

## Consecuencias

- `tsconfig.base.json` declara explícitamente `"exactOptionalPropertyTypes": false`.
- Los contratos de datos y DTOs mantienen su definición idiomática de Angular y TypeScript sin forzar `| undefined` repetitivos ni mutaciones de objetos.
- Cualquier acceso indexado (`array[0]`, `dict[key]`) requiere validación explícita de nulidad debido a `noUncheckedIndexedAccess: true`.
