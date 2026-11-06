// =============================================================================
// tools/verify-docs/rules/referenced-repo-paths.rule.mjs — Regla h): Rutas de código reales
// =============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { normalizePath } from '../sources.mjs';

export const ID = 'referenced-repo-paths';

/**
 * Valida que toda ruta concreta mencionada en la documentación bajo apps/, libs/, tools/ o e2e/
 * con extensiones de código exista físicamente en el repositorio.
 */
export function check(sources) {
  const findings = [];

  // Expresión regular que detecta rutas como `apps/...`, `libs/...`, `tools/...`, `e2e/...` con extensión concreta
  const pathRegex =
    /(?:`|'|"|\(|\s|^)((?:apps|libs|tools|e2e)\/[a-zA-Z0-9_\-./]+?\.(?:ts|html|css|json|mjs|js))(?::\d+)?(?:`|'|"|\)|\s|,|$)/g;

  for (const doc of sources.markdownDocs) {
    doc.lines.forEach((lineText, idx) => {
      let match;
      while ((match = pathRegex.exec(lineText)) !== null) {
        const rawPath = match[1].trim();

        // Ignorar comodines, placeholders arquitectónicos y rutas citadas como eliminadas/históricas
        if (
          rawPath.includes('*') ||
          rawPath.includes('<') ||
          rawPath.includes('>') ||
          rawPath.includes('...') ||
          rawPath.startsWith('src/Pos') ||
          /\b(elimin\w+|remov\w+|borr\w+|obsolet\w+|deprec\w+|anteriormente)\b/i.test(lineText)
        ) {
          continue;
        }

        const normRelPath = normalizePath(rawPath);
        const fullPath = path.join(sources.rootDir, normRelPath);

        if (!sources.repoFiles.has(normRelPath) && !fs.existsSync(fullPath)) {
          findings.push({
            rule: ID,
            file: doc.relPath,
            line: idx + 1,
            message: `La ruta de código referenciada "${rawPath}" no existe en el repositorio.`,
          });
        }
      }
    });
  }

  return findings;
}
