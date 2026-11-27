# ADR 0012: In-Memory Access Token Storage with HttpOnly SameSite=Strict Refresh Cookie

- **Estado**: Aceptado
- **Fecha**: 2026-10-28 (Implementado 2026-11-26)
- **Contexto**: Frontend Security & Multi-Tenant Authentication Strategy (Fase F1)

---

## 1. Contexto

La Fase F1 del backend (`NalunPos-Api` `739ca75`) liberó el contrato de autenticación Zero-Trust. El frontend deja de persistir la sesión en `sessionStorage` (ADR 0003, ahora reemplazado) y pasa a mantener el access token exclusivamente en memoria, apoyándose en una cookie de refresh `HttpOnly` emitida por el backend.

---

## 2. Decisión

### 2.1 Access Token solo en memoria

- El access token vive en el Signal privado de `AuthService`, encapsulado en `UserSession`. No se escribe en `localStorage`, `sessionStorage`, `IndexedDB` ni en cookies accesibles por JavaScript.
- Una recarga (`F5`) o una nueva pestaña destruye el token en memoria y lo recupera con un refresh silencioso.

### 2.2 Cookie de refresh real

- Nombre y atributos emitidos por el backend: `nalunpos_rt` con `HttpOnly`, `Secure`, `SameSite=Strict` y `Path=/api/v1/auth`.
- El refresh token rota en cada uso. Solo el backend la crea, rota o elimina.
- `POST /api/v1/auth/login`, `/refresh` y `/logout` son endpoints anónimos y se invocan con `withCredentials: true`; en el login es obligatorio para aceptar el `Set-Cookie`.

### 2.3 Refresh de arranque coordinado

- `AuthService.initializeSession()` se ejecuta como `provideAppInitializer` en ambas aplicaciones.
- `SessionRefreshCoordinator` garantiza un único refresh en vuelo por pestaña (single-flight) y serializa las llamadas entre pestañas mediante Web Locks con el nombre `nalunpos-session-refresh`.
- Si `navigator.locks` no existe, degrada únicamente a single-flight por pestaña, sin polyfill.
- Cualquier fallo (400/401/403/409/429/5xx/red) o una respuesta inválida deja la sesión vacía, pero **nunca bloquea el arranque ni lanza**.

### 2.4 Refresh devuelve la sesión completa

- `POST /api/v1/auth/refresh` devuelve el `LoginResponse` completo (token, usuario, rol, tenant y expiración).
- No se usa `GET /api/v1/auth/me`; `UserSession.fromAuthResponse` aplica la misma validación fail-closed que en el login.

### 2.5 Logout: memoria inmediata y revocación no bloqueante

- `AuthService.logout()` limpia la sesión en memoria y navega a `/login` de inmediato; después invoca `POST /api/v1/auth/logout` sin bloquear y silencia cualquier error.
- `logout` es idempotente y es lo único que borra la cookie.
- **Limitación:** si la revocación en servidor falla (red caída, 5xx), la cookie de refresh permanece válida hasta su expiración natural o hasta un logout posterior exitoso. El frontend no puede eliminarla por ser `HttpOnly`.

### 2.6 Anti-bucle de sesión expirada

- `sessionExpiredInterceptor` no ejecuta `logout()` ante un 401 de `/auth/login`, `/auth/refresh` o `/auth/logout`; solo lo hace ante un 401 de un endpoint protegido.

### 2.7 Requisito de despliegue

- El frontend debe servirse bajo un subdominio de `nalunpos.com` y la API en un origen del mismo site. Con `SameSite=Strict`, un front en otro dominio registrable impediría enviar la cookie de refresh.
- CORS del backend con `Access-Control-Allow-Credentials: true` y origen explícito del frontend, nunca `*`.

---

## 3. Consecuencias

- **Inmunidad ante XSS para el refresh token**: `HttpOnly` impide que JavaScript lo lea o exfiltre.
- **Sin persistencia local**: una recarga no deja rastro de sesión en storage; la restauración depende exclusivamente de la cookie.
- **Arranque resiliente**: un refresh fallido no rompe la aplicación; el usuario simplemente llega sin sesión.
- **Riesgo residual acotado**: ante fallo de revocación, la cookie sobrevive hasta su expiración; se mitiga con expiración corta y rotación en cada refresh.
- **Acoplamiento de despliegue**: front y API deben compartir site (`*.nalunpos.com`) por `SameSite=Strict`.
