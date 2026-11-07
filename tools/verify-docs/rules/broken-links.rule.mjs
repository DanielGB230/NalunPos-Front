// =============================================================================
// tools/verify-docs/rules/broken-links.rule.mjs — Regla a): Enlaces Markdown rotos
// =============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { normalizePath, slugifyHeader } from '../sources.mjs';

export const ID = 'broken-links';

/**
 * Valida que los enlaces relativos apunten a archivos existentes en el monorepo
 * y que las anclas internas (#...) apunten a encabezados reales en archivos Markdown.
 */
export function check(sources) {
  const findings = [];
  const mdDocsMap = new Map(sources.markdownDocs.map((d) => [d.relPath, d]));

  for (const doc of sources.markdownDocs) {
    const docDirFull = path.dirname(doc.fullPath);

    doc.lines.forEach((lineText, lineIdx) => {
      // Expresión regular para enlaces Markdown: [texto](url)
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;

      while ((match = linkRegex.exec(lineText)) !== null) {
        const rawTarget = match[2].trim();

        // Ignorar URLs externas y mailto
        if (
          rawTarget.startsWith('http://') ||
          rawTarget.startsWith('https://') ||
          rawTarget.startsWith('mailto:') ||
          rawTarget === ''
        ) {
          continue;
        }

        const [filePathPart, anchorPart] = rawTarget.split('#');

        // Caso 1: Ancla interna dentro del mismo archivo (#seccion)
        if (!filePathPart && anchorPart) {
          const expectedSlug = slugifyHeader(anchorPart);
          const hasHeader = doc.headers.some(
            (h) => h.slug === expectedSlug || h.slug.includes(expectedSlug),
          );
          if (!hasHeader) {
            findings.push({
              rule: ID,
              file: doc.relPath,
              line: lineIdx + 1,
              message: `El ancla interna "#${anchorPart}" no coincide con ningún encabezado en ${doc.relPath}.`,
            });
          }
          continue;
        }

        // Caso 2: Enlace a archivo relativo
        if (filePathPart) {
          const resolvedPath = path.resolve(docDirFull, filePathPart);
          const relToRoot = normalizePath(path.relative(sources.rootDir, resolvedPath));

          if (!sources.repoFiles.has(relToRoot) && !fs.existsSync(resolvedPath)) {
            findings.push({
              rule: ID,
              file: doc.relPath,
              line: lineIdx + 1,
              message: `El enlace relativo "${rawTarget}" apunta a un archivo inexistente: "${relToRoot}".`,
            });
            continue;
          }

          // Si el archivo enlazado es Markdown y tiene ancla, validar que el encabezado exista en él
          if (anchorPart && relToRoot.endsWith('.md')) {
            const targetDoc = mdDocsMap.get(relToRoot);
            if (targetDoc) {
              const expectedSlug = slugifyHeader(anchorPart);
              const hasHeader = targetDoc.headers.some(
                (h) => h.slug === expectedSlug || h.slug.includes(expectedSlug),
              );
              if (!hasHeader) {
                findings.push({
                  rule: ID,
                  file: doc.relPath,
                  line: lineIdx + 1,
                  message: `El ancla "#${anchorPart}" enlazada en "${rawTarget}" no existe en el destino ${relToRoot}.`,
                });
              }
            }
          }
        }
      }
    });
  }

  return findings;
}
