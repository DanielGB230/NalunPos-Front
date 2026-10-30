# ADR 0003 — Estrategia de Almacenamiento del Token JWT y Sesión

- **Fecha:** 2026-09-09 (Reconciliado 2026-10-30)
- **Estado:** Aceptado (Vigente en Fase 0)
- **Contexto:** Seguridad Frontend y Estrategia de Persistencia de Sesión

---

## 1. Contexto

En el frontend de NalunPos (`NalunPos-Front`), el token JWT y la sesión del usuario deben estar disponibles para autorizar las solicitudes HTTP contra la API backend y para mantener el estado de autenticación de la interfaz ante recargas de pestaña (`F5`).

---

## 2. Decisión Arquitectónica

Se adopta un diseño **Signal-First en Memoria** con persistencia estructurada en una **única clave en `sessionStorage`**:

### 2.1 Estado Reactivo en Memoria como Fuente Única de Verdad

- El estado de la sesión activa (`currentUser`, `token`, `isAuthenticated`, `userRole`, `tenantId`) reside en memoria dentro de `AuthService` mediante Angular Signals (`signal<UserSession | null>`).
- Todas las lecturas del token en tiempo de ejecución (incluyendo el interceptor HTTP `authTokenInterceptor`) se resuelven exclusivamente a través de los Signals de `AuthService` (`getToken()`).

### 2.2 Persistencia Unificada en una Única Clave en `sessionStorage`

- Para sobrevivir a recargas accidentales o navegación (`F5`) sin solicitar credenciales nuevamente, la sesión completa (datos del usuario, roles, vigencia y token) se serializa en una **única clave constante**:
  ```typescript
  STORAGE_KEY = 'nalunpos_auth_session';
  ```
- **Prohibido guardar claves separadas**: Queda expresamente prohibido fragmentar la sesión guardando el token en una clave independiente (ej. `nalunpos_token`) y el usuario en otra. Un solo payload JSON tipado (`StoredAuthSession`) garantiza atomicidad e integridad.
- **Validación estricta de hidratación**: Al inicializarse `AuthService`, si el contenido de `nalunpos_auth_session` está corrupto, incompleto, tiene un token vacío o ha expirado (`new Date() >= expiresAt`), la clave se elimina inmediatamente de `sessionStorage` y el usuario se inicializa como no autenticado.

### 2.3 Prohibición de `localStorage` y Acceso Directo Fuera de `shared-auth`

- **`localStorage` está terminantemente PROHIBIDO**: No ofrece aislamiento por pestaña y persiste indefinidamente en terminales compartidas, elevando el riesgo de exfiltración por ataques XSS.
- **Acceso exclusivo**: Queda estrictamente prohibido que componentes, guards o interceptores lean o escriban en `sessionStorage` directamente. El acceso a `sessionStorage` está restringido de forma exclusiva a `AuthService` (forzado mediante reglas de arquitectura y ESLint).

### 2.4 Inyección Exclusiva de Headers en `authTokenInterceptor`

- `authTokenInterceptor` adjunta el encabezado `Authorization: Bearer <token>` **únicamente** a peticiones dirigidas a `APP_CONFIG.apiUrl` (o endpoints relativos de la API). Jamás se envían credenciales a URLs externas o de terceros.

---

## 3. Consecuencias

### Positivas

- **Atomicidad**: La sesión y el token se crean, restauran o destruyen en una sola operación síncrona sobre una única clave.
- **Aislamiento por Pestaña**: Cerrar la pestaña destruye la sesión, protegiendo terminales compartidas de puntos de venta.
- **Rendimiento**: Cero consultas a APIs del DOM (`sessionStorage.getItem`) durante el flujo habitual de peticiones HTTP, ya que `authTokenInterceptor` consume el token desde el Signal en memoria.

### Transición hacia Fase F1

- Este ADR se mantiene **Vigente en Fase 0**. Cuando el backend implemente el mecanismo de refresh tokens rotativos mediante cookies HttpOnly, se adoptará la arquitectura de [ADR 0012](./0012-in-memory-token-storage-and-httponly-refresh-cookie.md).
