# ADR 0015 — Contrato Canónico de Roles, Sesión Fail-Closed y Separación de Acceso por Aplicación

- **Estado:** Aceptado
- **Fecha:** 2026-11-12
- **Ámbito:** Autenticación, Autorización y Seguridad Multi-Tenant (`libs/shared/auth`, `apps/NalunPos-Admin-Web`, `apps/NalunPos-Web`)

---

## Contexto

Durante la auditoría de integración entre el backend (`NalunPos-Api`, ADR 0023) y el frontend (`NalunPos-Front`), se detectó una vulnerabilidad crítica de elevación implícita de privilegios (_fail-open_) junto con un desacoplamiento de nomenclatura y alcance por aplicación:

1. **Comportamiento _fail-open_ histórico:** `UserSession.fromAuthResponse` asignaba `'SuperAdmin'` por defecto cuando el rol no estaba presente o no coincidía con nombres heredados desalineados (`'Cashier'`, `'Inventory'`).
2. **Desalineación con el contrato real de `LoginResponse`:** El backend (`Pos.Application.Authentication.Commands.Login.LoginResponse`) evolucionó para emitir un contrato plano con `role` (nombre textual canónico emitido por `AuthUserLookup` y `JwtTokenGenerator`), `roleId`, `userId`, `tenantId`, `token`, `email`, `fullName` y `expiresAtUtc`.
3. **Ausencia de validación de coherencia identidad/tenant en cliente:** No se validaba simétricamente que un rol de plataforma carezca de `tenantId` (`null`), que un rol operativo de tenant posea un `tenantId` válido (no vacío ni `Guid.Empty`) ni que el layout raíz de cada aplicación exigiera su conjunto exclusivo de roles.

Se requiere fijar en un ADR formal el contrato inmutable de roles y la política _fail-closed_ en todas las capas de autenticación y enrutamiento del frontend.

---

## Decisión

1. **Contrato Plano 1:1 con `LoginResponse` del Backend (`NalunPos-Api` ADR 0023):**
   - La interfaz `AuthResponse` (`libs/shared/auth/src/interfaces/auth.interfaces.ts`) replica 1:1 la estructura plana de `LoginResponse` del backend: `token`, `userId`, `roleId`, `role` (`string`), `email`, `fullName`, `tenantId` (`string | null`) y `expiresAtUtc` (`string`).

2. **Roles Canónicos (`USER_ROLES`) y Partición Estricta Plataforma / Tenant:**
   - La fuente única de verdad en frontend (`libs/shared/auth/src/models/user-role.model.ts`) define:
     - `PLATFORM_ROLES = ['SuperAdmin'] as const`
     - `TENANT_ROLES = ['TenantAdmin', 'Supervisor', 'InventoryManager', 'Cajero'] as const`
     - `USER_ROLES = ['SuperAdmin', 'TenantAdmin', 'Supervisor', 'InventoryManager', 'Cajero'] as const`
   - **Coherencia estricta (`isRoleTenantCoherent` + `isNonEmptyIdentifier`):**
     - Todo rol en `PLATFORM_ROLES` (`SuperAdmin`) exige estrictamente `tenantId === null`.
     - Todo rol en `TENANT_ROLES` exige un `tenantId` de tipo `string` no vacío (tras `trim()`) y distinto del GUID vacío (`EMPTY_GUID = '00000000-0000-0000-0000-000000000000'`).
     - Tanto `userId` (`id`) como `tenantId` de tenant rechazan `EMPTY_GUID` de forma simétrica a `TenantGuard` y `TenantClaimsResolver` en `NalunPos-Api`.

