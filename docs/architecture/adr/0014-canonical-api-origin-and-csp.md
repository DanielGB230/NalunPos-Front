# ADR 0014 — Origen Canónico de API y Content Security Policy (CSP) Fija en Producción

**Fecha:** 2026-11-03  
**Estado:** Aceptado  
**Contexto:**  
En el diseño de la arquitectura frontend de `NalunPos-Front` (`NalunPos-Web` y `NalunPos-Admin-Web`), la configuración en runtime se carga dinámicamente mediante el archivo `/config.json` inyectado a través del token `APP_CONFIG` (ADR 0009). Esta capacidad permite desacoplar los artefactos estáticos de variables de entorno estáticas en tiempo de compilación.

Sin embargo, en el estándar W3C de Content Security Policy (CSP Nivel 2 y 3), la directiva `connect-src` declarada en la etiqueta `<meta http-equiv="Content-Security-Policy">` del archivo `index.html` restringe de forma inviolable los orígenes HTTP, HTTPS y WebSocket a los que el navegador tiene permitido emitir peticiones (`fetch`, `XMLHttpRequest`, `EventSource`, `WebSocket`).

Si la CSP de producción utilizara comodines genéricos (`*`) o esquemas abiertos (`https:`), se violaría el principio de mínimo privilegio y se abrirían vectores críticos de exfiltración de credenciales JWT hacia servidores de atacantes. Si, por el contrario, la CSP declara un origen estricto mientras que `/config.json` apuntara a un host no listado, el navegador bloquearía inmediatamente toda comunicación de red, dejando la aplicación inoperable sin un error visible para el usuario final.

Por ende, se requiere una decisión arquitectónica explícita que resuelva la tensión entre la configuración dinámica en runtime y la inmutabilidad de la directiva de seguridad CSP en producción.

---

## Decisión

1. **Origen Canónico de API Fijo y Estricto en Producción (`https://api.nalunpos.com`):**
   - El origen del API backend en producción es canónico, explícito e inmutable: `https://api.nalunpos.com`.
   - La etiqueta `<meta http-equiv="Content-Security-Policy">` de los archivos de entrada de producción (`apps/NalunPos-Web/src/index.html` y `apps/NalunPos-Admin-Web/src/index.html`) lista literalmente este host en su directiva `connect-src`:
     ```text
     connect-src 'self' https://api.nalunpos.com;
     ```
   - Queda estrictamente prohibido el uso de comodines (`*`, `*.nalunpos.com`) o esquemas genéricos (`https:`, `wss:`) en la CSP de producción.

2. **Regla de Co-Commit Obligatoria:**
   - La configuración en runtime (`config.example.json` / `/config.json` de producción) y la CSP de producción (`src/index.html`) deben mantenerse sincronizadas de forma bidireccional y determinista.
   - Si en el futuro la infraestructura empresarial requiere migrar o alterar el dominio de la API (por ejemplo `https://api-v2.nalunpos.com` o dominios dedicados por región), **es obligatorio actualizar la directiva `connect-src` en `src/index.html` y la plantilla de configuración en el mismo commit**.
   - Ningún commit ni despliegue puede admitir una discrepancia entre el origen declarado en la CSP y el `apiUrl` provisto al cliente.

3. **Verificación Automatizada en Build y CI (`tools/verify-csp.mjs`):**
   - El script de validación de seguridad de artefactos `tools/verify-csp.mjs` (ejecutado en cada compilación de producción y en el pipeline de GitHub Actions vía `npm run verify:csp`):
     a) Extrae la directiva `connect-src` de cada `dist/apps/<app>/browser/index.html`.
     b) Comprueba que no existan orígenes de desarrollo (`localhost`) ni comodines (`*`).
     c) Lee la plantilla de configuración de producción de la aplicación correspondiente (`apps/<app>/config/config.example.json` o el origen canónico por defecto) y extrae `new URL(apiUrl).origin`.
     d) Valida que dicho origen coincida exactamente y esté incluido en `connect-src`. Ante cualquier divergencia, aborta con código de salida `1` bloqueando el despliegue.

4. **Segregación Determinista de Entornos (Desarrollo vs Producción):**
   - Para desarrollo local donde los desarrolladores ejecutan APIs en puertos locales dinámicos (ej. `https://localhost:7232`), se utiliza exclusivamente el archivo de entrada segregado `src/index.dev.html` (gobernado por la configuración `development` en `project.json`), el cual autoriza `http://localhost:*` y `https://localhost:*`.
   - El archivo `src/index.html` queda reservado de manera intocable y limpia para el bundle de producción.

---

## Consecuencias

- **Positivas:**
  - Máxima postura de seguridad en el navegador (principio de mínimo privilegio): protección robusta contra exfiltración de tokens JWT mediante peticiones no autorizadas.
  - Cero discrepancias silenciosas entre configuración de runtime y políticas del navegador.
  - Detección determinista y automatizada en pipelines de CI/CD ante cualquier desalineación entre dominios.
- **Negativas / Compromisos:**
  - Cambiar el dominio de la API de producción requiere generar una nueva compilación y despliegue del frontend (no puede realizarse exclusivamente modificando un archivo estático en el servidor sin actualizar el código fuente). Este compromiso se asume conscientemente en favor de la seguridad de la plataforma.
