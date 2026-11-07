// =============================================================================
// tools/verify-docs/rules/nx-tags-consistency.rule.mjs — Regla i): Consistencia Nx Tags
// =============================================================================

export const ID = 'nx-tags-consistency';

/**
 * Valida que toda etiqueta Nx (scope:*, type:*) citada exista en el repositorio
 * y que las asignaciones a proyectos en tablas, listas y declaraciones coincidan
 * con las declaradas en sus respectivos project.json, resueltos dinámicamente.
 */
export function check(sources) {
  const findings = [];
  const tagRegex = /\b(scope:[a-z0-9-]+|type:[a-z0-9-]+)\b/g;

  // Proyectos únicos descubiertos dinámicamente desde project.json (sin listas hardcodeadas)
  const projects = Array.from(new Set(sources.projectTags?.values() || []));

  for (const doc of sources.markdownDocs) {
    doc.lines.forEach((lineText, idx) => {
      // 1. Validar que cada etiqueta individual citada exista en el conjunto válido
      let match;
      while ((match = tagRegex.exec(lineText)) !== null) {
        const tag = match[1];
        if (!sources.validNxTags.has(tag)) {
          findings.push({
            rule: ID,
            file: doc.relPath,
            line: idx + 1,
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
          for (const proj of projects) {
            const patterns = [proj.name, proj.relPath].filter(Boolean);
            const hasProject = patterns.some(
              (p) => cells[0].includes(p) || (cells[1] && cells[1].includes(p)),
            );
            if (hasProject) {
              const rowTags = lineText.match(tagRegex) || [];
              for (const rt of rowTags) {
                if (rt.startsWith('scope:') && proj.scope && rt !== proj.scope) {
                  findings.push({
                    rule: ID,
                    file: doc.relPath,
                    line: idx + 1,
                    message: `Etiqueta errónea para ${proj.name}: cita "${rt}", pero su project.json declara "${proj.scope}".`,
                  });
                }
                if (rt.startsWith('type:') && proj.type && rt !== proj.type) {
                  findings.push({
                    rule: ID,
                    file: doc.relPath,
                    line: idx + 1,
                    message: `Etiqueta errónea para ${proj.name}: cita "${rt}", pero su project.json declara "${proj.type}".`,
                  });
                }
              }
            }
          }
        }
      }

      // 3. Validar listas directas o declaraciones en prosa con paréntesis o Tagged:
      // Ejemplos:
      // - `libs/shared/auth` (`type:data-access`)
      // - NalunPos-Web. Tagged: `["scope:web", "type:app"]`
      for (const proj of projects) {
        const patterns = [proj.name, proj.relPath].filter(Boolean);
        for (const p of patterns) {
          const escapedPattern = p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

          // Coincidencia con paréntesis inmediatamente contiguo: proyecto (scope:... o type:...)
          const parenRegex = new RegExp(
            `(?:^|\\s|\`|\\*\\*)${escapedPattern}(?:\`|\\*\\*)?\\s*\\((?:[^)]*?)?(scope:[a-z0-9-]+|type:[a-z0-9-]+)`,
            'g',
          );
          let pMatch;
          while ((pMatch = parenRegex.exec(lineText)) !== null) {
            const foundTag = pMatch[1];
            if (foundTag.startsWith('scope:') && proj.scope && foundTag !== proj.scope) {
              findings.push({
                rule: ID,
                file: doc.relPath,
                line: idx + 1,
                message: `Etiqueta errónea para ${proj.name}: cita "${foundTag}", pero su project.json declara "${proj.scope}".`,
              });
            }
            if (foundTag.startsWith('type:') && proj.type && foundTag !== proj.type) {
              findings.push({
                rule: ID,
                file: doc.relPath,
                line: idx + 1,
                message: `Etiqueta errónea para ${proj.name}: cita "${foundTag}", pero su project.json declara "${proj.type}".`,
              });
            }
          }

          // Coincidencia con sintaxis Tagged: ["...", "..."]
          const taggedRegex = new RegExp(
            `(?:^|\\s|\`|\\*\\*)${escapedPattern}(?:\`|\\*\\*)?[^\\n|]*?Tagged:\\s*\\[([^\\]]+)\\]`,
            'g',
          );
          let tMatch;
          while ((tMatch = taggedRegex.exec(lineText)) !== null) {
            const tagList = tMatch[1].match(tagRegex) || [];
            for (const t of tagList) {
              if (t.startsWith('scope:') && proj.scope && t !== proj.scope) {
                findings.push({
                  rule: ID,
                  file: doc.relPath,
                  line: idx + 1,
                  message: `Etiqueta errónea para ${proj.name}: cita "${t}", pero su project.json declara "${proj.scope}".`,
                });
              }
              if (t.startsWith('type:') && proj.type && t !== proj.type) {
                findings.push({
                  rule: ID,
                  file: doc.relPath,
                  line: idx + 1,
                  message: `Etiqueta errónea para ${proj.name}: cita "${t}", pero su project.json declara "${proj.type}".`,
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
