import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..');

/**
 * Extrae el valor del atributo content de la etiqueta <meta http-equiv="Content-Security-Policy">
 */
function extractCspMeta(html) {
  const metaRegex = /<meta\s+([^>]*?)>/gi;
  let match;
  while ((match = metaRegex.exec(html)) !== null) {
    const attrs = match[1];
    const isCsp = /http-equiv\s*=\s*["']Content-Security-Policy["']/i.test(attrs);
    if (isCsp) {
      const contentMatch = /content\s*=\s*(?:"([^"]*)"|'([^']*)')/i.exec(attrs);
      if (contentMatch) {
        return contentMatch[1] ?? contentMatch[2] ?? '';
      }
    }
  }
  return null;
}

/**
 * Parsea las directivas de una cadena CSP en un objeto con claves en minúsculas y listas de valores.
 */
function parseCspDirectives(cspString) {
  const directives = {};
  const parts = cspString
    .split(';')
    .map((p) => p.trim())
    .filter(Boolean);
  for (const part of parts) {
    const tokens = part.split(/\s+/);
    const name = tokens[0];
    const values = tokens.slice(1);
    if (name) {
      directives[name.toLowerCase()] = values;
    }
  }
  return directives;
}

/**
 * Encuentra de forma recursiva todos los archivos index.html candidatos en la ruta dada.
 */
function findIndexFiles(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return [];
  }
  const stat = fs.statSync(targetPath);
  if (stat.isFile()) {
    return [targetPath];
  }

  const results = [];
  const entries = fs.readdirSync(targetPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(targetPath, entry.name);
    if (entry.isDirectory()) {
      const browserIndexPath = path.join(fullPath, 'browser', 'index.html');
      const directIndexPath = path.join(fullPath, 'index.html');
      if (fs.existsSync(browserIndexPath)) {
        results.push(browserIndexPath);
      } else if (fs.existsSync(directIndexPath)) {
        results.push(directIndexPath);
      } else {
        results.push(...findIndexFiles(fullPath));
      }
    } else if (entry.name === 'index.html') {
      results.push(fullPath);
    }
  }
  return Array.from(new Set(results));
}

/**
 * Detecta el nombre de la app (ej. 'NalunPos-Web' o 'NalunPos-Admin-Web') a partir de la ruta del archivo.
 */
function detectAppName(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  const match = normalized.match(/(?:dist\/)?apps\/([^/]+)/);
  if (match) {
    return match[1];
  }
  return null;
}

/**
 * Resuelve la ruta del archivo de configuración de ejemplo de producción para una app dada.
 */
