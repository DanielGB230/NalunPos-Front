# Directrices de Seguridad HTTP y Content Security Policy (CSP)

Este documento especifica la política de cabeceras HTTP de seguridad, configuración de Content Security Policy (CSP) en el cliente y en el servidor, y directrices de mitigación de vulnerabilidades para las aplicaciones frontend de **NalunPos** (`NalunPos-Web` y `NalunPos-Admin-Web`).

---

## 1. Estrategia de Dos Capas para CSP y Cabeceras de Seguridad

Por especificación del estándar W3C (CSP Level 2 y 3), existen directivas de seguridad que los navegadores web **únicamente** procesan si son entregadas en las cabeceras de respuesta HTTP del servidor web o reverse proxy, siendo ignoradas si se declaran en una etiqueta `<meta>`.

Por ende, NalunPos implementa una estrategia de **Defensa en Profundidad en Dos Capas**:

1. **Capa Cliente (`<meta>` en `index.html` / `index.dev.html`)**: Protección intrínseca que viaja con los artefactos estáticos (SPA), activa incluso si la aplicación es probada localmente o servida sin configuración de servidor avanzada.
2. **Capa Servidor/Edge (Nginx / Cloudflare / Caddy)**: Inyección obligatoria de cabeceras de transporte, aislamiento de contexto y directivas no soportadas por `<meta>`.

---

## 2. Segregación Estricta de Entornos: Producción vs Desarrollo

Para garantizar el principio de mínimo privilegio en runtime, se segregan por completo las políticas CSP según el target de compilación en `project.json`:

### 2.1 Política de Producción (`src/index.html`)

El archivo `index.html` de producción elimina por completo cualquier mención a `localhost`, puertos de depuración y comodines abiertos (`*`):

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'sha256-LMY6wYoFV9I4wWzxaq1N/dTpl4iurQktw706UCHK3vM='; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob:; connect-src 'self' https://api.nalunpos.com; object-src 'none'; base-uri 'self';"
/>
```

#### Desglose de Directivas en Producción:

- **`default-src 'self'`**: Todo recurso no especificado explícitamente se restringe al origen de la aplicación.
- **`script-src 'self' 'sha256-LMY6wYoFV9I4wWzxaq1N/dTpl4iurQktw706UCHK3vM='`**:
  - Restringe la ejecución exclusivamente a scripts compilados y empaquetados por el build de producción (`'self'`).
  - Prohíbe `'unsafe-inline'`, `'unsafe-eval'` y `'unsafe-hashes'`.
  - El hash SHA-256 determinista `'sha256-LMY6wYoFV9I4wWzxaq1N/dTpl4iurQktw706UCHK3vM='` es indispensable para la carga asíncrona de estilos de Angular CLI (ver sección 3).
- **`style-src 'self' 'unsafe-inline'`**: Permite estilos compilados y clases utilitarias dinámicas inyectadas por Tailwind CSS v4 y Angular Material M3.
- **`font-src 'self' data:`**: Todas las tipografías corporativas (Inter, Plus Jakarta Sans, JetBrains Mono, Material Symbols) se alojan de forma autónoma en el bundle (`@fontsource`). Cero dependencias externas en runtime.
- **`img-src 'self' data: blob:`**: Permite únicamente imágenes del mismo origen, Data-URI (códigos QR / avatares dinámicos) y objetos Blob locales. Se eliminó el comodín genérico `https:` para evitar filtraciones por carga de recursos no autenticados.
- **`connect-src 'self' https://api.nalunpos.com`**: Restringe las llamadas `fetch`, `XMLHttpRequest` y WebSocket estrictamente al origen propio (`'self'`) y al host canónico exacto de la API backend en producción (`https://api.nalunpos.com`). Cero comodines (`*`) y cero orígenes de desarrollo local (`localhost`).
- **`object-src 'none'`**: Bloquea por completo plugins obsoletos y vectores heredados (Flash, Java, Silverlight).
- **`base-uri 'self'`**: Previene ataques de inyección de etiquetas `<base href>` manipuladas.

### 2.2 Política de Desarrollo Local (`src/index.dev.html`)

