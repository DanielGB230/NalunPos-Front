import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultWorkspaceRoot = path.resolve(__dirname, '..');

const REQUIRED_APPS = ['NalunPos-Web', 'NalunPos-Admin-Web'];

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
  for (const app of REQUIRED_APPS) {
    if (normalized.includes(app)) {
      return app;
    }
  }
  const match = normalized.match(/(?:dist\/)?apps\/([^/]+)/);
  if (match) {
    return match[1];
  }
  return null;
}

/**
 * Verifica la existencia y contenido de las plantillas apps/<app>/config/config.example.json.
 */
function verifyAppTemplates(appsRoot) {
  console.log(
    `\n--- 1. Verificación de plantillas de configuración de producción (config.example.json) ---`,
  );
  const errors = [];
  const appConfigs = {};

  for (const app of REQUIRED_APPS) {
    const configPath = path.join(appsRoot, 'apps', app, 'config', 'config.example.json');
    const relativePath = path.relative(appsRoot, configPath);

    if (!fs.existsSync(configPath)) {
      errors.push(`Falta la plantilla requerida de configuración de producción: ${relativePath}`);
      console.error(`  ✗ ERROR: ${relativePath} no existe.`);
      continue;
    }

    try {
      const raw = fs.readFileSync(configPath, 'utf-8');
      const parsed = JSON.parse(raw);

      if (typeof parsed.apiUrl !== 'string' || !parsed.apiUrl.trim()) {
        errors.push(`La plantilla ${relativePath} debe contener una propiedad 'apiUrl' no vacía.`);
      }

      if (parsed.production !== true) {
        errors.push(
          `La plantilla ${relativePath} debe contener '"production": true' (se encontró: ${parsed.production}).`,
        );
      }

      const parsedUrl = new URL(parsed.apiUrl);
      appConfigs[app] = {
        configPath,
        apiUrl: parsed.apiUrl,
        origin: parsedUrl.origin,
      };
      console.log(`  ✓ ${relativePath} verificado: production=true, origin="${parsedUrl.origin}"`);
    } catch (err) {
      errors.push(`Error al leer o parsear ${relativePath}: ${err.message}`);
      console.error(`  ✗ ERROR: ${relativePath}: ${err.message}`);
    }
  }

  return { errors, appConfigs };
}

/**
 * Verifica que NO exista ningún archivo config.json dentro de la carpeta de artefactos de distribución.
 */
function verifyNoConfigJsonInDist(distDir, workspaceRoot) {
  console.log(`\n--- 2. Verificación de exclusión de config.json en artefactos compilados ---`);
  const errors = [];
  if (!fs.existsSync(distDir)) {
    return errors;
  }

  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(full);
      } else if (entry.name.toLowerCase() === 'config.json') {
        const rel = path.relative(workspaceRoot, full);
        errors.push(`Archivo 'config.json' de desarrollo detectado indebidamente en dist: ${rel}`);
        console.error(`  ✗ ERROR: Archivo config.json presente en el artefacto: ${rel}`);
      }
    }
  }

  scan(distDir);
  if (errors.length === 0) {
    console.log(`  ✓ Ningún archivo 'config.json' encontrado en los artefactos compilados.`);
  }
  return errors;
}

/**
 * Verifica que ningún archivo (.html, .js, .css, .json) dentro de dist contenga la cadena 'localhost'.
 */
function verifyNoLocalhostInDist(distDir, workspaceRoot) {
  console.log(`\n--- 3. Verificación de ausencia de 'localhost' en artefactos compilados ---`);
  const errors = [];
  if (!fs.existsSync(distDir)) {
    return errors;
  }

  const validExts = new Set(['.html', '.js', '.css', '.json']);

  function scan(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scan(full);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (validExts.has(ext)) {
          const content = fs.readFileSync(full, 'utf-8');
          if (/localhost/i.test(content)) {
            const rel = path.relative(workspaceRoot, full);
            errors.push(`Cadena 'localhost' prohibida detectada en artefacto: ${rel}`);
            console.error(`  ✗ ERROR: ${rel} contiene la cadena 'localhost'.`);
          }
        }
      }
    }
  }

  scan(distDir);
  if (errors.length === 0) {
    console.log(
      `  ✓ Cero apariciones de 'localhost' en todos los archivos compilados (.html, .js, .css, .json).`,
    );
  }
  return errors;
}

/**
 * Verifica las restricciones de CSP sobre un archivo index.html compilado.
 */
