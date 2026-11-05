---
name: validation-and-testing
description: Estándares de calidad, validación determinista y ejecución de pruebas automatizadas (xUnit, FluentValidation, ArchUnitNET) en NalunPos. Usar al escribir o modificar pruebas unitarias, de integración o validadores.
---

<!-- Origen: D:\NalunPosApp\.agents\skills\validation-and-testing (copiado el 2026-11-05) -->

# NalunPos Validation and Testing Skill

## Reglas de Validación (FluentValidation)

1. **Mensajes Deterministas**:
   - Cada regla (`NotEmpty`, `MaximumLength`, `GreaterThan`, `InclusiveBetween`, `ChildRules`, etc.) debe llevar su propio `.WithMessage(...)` explicito en español.
   - No encadenar reglas dejando alguna sin mensaje (evita depender del idioma por defecto del servidor).
2. **Configuración de Cultura Global**:
   - `FluentValidationCultureConfiguration.ConfigureDefaultCulture()` establece `"es"` como fallback global en la composición (`AddApplication`).

## Reglas de Testing (xUnit / ArchUnitNET)

1. **Verificación de Cultura**:
   - Al probar validaciones bajo culturas específicas (ej: `en-US`), restaurar `CultureInfo.CurrentCulture` y `CultureInfo.CurrentUICulture` en un bloque `finally`.
   - Pruebas que manipulan estado de cultura o variables globales deben aislarse en colecciones de xUnit no paralelas: `[Collection("NonParallelValidationTests")]`.
2. **Ejecución y Verificación de Pruebas**:
   - Ejecutar builds siempre con `/p:TreatWarningsAsErrors=true`.
   - Ejecutar pruebas por proyecto `.csproj` por separado para obtener métricas limpias.
   - Demostrar fallos (RED tests) antes de arreglar cuando sea requerido en los pasos del flujo.