Para permitir la depuración local con ASP.NET Core (`https://localhost:7232` u otros puertos de backend), el build de desarrollo (`configurations.development` en `project.json`) reemplaza el archivo de entrada mediante la opción `"index"`:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'sha256-LMY6wYoFV9I4wWzxaq1N/dTpl4iurQktw706UCHK3vM='; style-src 'self' 'unsafe-inline'; font-src 'self' data:; img-src 'self' data: blob: https:; connect-src 'self' http://localhost:* https://localhost:* https://api.nalunpos.com; object-src 'none'; base-uri 'self';"
/>
```

En desarrollo, `connect-src` incluye `http://localhost:*` y `https://localhost:*`, permitiendo al desarrollador conectar con el API backend ejecutándose en un puerto local arbitrario.

### 2.3 Origen Canónico de API y Estrategia de Despliegue (ADR 0014)

Conforme a lo resuelto en el **ADR 0014**, el ecosistema de producción opera bajo una regla de origen canónico estricto:

1. **Host Canónico Único:**
   - En producción, el host de backend autorizado es única y exclusivamente `https://api.nalunpos.com`.
   - La CSP embebida en `<meta>` en `src/index.html` lo lista de manera explícita y literal en `connect-src`.
   - Se prohíben taxativamente comodines (`*`) o comodines de subdominio (`*.nalunpos.com`) en la CSP del cliente SPA.

2. **Regla de Co-Commit Sincronizado:**
   - La directiva `connect-src` y la configuración de runtime (`/config.json`, plantilla `config.example.json`) deben estar 100% alineadas en todo momento.
   - Si la infraestructura empresarial requiere alterar el dominio o subdominio de la API, **es mandatorio actualizar la directiva `connect-src` en `src/index.html` y la plantilla de configuración en el mismo commit**. No es admisible un commit que modifique una sin la otra.