function resolveAppExampleConfig(appName) {
  if (!appName) return null;
  const candidates = [
    path.join(workspaceRoot, 'apps', appName, 'config', 'config.example.json'),
    path.join(workspaceRoot, 'apps', appName, 'config', 'config.prod.example.json'),
    path.join(workspaceRoot, 'apps', appName, 'config', 'config.prod.json'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

/**
 * Verifica las restricciones de CSP sobre un archivo index.html compilado.
 */
function verifyIndexHtml(filePath) {
  const relativePath = path.relative(workspaceRoot, filePath);
  console.log(`\n[verify-csp] Analizando: ${relativePath}`);

  if (!fs.existsSync(filePath)) {
    return [`El archivo no existe: ${filePath}`];
  }

  const html = fs.readFileSync(filePath, 'utf-8');
  const errors = [];

  // d) La meta CSP existe
  const cspContent = extractCspMeta(html);
  if (!cspContent) {
    errors.push(`No se encontró la etiqueta <meta http-equiv="Content-Security-Policy">`);
    return errors;
  }

  const directives = parseCspDirectives(cspContent);

  // c) connect-src NO contiene "localhost" ni "*"
  const connectSrc = directives['connect-src'];
  let expectedApiOrigin = 'https://api.nalunpos.com'; // Origen canónico de producción por defecto (ADR 0014)

  if (!connectSrc || connectSrc.length === 0) {
    errors.push(`Directiva 'connect-src' ausente en la CSP`);
  } else {
    for (const token of connectSrc) {
      if (/localhost/i.test(token)) {
        errors.push(`'connect-src' contiene 'localhost' prohibido en producción: "${token}"`);
      }
      if (token === '*' || token === "'*'") {
        errors.push(`'connect-src' contiene comodín '*' prohibido en producción: "${token}"`);
      }
    }

    // Coherencia de connect-src con la plantilla de configuración de producción (ADR 0014)
    const appName = detectAppName(filePath);
    const configPath = resolveAppExampleConfig(appName);

    if (configPath) {
      try {
        const rawConfig = fs.readFileSync(configPath, 'utf-8');
        const parsedConfig = JSON.parse(rawConfig);
        if (!parsedConfig.apiUrl || typeof parsedConfig.apiUrl !== 'string') {
          errors.push(
            `Plantilla de configuración ${path.relative(workspaceRoot, configPath)} no contiene una propiedad 'apiUrl' válida.`,
          );
        } else {
          expectedApiOrigin = new URL(parsedConfig.apiUrl).origin;
          console.log(
            `  ℹ Plantilla config detectada (${path.relative(workspaceRoot, configPath)}): apiUrl origin = "${expectedApiOrigin}"`,
          );
        }
      } catch (err) {
        errors.push(
          `Error al parsear plantilla ${path.relative(workspaceRoot, configPath)}: ${err.message}`,
        );
      }
    } else {
      console.log(
        `  ℹ Plantilla config.example.json aún no presente en disco; validando contra origen canónico fijado por ADR 0014: "${expectedApiOrigin}"`,
      );
    }

    const hasExpectedOrigin = connectSrc.some(
      (token) => token.toLowerCase() === expectedApiOrigin.toLowerCase(),
    );
    if (!hasExpectedOrigin) {
      errors.push(
        `El origen de API canónico "${expectedApiOrigin}" NO está explícitamente incluido en 'connect-src' de la CSP. Tokens actuales: [${connectSrc.join(', ')}]`,
      );
    }
  }

  // b) No existen atributos de eventos inline on*=
  const inlineEventHandlerRegex = /\s(on[a-z]+)\s*=\s*['"][^'"]*['"]/gi;
  let eventMatch;
  while ((eventMatch = inlineEventHandlerRegex.exec(html)) !== null) {
    errors.push(`Atributo de evento inline detectado: "${eventMatch[0].trim()}"`);
  }

  // a) Cada <script> inline sin src debe tener su sha256 (base64) en script-src
  const scriptSrcTokens = directives['script-src'] || [];
  const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let scriptMatch;
  let inlineScriptCount = 0;

  while ((scriptMatch = scriptRegex.exec(html)) !== null) {
    const attrs = scriptMatch[1] || '';
    const scriptBody = scriptMatch[2] || '';

    const hasSrc = /\bsrc\s*=/i.test(attrs);
    if (!hasSrc) {
      inlineScriptCount++;
      const hash = 'sha256-' + crypto.createHash('sha256').update(scriptBody).digest('base64');
      const expectedToken = `'${hash}'`;

      const found = scriptSrcTokens.some((t) => t.toLowerCase() === expectedToken.toLowerCase());
      if (!found) {
        errors.push(
          `Script inline (#${inlineScriptCount}) con hash SHA-256 "${expectedToken}" NO está autorizado en 'script-src'.\n  Contenido: "${scriptBody.trim().substring(0, 120)}..."`,
        );
      }
    }
  }

  if (errors.length === 0) {
    console.log(`  ✓ Meta CSP presente y parseada correctamente.`);
    console.log(
      `  ✓ ${inlineScriptCount} script(s) inline verificado(s) con hash SHA-256 válido en 'script-src'.`,
    );
    console.log(`  ✓ 'connect-src' libre de 'localhost' y comodines '*'.`);
    console.log(
      `  ✓ Origen canónico de API ("${expectedApiOrigin}") verificado en 'connect-src' (ADR 0014).`,
    );
    console.log(`  ✓ Sin atributos de eventos inline ('on*=').`);
  } else {
    for (const err of errors) {
      console.error(`  ✗ ERROR: ${err}`);
    }
  }

  return errors;
}

function main() {
  const customTarget = process.argv[2];
  const targetPath = customTarget
    ? path.resolve(process.cwd(), customTarget)
    : path.join(workspaceRoot, 'dist', 'apps');

  console.log(`=============================================================================`);
  console.log(`Verificación de Content Security Policy (CSP) contra artefactos construidos`);
  console.log(`Ruta objetivo: ${targetPath}`);
  console.log(`=============================================================================`);

  const indexFiles = findIndexFiles(targetPath);

  if (indexFiles.length === 0) {
    console.error(
      `\n✗ ERROR CRÍTICO: No se encontraron archivos 'index.html' para verificar en:\n  ${targetPath}`,
    );
    console.error(`Asegúrese de ejecutar primero 'nx run-many -t build -c production'.`);
    process.exit(1);
  }

  let totalErrors = 0;
  for (const file of indexFiles) {
    const fileErrors = verifyIndexHtml(file);
    totalErrors += fileErrors.length;
  }

  console.log(`\n-----------------------------------------------------------------------------`);
  if (totalErrors > 0) {
    console.error(`✗ VERIFICACIÓN FALLIDA: Se encontraron ${totalErrors} problema(s) de CSP.`);
    process.exit(1);
  } else {
    console.log(
      `✓ VERIFICACIÓN EXITOSA: Todos los artefactos (${indexFiles.length}) cumplen estrictamente la CSP.`,
    );
    process.exit(0);
  }
}

main();
