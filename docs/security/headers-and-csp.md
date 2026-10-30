# Directrices de Seguridad HTTP y Content Security Policy (CSP)

Este documento especifica la política de cabeceras HTTP de seguridad, configuración de Content Security Policy (CSP) en el cliente y en el servidor, y directrices de mitigación de vulnerabilidades para las aplicaciones frontend de **NalunPos** (`NalunPos-Web` y `NalunPos-Admin-Web`).

---

## 1. Estrategia de Dos Capas para CSP y Cabeceras de Seguridad

Por especificación del estándar W3C (CSP Level 2 y 3), existen directivas de seguridad que los navegadores web **únicamente** procesan si son entregadas en las cabeceras de respuesta HTTP del servidor web o reverse proxy, siendo ignoradas si se declaran en una etiqueta `<meta>`.

Por ende, NalunPos implementa una estrategia de **Defensa en Profundidad en Dos Capas**:

1. **Capa Cliente (`<meta>` en `index.html`)**: Protección intrínseca que viaja con los artefactos estáticos (SPA), activa incluso si la aplicación es probada localmente o servida sin configuración de servidor avanzada.
2. **Capa Servidor/Edge (Nginx / Cloudflare / Caddy)**: Inyección obligatoria de cabeceras de transporte, aislamiento de contexto y directivas no soportadas por `<meta>`.

---

## 2. Capa Cliente: `<meta http-equiv="Content-Security-Policy">`

Ambas aplicaciones (`apps/NalunPos-Web/src/index.html` y `apps/NalunPos-Admin-Web/src/index.html`) incluyen en su `<head>`:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'unsafe-hashes' 'sha256-MhtPZXr7+LpJUY5qtMutB+qWfQtMaPccfe7QXtCcEYc='; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https: blob:; connect-src 'self' http://localhost:* https://*.nalunpos.com; object-src 'none'; base-uri 'self';"
/>
```

### Desglose de Directivas en el Cliente:

- **`default-src 'self'`**: Todo recurso no especificado explícitamente se restringe al origen de la aplicación.
- **`script-src 'self' 'unsafe-hashes' 'sha256-MhtPZXr7+LpJUY5qtMutB+qWfQtMaPccfe7QXtCcEYc='`**: Solo se ejecutan scripts compilados y empaquetados por el build de Angular/Vite. El hash SHA-256 (`'sha256-MhtPZXr7+LpJUY5qtMutB+qWfQtMaPccfe7QXtCcEYc='`) y la directiva `'unsafe-hashes'` permiten exclusivamente el micro-manejador de eventos `onload="this.media='all'"` inyectado por la optimización de CSS crítico de Angular CLI (Critters/Beasties) al cargar las hojas de estilo diferidas, impidiendo cualquier otra ejecución inline no autorizada.
- **`style-src 'self' 'unsafe-inline'`**: Permite estilos compilados y micro-animaciones dinámicas inyectadas por Tailwind CSS v4 y Angular.
- **`font-src 'self' data:`**: Todas las tipografías corporativas (Inter, Plus Jakarta Sans, JetBrains Mono, Material Symbols) se alojan de forma autónoma en el bundle (`@fontsource`). Cero dependencias de Google Fonts en runtime.
- **`img-src 'self' data: https: blob:`**: Soporte para imágenes locales, Data-URI (códigos QR, placeholders) y URLs seguras HTTPS.
- **`connect-src 'self' http://localhost:* https://*.nalunpos.com`**: Restringe las llamadas `fetch`, `XMLHttpRequest` y WebSocket al origen actual, a los puertos de desarrollo local y a los subdominios de la API backend empresarial.
- **`object-src 'none'`**: Bloquea por completo plugins obsoletos y vectores heredados (Flash, Java, Silverlight).
- **`base-uri 'self'`**: Previene ataques de inyección de `<base href>` malicioso.

---

## 3. Capa Servidor / Reverse Proxy (Despliegue Real)

Las siguientes directivas y cabeceras **NO PUEDEN** ser aplicadas vía `<meta>` (los navegadores emiten advertencias y descartan las directivas si se colocan en `<meta>`):

| Cabecera / Directiva               | Nivel de Inyección | Motivo / Justificación Técnica W3C                                                                                                       |
| ---------------------------------- | :----------------: | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `frame-ancestors 'none'`           | Cabecera HTTP CSP  | W3C CSP prohíbe evaluar `frame-ancestors` en el DOM; debe evaluarse antes de pintar el documento para evitar clickjacking en `<iframe>`. |
| `Strict-Transport-Security` (HSTS) |   Cabecera HTTP    | Obliga al navegador a usar TLS/HTTPS; ignorada totalmente dentro de `<meta>`.                                                            |
| `X-Content-Type-Options: nosniff`  |   Cabecera HTTP    | Controla el análisis MIME en la fase de red del navegador.                                                                               |
| `Referrer-Policy`                  |   Cabecera HTTP    | Previene filtración de URIs sensibles en la cabecera `Referer` en saltos cross-origin.                                                   |
| `Permissions-Policy`               |   Cabecera HTTP    | Deshabilita hardware no utilizado (cámara, micrófono, geolocalización) a nivel de proceso del navegador.                                 |

---

## 4. Ejemplos de Configuración para Servidores de Producción

### 4.1 Nginx (`nginx.conf`)

```nginx
server {
    listen 443 ssl http2;
    server_name *.nalunpos.com;

    root /usr/share/nginx/html;
    index index.html;

    # Content-Security-Policy completo en cabecera HTTP (incluyendo frame-ancestors)
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https: blob:; connect-src 'self' https://*.nalunpos.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none';" always;

    # Cabeceras de Transporte y Aislamiento
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    add_header Cross-Origin-Resource-Policy "same-origin" always;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 4.2 Caddy Server (`Caddyfile`)

```caddy
*.nalunpos.com {
    root * /srv/dist/apps/NalunPos-Web/browser
    file_server
    try_files {path} /index.html

    header {
        Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https: blob:; connect-src 'self' https://*.nalunpos.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none';"
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
    }
}
```

---

## 5. Reglas de Higiene de Código en el Frontend

Para asegurar la integridad del DOM y prevenir vulnerabilidades XSS en el cliente:

1. **Prohibido `innerHTML`**: Ningún componente de Angular debe asignar contenido a la propiedad `innerHTML` de forma cruda ni a través de directivas personalizadas no sanitizadas.
2. **Prohibido `bypassSecurityTrust*`**: Está estrictamente vetado el uso de métodos de `DomSanitizer` como `bypassSecurityTrustHtml`, `bypassSecurityTrustScript` o `bypassSecurityTrustResourceUrl` sin una revisión de seguridad y justificación formal en un ADR.
3. **Escapado Automático**: Toda interpolación debe realizarse a través del motor nativo de plantillas de Angular (`{{ value }}`), el cual aplica sanitización contextual y escapado estricto por defecto.
4. **Validación Determinista**: Todos los datos de entrada provenientes de formularios o parámetros de URL son tipados y validados con Zod / Signal Forms antes de ser procesados por la capa de lógica.