3. **Validación Única _Fail-Closed_ y Constructor Privado en `UserSession`:**
   - La clase `UserSession` (`libs/shared/auth/src/models/user-session.model.ts`) declara su constructor como **`private`**, impidiendo instanciaciones directas sin validar en todo el código de aplicación y pruebas.
   - Tanto `UserSession.fromAuthResponse(response)` (login HTTP) como `UserSession.fromStoredSession(raw)` (hidratación desde `sessionStorage`) convergen en el mismo pipeline privado `UserSession.validateAndCreate(...)`.
   - Ante cualquier payload no objeto, token vacío, `userId` inválido o `EMPTY_GUID`, email vacío, fecha `expiresAtUtc` inválida o vencida, rol fuera de `USER_ROLES` o incoherencia `role`/`tenantId`, la validación retorna **`null`** (_fail-closed_).
   - En `AuthService.login(...)` (`libs/shared/auth/src/services/auth.service.ts`), si `UserSession.fromAuthResponse` retorna `null`, se aborta el inicio de sesión emitiendo `AppError` (`code: 'AUTH_INVALID_SESSION'`, `status: 401`) sin escribir nada en `sessionStorage`. En `restoreSessionFromStorage()`, cualquier registro corrupto, manipulado o caducado purga la clave `nalunpos_auth_session` de `sessionStorage`.
   - Como defensa en profundidad adicional, `UserSession.isSuperAdmin` verifica explícitamente `this.role === 'SuperAdmin' && this.tenantId === null`.

4. **Política ante Roles No Canónicos o Personalizados:**
   - Cualquier nombre de rol recibido fuera de los 5 literales exactos de `USER_ROLES` (incluidos nombres de roles personalizados creados por un tenant o cadenas heredadas desconocidas) es tratado como **sin privilegios (_fail-closed_)**: `isUserRole` retorna `false` y la construcción de sesión retorna `null`.
   - La habilitación granular para roles personalizados y permisos efectivos por módulo queda diferida al endpoint de permisos de Fase F1.

5. **Separación por Aplicación en el Layout Raíz (`authGuard` + `roleGuard`):**
   - Cada aplicación protege su layout raíz como punto único de control de acceso (defensa en profundidad también verificada en `roleGuard` mediante `isUserRole` e `isRoleTenantCoherent`):
     - **`apps/NalunPos-Admin-Web/src/app/app.routes.ts`:** Aplica `canActivate: [authGuard, roleGuard(PLATFORM_ROLES)]` sobre el layout protegido (`AppShellComponent`), cubriendo `dashboard`, `tenants`, `planes`, `plataforma` y `usuarios-admin` sin duplicar guards en rutas hijas.
     - **`apps/NalunPos-Web/src/app/app.routes.ts`:** Aplica `canActivate: [authGuard, roleGuard(TENANT_ROLES)]` sobre el layout protegido (`AppShellComponent`), impidiendo que un usuario `SuperAdmin` acceda al portal operativo de tenants (redirigiendo a `/forbidden`).

---

## Consecuencias

- **Positivas:**
  - Eliminación completa de la vulnerabilidad _fail-open_: resulta imposible construir una sesión autenticada con rol desconocido, sin `tenantId` en usuarios de tenant o con elevación implícita hacia `SuperAdmin`.
  - Paridad exacta de contratos y reglas de identidad entre `NalunPos-Api` (ADR 0023) y `NalunPos-Front` (ADR 0015), validada mediante 100% de cobertura en `user-role.model.ts`, `user-session.model.ts`, `auth.service.ts` y `auth.guards.ts`, además de pruebas E2E en Playwright para rechazo en `/login` y redirección a `/forbidden`.
  - Un único punto de autorización por aplicación en el layout raíz reduce duplicación y evita rutas hijas olvidadas sin protección.
- **Negativas / Compromisos:**
  - Usuarios asignados a roles personalizados de tenant (distintos de `TenantAdmin`, `Supervisor`, `InventoryManager` o `Cajero`) no podrán iniciar sesión hasta que se implemente el soporte de permisos efectivos dinámicos en la Fase F1; este compromiso se asume intencionalmente para mantener tolerancia cero ante privilegios indeterminados.
