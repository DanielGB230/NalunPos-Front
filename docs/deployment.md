# Guía de Despliegue Operativo

Este documento establece los lineamientos técnicos, comandos de compilación, aprovisionamiento de configuración en runtime y directrices de entrega estática para las aplicaciones frontend de **NalunPos** (`NalunPos-Web`, `NalunPos-Admin-Web` y la futura `NalunPos-Landing`).

---

## 1. Arquitectura de Despliegue: Artefactos Estáticos Inmutables

Las aplicaciones cliente de NalunPos son Single Page Applications (SPA) basadas en Angular 22 compiladas como artefactos estáticos HTML, JavaScript y CSS sin servidor Node.js en runtime. Pueden desplegarse en cualquier proveedor de hosting estático o Content Delivery Network (CDN) compatible con reescritura de rutas SPA (`try_files $uri $uri/ /index.html;`).

### Opciones de Hosting Estático

- **Cloudflare Pages** (opción documentada de referencia; no obligatoria). Para especificaciones, límites y capacidades actualizadas, consultar la [documentación oficial de Cloudflare Pages](https://developers.cloudflare.com/pages/).
- **Servidores Web / Reverse Proxies Corporativos**: Nginx, Caddy o Apache HTTP Server.
- **Almacenamiento de Objetos + CDN**: AWS S3 + CloudFront, Azure Static Web Apps o Google Cloud Storage + Cloud CDN.

---

## 2. Comandos de Compilación y Carpetas de Salida

La compilación de producción optimiza el código mediante `@angular/build:application` con Beasties (extracción de CSS crítico), tree-shaking, minificación y hashing determinista de artefactos.

### 2.1 Comandos de Compilación

Para compilar ambas aplicaciones simultáneamente:

```bash
npx nx run-many -t build -c production --skip-nx-cache
```

Para compilar de forma individual:

```bash
# Portal operativo de clientes / sucursales
npx nx build NalunPos-Web -c production

# Consola de administración global de plataforma
npx nx build NalunPos-Admin-Web -c production
```

### 2.2 Carpetas de Salida Reales en `dist/`

La salida compilada se genera en las siguientes rutas del sistema de archivos:

| Proyecto             | Carpeta de Salida de Producción         |
| :------------------- | :-------------------------------------- |
| `NalunPos-Web`       | `dist/apps/NalunPos-Web/browser/`       |
| `NalunPos-Admin-Web` | `dist/apps/NalunPos-Admin-Web/browser/` |

---

## 3. Aprovisionamiento de `/config.json` en Runtime (Fail-Closed)

### 3.1 Inmutabilidad del Build y Segregación de Configuración

De acuerdo con el **ADR 0014**, el paquete de compilación estático en `dist/` es inmutable e independiente del entorno:

- **Ningún archivo `config.json` se incluye dentro de `src/public/` ni en el bundle compilado.**
- El comando `npm run verify:csp` (`tools/verify-csp.mjs`) en el flujo de CI aborta el pipeline si detecta algún `config.json` en `dist/apps/` o si encuentra la cadena `"localhost"`.
- Esta arquitectura previene por diseño que artefactos compilados con variables de depuración local alcancen entornos productivos.

### 3.2 Paso a Paso de Aprovisionamiento en el Pipeline de Despliegue

En el paso de despliegue (CD) o durante la preparación del servidor, `/config.json` debe ser generado o copiado en la raíz del directorio web antes de iniciar la distribución de tráfico:

1. **Ubicación de la Plantilla:**
   - Para `NalunPos-Web`: `apps/NalunPos-Web/config/config.example.json`
   - Para `NalunPos-Admin-Web`: `apps/NalunPos-Admin-Web/config/config.example.json`

2. **Formato Obligatorio del Archivo:**

   ```json
   {
     "apiUrl": "https://api.nalunpos.com",
     "production": true
   }
   ```

   _(Nota: `apiUrl` debe coincidir exactamente con el host declarado en `connect-src` de la Content Security Policy en `index.html`)._

3. **Copia hacia la Carpeta de Distribución:**
   En el runner de CI/CD (GitHub Actions, Cloudflare Pages build script o script de aprovisionamiento en servidor), ejecute el paso de copia:

   ```bash
   # Ejemplo para NalunPos-Web
   cp apps/NalunPos-Web/config/config.example.json dist/apps/NalunPos-Web/browser/config.json

   # Ejemplo para NalunPos-Admin-Web
   cp apps/NalunPos-Admin-Web/config/config.example.json dist/apps/NalunPos-Admin-Web/browser/config.json
   ```

   Si los valores difieren por entorno (ej. staging empresarial), genere el archivo `config.json` dinámicamente sustituyendo los secretos o variables de entorno del pipeline.

### 3.3 Comportamiento Fail-Closed

El bootstrap de la aplicación implementa `APP_INITIALIZER` a través de `AppConfigToken`:

- Si la petición HTTP a `/config.json` falla (HTTP 404, error de red o timeout), la aplicación aborta inmediatamente el inicio y muestra un error crítico en consola.
- La aplicación **nunca opera con valores por defecto en memoria**, impidiendo ejecuciones contra orígenes inseguros o no autorizados.

---

## 4. Regla de Co-Commit del ADR 0014

La directiva `connect-src` de la Content Security Policy en `index.html` y el archivo `config.example.json` deben operar bajo una sincronización estricta:

> **REGLA DE CO-COMMIT (ADR 0014):** Si el dominio o subdominio de la API backend cambia (por ejemplo, de `https://api.nalunpos.com` a un nuevo endpoint corporativo), **es obligatorio actualizar simultáneamente en el mismo commit**:
>
> 1. La directiva `connect-src` en `apps/<app>/src/index.html`.
> 2. El campo `apiUrl` en `apps/<app>/config/config.example.json`.
>
> Todo pull request que modifique un archivo sin modificar el otro será rechazado por `npm run verify:csp` en CI.

Para detalles conceptuales y vectores de mitigación de la política CSP, consulte [docs/security/headers-and-csp.md](./security/headers-and-csp.md).

---

## 5. Configuración de Cabeceras HTTP de Producción

Los navegadores web requieren que directivas como `frame-ancestors 'none'`, `Strict-Transport-Security`, `X-Content-Type-Options` y `Permissions-Policy` se transmitan mediante cabeceras HTTP emitidas por el servidor web o el edge CDN (no son admitidas en `<meta>`).

### 5.1 Cloudflare Pages (`_headers`)

Al desplegar en Cloudflare Pages, coloque un archivo nombrado `_headers` en la raíz de salida compilada (`dist/apps/<app>/browser/_headers`):

```text
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'sha256-LMY6wYoFV9I4wWzxaq1N/dTpl4iurQktw706UCHK3vM='; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob:; connect-src 'self' https://api.nalunpos.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none';
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin
```

_(Dominios de referencia en hosting: `https://app.nalunpos.com` (ejemplo) y `https://admin.nalunpos.com` (ejemplo))._

### 5.2 Nginx (`nginx.conf`)

Para despliegues en servidores virtuales o contenedores Docker bajo Nginx:

```nginx
server {
    listen 443 ssl http2;
    server_name app.nalunpos.com admin.nalunpos.com; # (ejemplo)

    root /usr/share/nginx/html;
    index index.html;

    # Content-Security-Policy estricto en cabecera HTTP
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'sha256-LMY6wYoFV9I4wWzxaq1N/dTpl4iurQktw706UCHK3vM='; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob:; connect-src 'self' https://api.nalunpos.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none';" always;

    # Cabeceras de Transporte, Aislamiento y Privacidad
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=()" always;
    add_header Cross-Origin-Opener-Policy "same-origin" always;
    add_header Cross-Origin-Resource-Policy "same-origin" always;

    # Soporte SPA: reescritura al archivo de entrada
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Desactivar cache para config.json e index.html
    location ~* (config\.json|index\.html)$ {
        add_header Cache-Control "no-cache, no-store, must-revalidate" always;
    }
}
```

### 5.3 Caddy Server (`Caddyfile`)

```caddy
app.nalunpos.com, admin.nalunpos.com { # (ejemplo)
    root * /srv/dist/apps/NalunPos-Web/browser
    file_server
    try_files {path} /index.html

    header {
        Content-Security-Policy "default-src 'self'; script-src 'self' 'sha256-LMY6wYoFV9I4wWzxaq1N/dTpl4iurQktw706UCHK3vM='; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob:; connect-src 'self' https://api.nalunpos.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none';"
        Strict-Transport-Security "max-age=31536000; includeSubDomains; preload"
        X-Content-Type-Options "nosniff"
        X-Frame-Options "DENY"
        Referrer-Policy "strict-origin-when-cross-origin"
        Permissions-Policy "camera=(), microphone=(), geolocation=()"
    }
}
```

---

## 6. Procedimiento de Verificación Post-Despliegue

Una vez completado el despliegue del artefacto y el aprovisionamiento de `/config.json`:

1. **Verificar `/config.json`:** Realizar una solicitud `GET /config.json` y constatar respuesta HTTP 200 con el `apiUrl` esperado.
2. **Verificar ausencia de errores CSP:** Abrir la consola de herramientas de desarrollo del navegador en la ruta `/login` y verificar cero advertencias `securitypolicyviolation`.
3. **Verificar cabeceras de respuesta:** Ejecutar `curl -I https://app.nalunpos.com (ejemplo)` y comprobar la presencia de `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options` y `Content-Security-Policy`.
