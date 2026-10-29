# ADR 0012: In-Memory Access Token Storage with HttpOnly SameSite=Strict Refresh Cookie

- **Estado**: Propuesto
- **Fecha**: 2026-10-28
- **Contexto**: Frontend Security & Multi-Tenant Authentication Strategy

---

## 1. Contexto del Problema

En aplicaciones Single Page Application (SPA), el almacenamiento de tokens JWT de acceso en `localStorage` o `sessionStorage` presenta un vector de ataque crítico:

1. **Exfiltración por XSS**: Cualquier script inyectado mediante una vulnerabilidad XSS o una dependencia de terceros comprometida tiene acceso de lectura directo a `window.localStorage` y `window.sessionStorage`.
2. **Persistencia Indeseada**: Los tokens en `localStorage` persisten indefinidamente hasta ser limpiados manualmente, aumentando la ventana de exposición en equipos compartidos.
3. **Aislamiento Multi-Tenant**: En NalunPos Enterprise, cada tenant requiere un aislamiento criptográfico y de sesión riguroso que no dependa de llaves globales en el navegador.

---

## 2. Decisión Arquitectónica

Se propone adoptar una arquitectura de autenticación **Zero-Trust Token Management** estructurada en dos capas:

### 2.1 Access Token en Memoria (In-Memory Only)

- El token JWT de acceso (`accessToken`) de corta duración (5 a 15 minutos) residirá **exclusivamente en la memoria volátil** de Angular, encapsulado en un closure privado dentro de `AuthService`.
- No se escribirá en `localStorage`, `sessionStorage`, `IndexedDB` ni `document.cookie`.
- Si el usuario refresca la página (F5) o abre una nueva pestaña, el token en memoria se destruye de forma segura y se recupera instantáneamente mediante silent refresh.

### 2.2 Refresh Token en Cookie HttpOnly + SameSite=Strict

- El refresh token (larga duración, rotativo por cada uso) será emitido y administrado **exclusivamente por el Backend** mediante una cabecera `Set-Cookie`:
  ```http
  Set-Cookie: nalunpos_rt=uuid-refresh-token;
              HttpOnly;
              Secure;
              SameSite=Strict;
              Path=/api/v1/auth;
              Max-Age=604800
  ```
- **Protección contra XSS**: Al tener el flag `HttpOnly`, JavaScript (y por tanto cualquier vector XSS) es físicamente incapaz de leer o exfiltrar el refresh token.
- **Protección contra CSRF**: Al tener el flag `SameSite=Strict`, el navegador jamás enviará la cookie en solicitudes cross-site (enlaces externos, iframes o scripts de otros dominios).
- **Alcance Restringido (`Path=/api/v1/auth`)**: La cookie únicamente es enviada por el navegador a los endpoints de autenticación y renovación de token, no a los endpoints de datos de negocio.

### 2.3 Flujo de Renovación Silenciosa (Silent Refresh)

1. Al iniciar la aplicación, `AuthService.initializeSession()` invoca `POST /api/v1/auth/refresh` con `withCredentials: true`.
2. El backend valida la cookie HttpOnly, rota el refresh token en una nueva cookie y retorna un nuevo `accessToken` en el payload JSON.
3. Si el access token expira durante una llamada API, el `auth.interceptor` captura el error 401, pausa las peticiones en cola, ejecuta la renovación silenciosa y reintenta la petición original con el nuevo token sin interrumpir al usuario.

---

## 3. Estado de Transición en Fase 0

Dado que el Backend actual (`NalunPos-Api`) aún no expone la cabecera `Set-Cookie` con HttpOnly en `/api/v1/auth/refresh`:

- En **Fase 0**, el frontend utiliza temporalmente `sessionStorage` (aislado por pestaña y con auto-limpieza al cerrar la sesión o vencer el tiempo de expiración) a través de `AuthService`.
- Tan pronto el backend coordine la emisión de la cookie segura, el frontend activará el modo in-memory mediante un cambio de flag en `AppConfig` sin alterar los componentes de UI.

---

## 4. Consecuencias

### Positivas

- **Inmunidad contra robo de credenciales vía XSS**: Incluso ante una inyección de script, el atacante no puede extraer el refresh token ni persistir acceso.
- **Cumplimiento de estándares bancarios y Enterprise**: Alineación con OWASP Top 10 y directrices NIST SP 800-63B.
- **Experiencia de usuario transparente**: Las sesiones se renuevan en segundo plano sin forzar re-logins intempestivos.

### Mitigaciones Técnicas

- Requiere configuración de CORS estricta en el Backend (`Access-Control-Allow-Credentials: true` con origen explícito `https://*.nalunpos.com`, nunca `*`).