function verifyIndexHtml(filePath, appConfigs, workspaceRoot) {
  const relativePath = path.relative(workspaceRoot, filePath);
  console.log(`\n--- 4. Verificación de CSP en index.html: ${relativePath} ---`);

  if (!fs.existsSync(filePath)) {
    return [`El archivo no existe: ${filePath}`];
  }

  const html = fs.readFileSync(filePath, 'utf-8');
  const errors = [];

  // d) La meta CSP existe
  const cspContent = extractCspMeta(html);
  if (!cspContent) {
    errors.push(
      `No se encontró la etiqueta <meta http-equiv="Content-Security-Policy"> en ${relativePath}`,
    );
    console.error(`  ✗ ERROR: Etiqueta meta CSP ausente.`);
    return errors;
  }

  const directives = parseCspDirectives(cspContent);

  // c) connect-src NO contiene "localhost" ni "*"
  const connectSrc = directives['connect-src'];
  const appName = detectAppName(filePath);
  const appConfig = appName ? appConfigs[appName] : null;
  const expectedApiOrigin = appConfig ? appConfig.origin : 'https://api.nalunpos.com';

  if (!connectSrc || connectSrc.length === 0) {
    errors.push(`Directiva 'connect-src' ausente en la CSP de ${relativePath}`);
    console.error(`  ✗ ERROR: Directiva connect-src ausente.`);
  } else {
    for (const token of connectSrc) {
      if (/localhost/i.test(token)) {
        errors.push(
          `'connect-src' contiene 'localhost' prohibido en producción: "${token}" en ${relativePath}`,
        );
      }
      if (token === '*' || token === "'*'") {
        errors.push(
          `'connect-src' contiene comodín '*' prohibido en producción: "${token}" en ${relativePath}`,
        );
      }
    }

    const hasExpectedOrigin = connectSrc.some(
      (token) => token.toLowerCase() === expectedApiOrigin.toLowerCase(),
    );
    if (!hasExpectedOrigin) {
      errors.push(
        `El origen de API canónico "${expectedApiOrigin}" de config.example.json NO está en 'connect-src' de ${relativePath}. Tokens: [${connectSrc.join(', ')}]`,
      );
      console.error(
        `  ✗ ERROR: Origen "${expectedApiOrigin}" no autorizado en connect-src: [${connectSrc.join(', ')}]`,
      );
    }
  }

  // b) No existen atributos de eventos inline on*=
  const inlineEventHandlerRegex = /\s(on[a-z]+)\s*=\s*['"][^'"]*['"]/gi;
  let eventMatch;
  while ((eventMatch = inlineEventHandlerRegex.exec(html)) !== null) {
    errors.push(
      `Atributo de evento inline detectado: "${eventMatch[0].trim()}" en ${relativePath}`,
    );
    console.error(`  ✗ ERROR: Evento inline "${eventMatch[0].trim()}".`);
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
          `Script inline (#${inlineScriptCount}) con hash SHA-256 "${expectedToken}" NO está autorizado en 'script-src' en ${relativePath}.\n  Contenido: "${scriptBody.trim().substring(0, 120)}..."`,
        );
        console.error(`  ✗ ERROR: Script inline con hash ${expectedToken} no autorizado.`);
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
  }

  return errors;
}

function main() {
  const customDistTarget = process.argv[2];
  const customWorkspaceRoot = process.argv[3];

  const workspaceRoot = customWorkspaceRoot
    ? path.resolve(process.cwd(), customWorkspaceRoot)
    : defaultWorkspaceRoot;

  const targetDistPath = customDistTarget
    ? path.resolve(process.cwd(), customDistTarget)
    : path.join(workspaceRoot, 'dist', 'apps');

  console.log(`=============================================================================`);
  console.log(`Verificación de Artefactos de Producción y Content Security Policy (CSP)`);
  console.log(`Workspace:  ${workspaceRoot}`);
  console.log(`Artefactos: ${targetDistPath}`);
  console.log(`=============================================================================`);

  let totalErrors = 0;

  // 1. Validar plantillas apps/*/config/config.example.json
  const { errors: templateErrors, appConfigs } = verifyAppTemplates(workspaceRoot);
  totalErrors += templateErrors.length;

  // 2. Validar que no exista config.json en dist
  const noConfigJsonErrors = verifyNoConfigJsonInDist(targetDistPath, workspaceRoot);
  totalErrors += noConfigJsonErrors.length;

  // 3. Validar que no exista "localhost" en dist
  const noLocalhostErrors = verifyNoLocalhostInDist(targetDistPath, workspaceRoot);
  totalErrors += noLocalhostErrors.length;

  // 4. Validar index.html y CSP en cada bundle
  const indexFiles = findIndexFiles(targetDistPath);
  if (indexFiles.length === 0) {
    console.error(
      `\n✗ ERROR CRÍTICO: No se encontraron archivos 'index.html' en:\n  ${targetDistPath}`,
    );
    process.exit(1);
  }

  for (const file of indexFiles) {
    const fileErrors = verifyIndexHtml(file, appConfigs, workspaceRoot);
    totalErrors += fileErrors.length;
  }

  console.log(`\n=============================================================================`);
  if (totalErrors > 0) {
    console.error(
      `✗ VERIFICACIÓN FALLIDA: Se encontraron ${totalErrors} problema(s) en artefactos.`,
    );
    process.exit(1);
  } else {
    console.log(
      `✓ VERIFICACIÓN EXITOSA: Todos los artefactos cumplen estrictamente seguridad y CSP.`,
    );
    process.exit(0);
  }
}

main();
