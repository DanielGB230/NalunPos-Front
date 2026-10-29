# Directrices de Seguridad HTTP y Content Security Policy (CSP)

Este documento especifica la política de cabeceras HTTP de seguridad, configuración de Content Security Policy (CSP) y directrices de mitigación de vulnerabilidades para las aplicaciones frontend de **NalunPos** (`NalunPos-Web` y `NalunPos-Admin-Web`).

---

## 1. Cabeceras HTTP de Seguridad Obligatorias

Todo servidor web, reverse proxy (Nginx, Caddy, Traefik, Cloudflare) o CDN que sirva los artefactos estáticos del frontend debe inyectar las siguientes cabeceras en todas las respuestas HTTP/HTTPS:

| Cabecera HTTP                  | Valor Recomendado                                      | Justificación                                                                                                    |
| ------------------------------ | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| `Content-Security-Policy`      | Ver sección 2                                          | Previene inyecciones XSS, clickjacking y carga de scripts o fuentes no autorizadas.                              |
| `Strict-Transport-Security`    | `max-age=31536000; includeSubDomains; preload`         | Fuerza conexiones TLS/HTTPS durante 1 año y protege contra ataques de degradación (downgrade).                   |
| `X-Content-Type-Options`       | `nosniff`                                              | Impide que el navegador intente inferir (sniff) el tipo MIME de los archivos.                                    |
| `X-Frame-Options`              | `DENY`                                                 | Previene que las aplicaciones sean embebidas en `<frame>`, `<iframe>` u `<object>` (mitigación de clickjacking). |
| `Referrer-Policy`              | `strict-origin-when-cross-origin`                      | Limita el envío de información sensible en la cabecera `Referer` hacia dominios de terceros.                     |
| `Permissions-Policy`           | `camera=(), microphone=(), geolocation=(), payment=()` | Deshabilita hardware y APIs de navegador no requeridas por la aplicación POS.                                    |
| `Cross-Origin-Opener-Policy`   | `same-origin`                                          | Aísla el contexto de ejecución de navegación frente a ventanas abiertas de otros orígenes.                       |
| `Cross-Origin-Resource-Policy` | `same-origin`                                          | Bloquea la inclusión no autorizada de recursos por orígenes cruzados.                                            |

---

## 2. Definición de Content Security Policy (CSP)

### 2.1 Política para Entorno de Producción

```http
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self' 'unsafe-inline';
  font-src 'self' data:;
  img-src 'self' data: https: blob:;
  connect-src 'self' https://api.nalunpos.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
```

### 2.2 Desglose de Directivas

1. **`default-src 'self'`**: Restringe por defecto la carga de todos los tipos de recursos al mismo origen.
2. **`script-src 'self'`**: Únicamente permite scripts locales empaquetados por Vite/Angular. Prohíbe terminantemente `unsafe-inline` y `unsafe-eval` en producción.
3. **`style-src 'self' 'unsafe-inline'`**: Permite estilos de la aplicación y micro-animaciones inyectadas dinámicamente por Angular y Tailwind v4.
4. **`font-src 'self' data:`**: Todas las tipografías corporativas (Inter, JetBrains Mono, Syne, Cinzel, Material Symbols) se alojan de manera autónoma (`@fontsource`). No se permiten llamadas a dominios externos como `fonts.googleapis.com`.
5. **`img-src 'self' data: https: blob:`**: Permite imágenes locales, avatares y códigos QR generados dinámicamente en formato Data-URI o Blob.
6. **`connect-src 'self' https://api.nalunpos.com`**: Restringe las llamadas `fetch` y `XMLHttpRequest` exclusivamente al mismo dominio y al dominio del API Backend empresarial.
7. **`object-src 'none'`**: Deshabilita la ejecución de plugins heredados (Flash, Java, Silverlight).
8. **`frame-ancestors 'none'`**: Garantiza que ningún sitio web externo pueda incrustar el sistema en un iframe.

---

## 3. Ejemplo de Configuración en Servidores Web

### 3.1 Nginx (`nginx.conf`)

```nginx
server {
    listen 443 ssl http2;
    server_name app.nalunpos.com;

    root /usr/share/nginx/html;
    index index.html;

    # Security Headers
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https: blob:; connect-src 'self' https://api.nalunpos.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none';" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 3.2 Caddy Server (`Caddyfile`)

```caddy
app.nalunpos.com {
    root * /srv/dist/apps/NalunPos-Web/browser
    file_server
    try_files {path} /index.html

    header {
        Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: https: blob:; connect-src 'self' https://api.nalunpos.com; object-src 'none'; frame-ancestors 'none';"
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
    }
}
```

---

## 4. Reglas de Higiene de Código en el Frontend

Para asegurar la integridad del DOM y prevenir vulnerabilidades XSS en el cliente:

1. **Prohibido `innerHTML`**: Ningún componente de Angular debe asignar contenido a la propiedad `innerHTML` de forma cruda ni a través de directivas personalizadas no sanitizadas.
2. **Prohibido `bypassSecurityTrust*`**: Está estrictamente vetado el uso de métodos de `DomSanitizer` como `bypassSecurityTrustHtml`, `bypassSecurityTrustScript` o `bypassSecurityTrustResourceUrl` sin una revisión de seguridad y justificación formal en un ADR.
3. **Escapado Automático**: Toda interpolación debe realizarse a través del motor nativo de plantillas de Angular (`{{ value }}`), el cual aplica sanitización contextual y escapado estricto por defecto.
4. **Validación Determinista**: Todos los datos de entrada provenientes de formularios o parámetros de URL son tipados y validados con Zod / Signal Forms antes de ser procesados por la capa de lógica.