3. **Estrategia y Flujo de Despliegue (Fail-Closed):**
   - **Compilación e Inmutabilidad:** `nx run-many -t build -c production` genera los artefactos estáticos inmutables en `dist/apps/*/browser`. Por política de seguridad, **ningún archivo `config.json` es incluido en el bundle compilado `dist/`**, evitando por diseño arranques accidentales contra `localhost` u orígenes de desarrollo.
   - **Verificación Automatizada en CI:** Como paso posterior inmediato al build en GitHub Actions, se ejecuta `npm run verify:csp` (`tools/verify-csp.mjs`). Este script valida:
     a) Que existan obligatoriamente las plantillas `apps/<app>/config/config.example.json` con `"production": true` y origen autorizado.
     b) Que ningún archivo `config.json` exista en `dist/apps/`.
     c) Que ningún archivo compilado (`.html`, `.js`, `.css`, `.json`) contenga la cadena `"localhost"`.
     d) Que el `apiUrl` canónico esté explícitamente permitido en `connect-src` de la CSP. Si existe cualquier discrepancia o residuo, el job falla y cancela el despliegue.
   - **Aprovisionamiento Operativo y Fail-Closed:** El procedimiento paso a paso para proveer `/config.json` en runtime en servidores web o Cloudflare Pages y el comportamiento fail-closed se detallan en [docs/deployment.md](../deployment.md#3-aprovisionamiento-de-configjson-en-runtime-fail-closed).

---

## 3. Evaluación de `'unsafe-hashes'` y Hash SHA-256 en `script-src`

### 3.1 Eliminación de `'unsafe-hashes'`

En la Fase 0.1 se utilizó preventivamente `'unsafe-hashes'` ante la suposición de un manejador de evento inline `onload`.
Tras la auditoría técnica en Fase 0.2, **se eliminó por completo `'unsafe-hashes'`**, dado que el compilador de Angular 22 (`@angular/build:application` con Beasties) inyecta un elemento `<script>` explícito y no un atributo de evento en el DOM. Por estándar W3C CSP, las etiquetas `<script>` se autorizan directamente mediante su hash criptográfico SHA-256 sin requerir `'unsafe-hashes'`, resultando en una directiva más estricta y segura.

### 3.2 Cadena Exacta y Hash Requerido

- **Cadena en el DOM generada por Beasties**:
  ```javascript
  document.querySelectorAll('link[data-beasties-media]').forEach(function (l) {
    l.media = l.getAttribute('data-beasties-media');
    l.removeAttribute('data-beasties-media');
  });
  ```
- **Cálculo criptográfico**: `crypto.createHash('sha256').update("document.querySelectorAll('link[data-beasties-media]').forEach(function(l){l.media=l.getAttribute('data-beasties-media');l.removeAttribute('data-beasties-media')})").digest('base64')`
- **Hash resultante**: `sha256-LMY6wYoFV9I4wWzxaq1N/dTpl4iurQktw706UCHK3vM=`

### 3.3 Mecanismo que lo Requiere

Angular CLI activa por defecto la extracción de CSS crítico (`optimization.styles.inlineCritical: true`).
Bajo este mecanismo:

1. El CSS esencial para el First Contentful Paint se inyecta directamente en un bloque `<style>` en el `<head>`.
2. Para evitar bloquear el hilo principal con el resto de hojas de estilo globales (`styles.css` y Angular Material M3), la etiqueta `<link>` se genera en modo diferido:
   ```html
   <link rel="stylesheet" href="styles-XXXX.css" media="print" data-beasties-media="all" />
   <noscript><link rel="stylesheet" href="styles-XXXX.css" /></noscript>
   ```
3. Al final del `<body>`, Beasties inserta el micro-script que restaura `media="all"`.
4. El hash SHA-256 autoriza deterministamente la ejecución de este micro-script específico sin habilitar `'unsafe-inline'`, garantizando que los smoke tests de Playwright y las visitas en producción no sufran bloqueos de CSP ni excepciones de consola.

---

## 4. Capa Servidor / Reverse Proxy (Despliegue Real)

Las siguientes directivas y cabeceras **NO PUEDEN** ser aplicadas vía `<meta>` (los navegadores emiten advertencias y descartan las directivas si se colocan en `<meta>`):

| Cabecera / Directiva               | Nivel de Inyección | Motivo / Justificación Técnica W3C                                                                                                       |
| ---------------------------------- | :----------------: | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `frame-ancestors 'none'`           | Cabecera HTTP CSP  | W3C CSP prohíbe evaluar `frame-ancestors` en el DOM; debe evaluarse antes de pintar el documento para evitar clickjacking en `<iframe>`. |
| `Strict-Transport-Security` (HSTS) |   Cabecera HTTP    | Obliga al navegador a usar TLS/HTTPS; ignorada totalmente dentro de `<meta>`.                                                            |
| `X-Content-Type-Options: nosniff`  |   Cabecera HTTP    | Controla el análisis MIME en la fase de red del navegador.                                                                               |
| `Referrer-Policy`                  |   Cabecera HTTP    | Previene filtración de URIs sensibles en la cabecera `Referer` en saltos cross-origin.                                                   |
| `Permissions-Policy`               |   Cabecera HTTP    | Deshabilita hardware no utilizado (cámara, micrófono, geolocalización) a nivel de proceso del navegador.                                 |

---

## 5. Configuración en Servidores y Edge CDNs

Para evitar la duplicación de directivas operativas de infraestructura, los archivos de configuración listos para producción para **Cloudflare Pages** (`_headers`), **Nginx** (`nginx.conf`) y **Caddy** (`Caddyfile`) están centralizados y documentados en [docs/deployment.md](../deployment.md#5-configuración-de-cabeceras-http-de-producción).

---

## 6. Reglas de Higiene de Código en el Frontend

Para asegurar la integridad del DOM y prevenir vulnerabilidades XSS en el cliente:

1. **Prohibido `innerHTML`**: Ningún componente de Angular debe asignar contenido a la propiedad `innerHTML` de forma cruda ni a través de directivas personalizadas no sanitizadas.
2. **Prohibido `bypassSecurityTrust*`**: Está estrictamente vetado el uso de métodos de `DomSanitizer` como `bypassSecurityTrustHtml`, `bypassSecurityTrustScript` o `bypassSecurityTrustResourceUrl` sin una revisión de seguridad y justificación formal en un ADR.
3. **Escapado Automático**: Toda interpolación debe realizarse a través del motor nativo de plantillas de Angular (`{{ value }}`), el cual aplica sanitización contextual y escapado estricto por defecto.
4. **Validación Determinista**: Todos los datos de entrada provenientes de formularios o parámetros de URL son tipados y validados con Zod / Signal Forms antes de ser procesados por la capa de lógica.
