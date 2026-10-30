# ADR 0012: In-Memory Access Token Storage with HttpOnly SameSite=Strict Refresh Cookie

- **Estado**: Propuesto (Dependiente de Fase F1 Backend)
- **Fecha**: 2026-10-28 (Reconciliado 2026-10-30)
- **Contexto**: Frontend Security & Multi-Tenant Authentication Strategy (Evolución hacia Fase F1)

---

## 1. Contexto del Problema y Dependencia

Esta decisión arquitectónica define la meta final de seguridad para el manejo de credenciales en `NalunPos-Front`.

> [!IMPORTANT]
> **Estado Actual: Propuesto (Dependiente de Fase F1 Backend)**  
> Esta arquitectura requiere que la API Backend (`NalunPos-Api`) exponga y soporte:
>
> 1. `POST /api/v1/auth/refresh` con emisión de cookie `HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth`.
> 2. `POST /api/v1/auth/logout` con revocación en servidor y limpieza de la cookie de refresh.
> 3. `GET /api/v1/auth/me` para la hidratación inicial de la sesión del usuario.
>
> Durante la **Fase 0**, el frontend opera bajo el [ADR 0003](./0003-token-storage-strategy.md) (`Aceptado — Vigente en Fase 0`), utilizando una única clave estructurada en `sessionStorage` gestionada exclusivamente por `AuthService`. Esta decisión (ADR 0012) se activará formalmente en la **Fase F1** una vez que el backend libere los contratos requeridos.

---

## 2. Decisión Arquitectónica Propuesta

Se propone adoptar una arquitectura de autenticación **Zero-Trust Token Management** estructurada en dos capas independientes:

### 2.1 Access Token en Memoria (In-Memory Only)

- El token JWT de acceso (`accessToken`) de corta duración (5 a 15 minutos) residirá **exclusivamente en la memoria volátil** de Angular, encapsulado en un closure/Signal privado dentro de `AuthService`.
- No se escribirá en `localStorage`, `sessionStorage`, `IndexedDB` ni `document.cookie`.
- Si el usuario refresca la página (`F5`) o abre una nueva pestaña, el token en memoria se destruye de forma segura y se recupera instantáneamente mediante silent refresh contra `/api/v1/auth/refresh`.

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
3. Si el access token expira durante una llamada API, el interceptor captura el error 401, pausa las peticiones en cola, ejecuta la renovación silenciosa y reintenta la petición original con el nuevo token sin interrumpir al usuario.

---

## 3. Plan de Activación e Implementación

1. **Fase 0 (Actual)**: Operación bajo [ADR 0003](./0003-token-storage-strategy.md) con clave única `nalunpos_auth_session` en `sessionStorage` y lectura mediante Signals.
2. **Fase F1 Backend**: Implementación en `NalunPos-Api` de rotación de refresh token y cookie HttpOnly.
3. **Fase F1 Frontend**: Transición transparente en `AuthService` para desactivar el respaldo de `sessionStorage` y activar el silent refresh en runtime.

---

## 4. Consecuencias

### Positivas

- **Inmunidad contra robo de credenciales persistentes vía XSS**: Incluso ante una inyección de script, el atacante no puede extraer el refresh token.
- **Cumplimiento de estándares Enterprise**: Alineación estricta con OWASP Top 10 y directrices NIST SP 800-63B.
- **Experiencia de usuario transparente**: Renovación fluida en segundo plano sin interrupciones.

### Requisitos Técnicos

- Requiere CORS estricto en el Backend (`Access-Control-Allow-Credentials: true` con origen explícito `https://*.nalunpos.com`, nunca `*`).
