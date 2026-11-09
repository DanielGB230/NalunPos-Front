// =============================================================================
// tools/verify-docs/rules/nx-tags-consistency.rule.mjs — Regla i): Consistencia Nx Tags
// =============================================================================

export const ID = 'nx-tags-consistency';

/**
 * Valida que las etiquetas asignadas a un proyecto coincidan con las declaradas
 * en su project.json en tiempo de ejecución. Detecta también nombres ambiguos.
 */
export function validateProjectTagsAssignment(proj, foundTags, file, line, findings) {
  if (!proj) return;

  if (proj.isAmbiguous) {
    findings.push({
      rule: ID,
      file,
      line,
      message: `El identificador de proyecto "${proj.name}" es ambiguo y coincide con múltiples proyectos (${proj.candidates.join(', ')}). Especifique la ruta relativa o el nombre completo del proyecto.`,
    });
    return;
  }

  for (const tag of foundTags) {
    if (tag.startsWith('scope:') && proj.scope && tag !== proj.scope) {
      findings.push({
        rule: ID,
        file,
        line,
        message: `Etiqueta errónea para ${proj.name}: cita "${tag}", pero su project.json declara "${proj.scope}".`,
      });
    }
    if (tag.startsWith('type:') && proj.type && tag !== proj.type) {
      findings.push({
        rule: ID,
        file,
        line,
        message: `Etiqueta errónea para ${proj.name}: cita "${tag}", pero su project.json declara "${proj.type}".`,
      });
    }
  }
}

/**
 * Valida que toda etiqueta Nx (scope:*, type:*) citada exista en el repositorio
 * y que las asignaciones a proyectos en tablas, viñetas Tagged y paréntesis
 * inline coincidan con las declaradas en sus respectivos project.json.
 */
export function check(sources) {
  const findings = [];
  const tagRegex = /\b(scope:[a-z0-9-]+|type:[a-z0-9-]+)\b/g;

  // Resolución dinámica desde sources.resolveProject o mapa projectTags
  const resolveProject =
    sources.resolveProject ||
    ((id) => {
      if (!id || typeof id !== 'string') return null;
      const clean = id.trim().replace(/^[`*]+|[`*]+$/g, '');
      return sources.projectTags?.get(clean) || null;
    });

  for (const doc of sources.markdownDocs) {
    doc.lines.forEach((lineText, idx) => {
      const lineNum = idx + 1;

      // 1. Validar que cada etiqueta individual citada exista en el conjunto válido
      let match;
      while ((match = tagRegex.exec(lineText)) !== null) {
        const tag = match[1];
        if (!sources.validNxTags.has(tag)) {
          findings.push({
            rule: ID,
            file: doc.relPath,
            line: lineNum,
            message: `La etiqueta de Nx "${tag}" no existe en ningún project.json ni en eslint.config.js.`,
          });
        }
      }

      // 2. Validar asignaciones en tablas markdown:
      // Formato típico: | `apps/NalunPos-Web` | `scope:web` | `type:app` |
      if (lineText.includes('|')) {
        const cells = lineText
          .split('|')
          .map((c) => c.trim())
          .filter((c) => c.length > 0);
        if (cells.length >= 2) {
          let proj = null;
          for (let c = 0; c < Math.min(2, cells.length); c++) {
            const cell = cells[c];
            const codeMatch = cell.match(/`([^`]+)`/);
            const candidate = codeMatch
              ? codeMatch[1].trim()
              : cell.replace(/^[*_]+|[*_]+$/g, '').trim();
            proj = resolveProject(candidate);
            if (proj) break;
          }
          if (proj) {
            const rowTags = lineText.match(tagRegex) || [];
            validateProjectTagsAssignment(proj, rowTags, doc.relPath, lineNum, findings);
          }
        }
      }

      // 3. Validar líneas con formato "Tagged: `[...]`" o "Tagged: [...]"
      // Tolera acentos graves y comillas opcionales
      // Ejemplos:
      // - `auth`: ... Tagged: `["scope:shared", "type:data-access"]`.
      // - **`apps/NalunPos-Admin-Web`**: ... Tagged: `["scope:admin", "type:app"]`.
      const taggedRegex = /Tagged:\s*`?\[([^\]]+)\]`?/gi;
      let tMatch;
      while ((tMatch = taggedRegex.exec(lineText)) !== null) {
        const tagList = tMatch[1].match(tagRegex) || [];
        if (tagList.length > 0) {
          const prefix = lineText.substring(0, tMatch.index);
          let proj = null;

          // Intentar resolver desde el identificador al inicio de la viñeta
          const bulletMatch = prefix.match(
            /^\s*(?:[-*]\s+)?(?:\*\*)?`?([a-zA-Z0-9_\-\.\/]+)`?(?:\*\*)?:?/,
          );
          if (bulletMatch) {
            proj = resolveProject(bulletMatch[1]);
          }

          // Si no resolvió, buscar tokens entre backticks en el prefijo
          if (!proj) {
            const codeMatches = Array.from(prefix.matchAll(/`([^`]+)`/g));
            for (const cm of codeMatches) {
              const candidate = resolveProject(cm[1]);
              if (candidate) {
                proj = candidate;
                break;
              }
            }
          }

          if (proj) {
            validateProjectTagsAssignment(proj, tagList, doc.relPath, lineNum, findings);
          }
        }
      }

      // 4. Validar menciones inline con paréntesis inmediatamente adyacente:
      // Formato: `proyecto` (tag) o **proyecto** (tag)
      // Ejemplo: `libs/shared/ui` (`type:ui`) no puede depender de `libs/shared/auth` (`type:data-access`).
      const parenRegex = /(?:`|\*\*)([^`*]+)(?:`|\*\*)\s*\(([^)]+)\)/g;
      let pMatch;
      while ((pMatch = parenRegex.exec(lineText)) !== null) {
        const candidateId = pMatch[1].trim();
        const parenContent = pMatch[2];
        const tagsInParen = parenContent.match(tagRegex) || [];
        if (tagsInParen.length > 0) {
          const proj = resolveProject(candidateId);
          if (proj) {
            validateProjectTagsAssignment(proj, tagsInParen, doc.relPath, lineNum, findings);
          }
        }
      }
    });
  }

  return findings;
}
