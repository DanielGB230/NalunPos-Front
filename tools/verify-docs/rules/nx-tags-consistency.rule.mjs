// =============================================================================
// tools/verify-docs/rules/nx-tags-consistency.rule.mjs — Regla i): Consistencia Nx Tags
// =============================================================================

export const ID = 'nx-tags-consistency';

/**
 * Valida que toda etiqueta Nx (scope:*, type:*) citada exista en el repositorio
 * y que las asignaciones a proyectos en tablas, listas y declaraciones coincidan
 * con las declaradas en sus respectivos project.json.
 */
export function check(sources) {
  const findings = [];
  const tagRegex = /\b(scope:[a-z0-9-]+|type:[a-z0-9-]+)\b/g;

  // Mapa de proyectos con sus identificadores inequívocos
  const knownProjects = [
    {
      name: 'NalunPos-Web',
      patterns: ['NalunPos-Web', 'apps/NalunPos-Web'],
      expectedScope: 'scope:web',
      expectedType: 'type:app',
    },
    {
      name: 'NalunPos-Admin-Web',
      patterns: ['NalunPos-Admin-Web', 'apps/NalunPos-Admin-Web'],
      expectedScope: 'scope:admin',
      expectedType: 'type:app',
    },
    {
      name: 'shared-auth',
      patterns: ['shared-auth', 'libs/shared/auth'],
      expectedScope: 'scope:shared',
      expectedType: 'type:data-access',
    },
    {
      name: 'shared-data-access',
      patterns: ['shared-data-access', 'libs/shared/data-access'],
      expectedScope: 'scope:shared',
      expectedType: 'type:data-access',
    },
    {
      name: 'shared-ui',
      patterns: ['shared-ui', 'libs/shared/ui'],
      expectedScope: 'scope:shared',
      expectedType: 'type:ui',
    },
    {
      name: 'shared-util',
      patterns: ['shared-util', 'libs/shared/util'],
      expectedScope: 'scope:shared',
      expectedType: 'type:util',
    },
    {
      name: 'shared-design-tokens',
      patterns: ['shared-design-tokens', 'libs/shared/design-tokens'],
      expectedScope: 'scope:shared',
      expectedType: 'type:util',
    },
  ];

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
          for (const proj of knownProjects) {
            const hasProject = proj.patterns.some(
              (p) => cells[0].includes(p) || (cells[1] && cells[1].includes(p)),
            );
            if (hasProject) {
              const rowTags = lineText.match(tagRegex) || [];
              for (const rt of rowTags) {
                if (rt.startsWith('scope:') && rt !== proj.expectedScope) {
                  findings.push({
                    rule: ID,
                    file: doc.relPath,
                    line: idx + 1,
                    message: `Etiqueta errónea para ${proj.name}: cita "${rt}", pero su project.json declara "${proj.expectedScope}".`,
                  });
                }
                if (rt.startsWith('type:') && rt !== proj.expectedType) {
                  findings.push({
                    rule: ID,
                    file: doc.relPath,
                    line: idx + 1,
                    message: `Etiqueta errónea para ${proj.name}: cita "${rt}", pero su project.json declara "${proj.expectedType}".`,
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
      for (const proj of knownProjects) {
        for (const p of proj.patterns) {
          // Coincidencia con paréntesis inmediatamente contiguo: proyecto (scope:... o type:...)
          // El paréntesis debe ir inmediatamente tras el nombre del proyecto (solo permitiendo Markdown ` o ** y espacios)
          const escapedPattern = p.replace('/', '\\/');
          const parenRegex = new RegExp(
            `(?:^|\\s|\`|\\*\\*)${escapedPattern}(?:\`|\\*\\*)?\\s*\\((?:[^)]*?)?(scope:[a-z0-9-]+|type:[a-z0-9-]+)`,
            'g',
          );
          let pMatch;
          while ((pMatch = parenRegex.exec(lineText)) !== null) {
            const foundTag = pMatch[1];
            if (foundTag.startsWith('scope:') && foundTag !== proj.expectedScope) {
              findings.push({
                rule: ID,
                file: doc.relPath,
                line: idx + 1,
                message: `Etiqueta errónea para ${proj.name}: cita "${foundTag}", pero su project.json declara "${proj.expectedScope}".`,
              });
            }
            if (foundTag.startsWith('type:') && foundTag !== proj.expectedType) {
              findings.push({
                rule: ID,
                file: doc.relPath,
                line: idx + 1,
                message: `Etiqueta errónea para ${proj.name}: cita "${foundTag}", pero su project.json declara "${proj.expectedType}".`,
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
              if (t.startsWith('scope:') && t !== proj.expectedScope) {
                findings.push({
                  rule: ID,
                  file: doc.relPath,
                  line: idx + 1,
                  message: `Etiqueta errónea para ${proj.name}: cita "${t}", pero su project.json declara "${proj.expectedScope}".`,
                });
              }
              if (t.startsWith('type:') && t !== proj.expectedType) {
                findings.push({
                  rule: ID,
                  file: doc.relPath,
                  line: idx + 1,
                  message: `Etiqueta errónea para ${proj.name}: cita "${t}", pero su project.json declara "${proj.expectedType}".`,
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
