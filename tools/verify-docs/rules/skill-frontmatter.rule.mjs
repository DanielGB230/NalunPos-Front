// =============================================================================
// tools/verify-docs/rules/skill-frontmatter.rule.mjs — Regla f): Frontmatter de skills
// =============================================================================

import fs from 'node:fs';

export const ID = 'skill-frontmatter';

/**
 * Valida que cada SKILL.md cuente con frontmatter YAML válido con name y description no vacíos,
 * y que name coincida exactamente con el nombre de su carpeta contenedora.
 */
export function check(sources) {
  const findings = [];

  for (const skill of sources.skills) {
    if (!fs.existsSync(skill.skillMdPath)) continue;

    const content = fs.readFileSync(skill.skillMdPath, 'utf8');
    const lines = content.split(/\r?\n/);

    if (lines[0]?.trim() !== '---') {
      findings.push({
        rule: ID,
        file: skill.skillMdRelPath,
        line: 1,
        message: `El archivo ${skill.skillMdRelPath} no inicia con el delimitador de frontmatter "---".`,
      });
      continue;
    }

    let closingIdx = -1;
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === '---') {
        closingIdx = i;
        break;
      }
    }

    if (closingIdx === -1) {
      findings.push({
        rule: ID,
        file: skill.skillMdRelPath,
        line: 1,
        message: `El archivo ${skill.skillMdRelPath} no contiene el delimitador de cierre de frontmatter "---".`,
      });
      continue;
    }

    const frontmatterLines = lines.slice(1, closingIdx);
    let nameValue = null;
    let descriptionValue = null;

    frontmatterLines.forEach((l) => {
      const nameMatch = l.match(/^name:\s*(.+)$/);
      if (nameMatch) nameValue = nameMatch[1].trim().replace(/^['"]|['"]$/g, '');

      const descMatch = l.match(/^description:\s*(.+)$/);
      if (descMatch) descriptionValue = descMatch[1].trim().replace(/^['"]|['"]$/g, '');
    });

    if (!nameValue) {
      findings.push({
        rule: ID,
        file: skill.skillMdRelPath,
        line: 2,
        message: `El frontmatter de ${skill.skillMdRelPath} carece de la propiedad "name" o está vacía.`,
      });
    } else if (nameValue !== skill.name) {
      findings.push({
        rule: ID,
        file: skill.skillMdRelPath,
        line: 2,
        message: `El nombre "${nameValue}" en el frontmatter no coincide con el directorio "${skill.name}".`,
      });
    }

    if (!descriptionValue) {
      findings.push({
        rule: ID,
        file: skill.skillMdRelPath,
        line: 2,
        message: `El frontmatter de ${skill.skillMdRelPath} carece de la propiedad "description" o está vacía.`,
      });
    }
  }

  return findings;
}
