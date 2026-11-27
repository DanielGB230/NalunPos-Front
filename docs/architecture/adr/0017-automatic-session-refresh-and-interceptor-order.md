# ADR 0017 — Renovación Automática de Sesión ante 401, Orden de Interceptores y Guard Asíncrono

- **Estado:** Aceptado
- **Fecha:** 2026-11-27
- **Ámbito:** Autenticación y Cadena HTTP (`libs/shared/auth`, `apps/NalunPos-Web`, `apps/NalunPos-Admin-Web`)

---

## Contexto

El access token de NalunPos vive exclusivamente en memoria (`AuthService`, ADR 0012) y el refresh token en la cookie `HttpOnly` `nalunpos_rt`. Hasta este ADR, la cadena HTTP resolvía un `401` destruyendo la sesión en `sessionExpiredInterceptor`, sin intentar renovarla. Esto producía dos efectos indeseados:

1. **Pérdida de sesión evitable:** un token de corta duración vencido durante el uso normal obligaba al usuario a volver a iniciar sesión, aunque la cookie de refresh siguiera vigente.
2. **Guard incapaz de renovar:** `authGuard` era síncrono y solo consultaba `isAuthenticated()`. Si el token había vencido, redirigía a `/login` sin oportunidad de refrescar, aunque la sesión pudiera recuperarse.

Además, el orden previo (`correlationId → authToken → sessionExpired → error`) impedía que el reintento de una petición recibiera un token nuevo: `authToken` ya había adjuntado el token viejo antes de que cualquier refresh pudiera ejecutarse.

---

## Decisión

### 1. Orden estricto de la cadena de interceptores

Ambas aplicaciones configuran idéntica cadena en `app.config.ts`:

```typescript
withInterceptors([
  correlationIdInterceptor, // 1° — Agrega X-Correlation-Id
  sessionExpiredInterceptor, // 2° — 401 de sesión (logout) y 403 (/forbidden)
  sessionRefreshInterceptor, // 3° — 401 protegido: refresh único + reintento
  authTokenInterceptor, // 4° — Agrega Authorization: Bearer <token>
  errorInterceptor, // 5° — Traduce HttpErrorResponse → AppError
]);
```

**Por qué este orden:**

- `errorInterceptor` debe seguir al final para traducir el `HttpErrorResponse` nativo a `AppError` antes de que el resto de la cadena lo inspeccione en el retorno.
- `sessionRefreshInterceptor` se sitúa **antes** de `authTokenInterceptor`. En el flujo saliente, el reintento vuelve a entrar por `authToken`, que adjunta el token renovado. Si el refresh estuviera después, el reintento conservaría el token viejo.
- `sessionExpiredInterceptor` se sitúa **antes** de `sessionRefreshInterceptor`. En el flujo de retorno (derecha a izquierda) su `catchError` se ejecuta **después**, de modo que el refresh se intenta primero y solo si este falla el `401` original llega a `sessionExpired`, única responsable de limpiar la sesión.

### 2. Política de renovación: un único reintento y single-flight

`sessionRefreshInterceptor` (`libs/shared/auth/src/interceptors/session-refresh.interceptor.ts`) aplica esta política:

1. **Captura del token al iniciar la petición.** Antes de `next(req)` se guarda `authService.getToken()`.
2. **Solo 401 de endpoints protegidos.** Un `401` en `/auth/login`, `/auth/refresh` o `/auth/logout` se propaga sin refresh (anti-bucle). El estado se extrae de forma polimórfica vía `AppError.status` o `HttpErrorResponse.status`.
3. **Detección de refresh concurrente.** Si al recibir el `401` el token actual difiere del capturado, otro refresh ya se completó: se reintenta directamente sin duplicar la llamada.
4. **Refresh único.** En caso contrario se invoca `AuthService.refreshSession()`. El `SessionRefreshCoordinator` garantiza un solo `POST /api/v1/auth/refresh` en vuelo por pestaña (single-flight) y serializa entre pestañas con el Web Lock `nalunpos-session-refresh`.
5. **Reintento marcado.** El reintento se clona con `HttpContextToken SESSION_RETRIED = true`. Si vuelve a responder `401`, se propaga sin segundo refresh.
6. **Fallo del refresh.** Se propaga el error original del endpoint protegido; `sessionExpiredInterceptor` limpia la sesión y navega a `/login`.

### 3. API de sesión en `AuthService`

- `refreshSession(): Observable<void>` valida la respuesta con `UserSession.fromAuthResponse` (fail-closed) y actualiza el Signal de sesión. Los errores se **propagan** al llamador.
- `initializeSession(): Observable<void>` reutiliza `refreshSession()` y sigue siendo tolerante: ante cualquier fallo limpia la sesión y completa sin lanzar, sin bloquear el arranque.
- `ensureValidSession(): Observable<boolean>`:
  - Sesión vigente → `true` sin refresh.
  - Sesión presente con token vencido → `refreshSession()`; éxito → `true`, fallo → limpia la sesión y `false`.
  - Sin sesión en memoria → `false`.

### 4. `authGuard` asíncrono

`authGuard` pasa a devolver `Observable<boolean | UrlTree>` basado en `ensureValidSession()`. Si la sesión no puede garantizarse, redirige a `/login` conservando el `returnUrl` de la navegación rechazada cuando existe. `roleGuard` y `guestGuard` no cambian: la autorización por rol sigue siendo una comprobación síncrona sobre la sesión ya validada.

### 5. Exclusión de `/auth/*` en `sessionExpiredInterceptor`

Un `403` de `/auth/login`, `/auth/refresh` o `/auth/logout` se propaga al llamador y **no** navega a `/forbidden`. Los endpoints anónimos de autenticación no representan una sesión autenticada sin permisos, por lo que redirigir al usuario a la pantalla de acceso denegado sería incorrecto.

---

## Consecuencias

- **Positivas:**
  - La sesión se renueva de forma transparente ante un token vencido, sin obligar al usuario a autenticarse de nuevo mientras la cookie de refresh siga siendo válida.
  - Las peticiones concurrentes con `401` comparten un único refresh, evitando tormentas de `POST /auth/refresh` y carreras de tokens.
  - El guard asíncrono elimina el falso negativo de `authGuard` cuando el token había expirado pero la sesión era recuperable.
  - Se preserva la separación de responsabilidades: el interceptor de refresh no limpia la sesión; `sessionExpiredInterceptor` sigue siendo el único punto de logout por error HTTP.
- **Negativas / Compromisos:**
  - Un `401` protegido puede añadir hasta una llamada adicional al backend (refresh) y un reintento antes de propagar el error.
  - La comparación de token asume que `AuthService.getToken()` es la única fuente de verdad de la sesión en memoria, invariante ya fijada por el ADR 0003 y el ADR 0012.
