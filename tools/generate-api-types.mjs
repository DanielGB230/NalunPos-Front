// =============================================================================
// tools/generate-api-types.mjs
// Generador determinista de tipos TypeScript desde el contrato OpenAPI v1
// Modos:
//   node tools/generate-api-types.mjs           (Genera y escribe openapi.types.ts)
//   node tools/generate-api-types.mjs --check   (Verifica que no haya deriva de tipos)
// =============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import openapiTS, { astToString } from 'openapi-typescript';
import prettier from 'prettier';

const ROOT_DIR = path.resolve(import.meta.dirname, '..');
const SCHEMA_PATH = path.join(
  ROOT_DIR,
  'libs',
  'shared',
  'data-access',
  'openapi',
  'openapi.v1.json',
);
const OUTPUT_DIR = path.join(ROOT_DIR, 'libs', 'shared', 'data-access', 'src', 'generated');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'openapi.types.ts');

const isCheckMode = process.argv.includes('--check');

async function run() {
  if (!fs.existsSync(SCHEMA_PATH)) {
    console.error(`[api:types] Error: No se encontró el snapshot OpenAPI en ${SCHEMA_PATH}`);
    process.exit(1);
  }

  const schemaUrl = pathToFileURL(SCHEMA_PATH);
  const ast = await openapiTS(schemaUrl);
  const rawTypes = astToString(ast);

  const header = `// =============================================================================
// openapi.types.ts — Tipos generados automáticamente desde openapi.v1.json
// Generado mediante: npm run api:types (tools/generate-api-types.mjs)
// NO EDITAR MANUALMENTE. Sincronizar con el contrato backend mediante npm run api:types.
// =============================================================================

`;

  const fullContent = header + rawTypes;

  const prettierConfig = (await prettier.resolveConfig(OUTPUT_PATH)) || {};
  const formatted = await prettier.format(fullContent, {
    ...prettierConfig,
    parser: 'typescript',
    filepath: OUTPUT_PATH,
  });

  // Validaciones fail-closed sobre el contenido generado
  if (/\bany\b/.test(formatted)) {
    console.error('[api:types] Error de validación: El archivo generado contiene tipos "any".');
    process.exit(1);
  }

  if (/eslint-disable/.test(formatted)) {
    console.error(
      '[api:types] Error de validación: El archivo generado contiene directivas "eslint-disable".',
    );
    process.exit(1);
  }

  const normalizedGenerated = formatted.replace(/\r\n/g, '\n');

  if (isCheckMode) {
    if (!fs.existsSync(OUTPUT_PATH)) {
      console.error(
        `[api:types:check] Error: No existe ${OUTPUT_PATH}. Ejecuta "npm run api:types" para generarlo.`,
      );
      process.exit(1);
    }

    const existingContent = fs.readFileSync(OUTPUT_PATH, 'utf8').replace(/\r\n/g, '\n');

    if (existingContent !== normalizedGenerated) {
      console.error(
        '[api:types:check] Deriva detectada en openapi.types.ts respecto a openapi.v1.json.\n' +
          'Ejecuta "npm run api:types" para sincronizar los tipos con el snapshot OpenAPI.',
      );
      process.exit(1);
    }

    console.log(
      '✓ [api:types:check] Los tipos generados están 100% sincronizados con openapi.v1.json.',
    );
    process.exit(0);
  }

  // Modo generación
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_PATH, normalizedGenerated, 'utf8');
  console.log(`✓ [api:types] Tipos generados exitosamente en ${OUTPUT_PATH}`);
}

run().catch((error) => {
  console.error('[api:types] Error durante la generación:', error);
  process.exit(1);
});
