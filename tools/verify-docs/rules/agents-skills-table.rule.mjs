// =============================================================================
// tools/verify-docs/rules/agents-skills-table.rule.mjs — Regla e): Tabla de skills
// =============================================================================

export const ID = 'agents-skills-table';

/**
 * Valida la correspondencia 1:1 entre los skills físicos en .agents/skills/
 * y los skills documentados en la tabla de AGENTS.md.
 */
export function check(sources) {
  const findings = [];
  const agentsDoc = sources.markdownDocs.find((d) => d.relPath === 'AGENTS.md');

  if (!agentsDoc) {
    findings.push({
      rule: ID,
      file: 'AGENTS.md',
      line: 1,
      message: 'No se encontró el archivo AGENTS.md en la raíz del repositorio.',
    });
    return findings;
  }

  const existingSkills = new Set(sources.skills.map((s) => s.name));
  const documentedSkills = new Set();

  // Buscar menciones a skills en la tabla de AGENTS.md:
  // Ejemplo: | **`frontend-architecture`** | [`./.agents/skills/frontend-architecture/SKILL.md`]...
  const skillRowRegex =
    /\|\s*\*\*`([^`]+)`\*\*\s*\|\s*\[`(?:\.\/)?\.agents\/skills\/([^/]+)\/SKILL\.md`\]/g;
  let match;

  agentsDoc.lines.forEach((lineText, idx) => {
    while ((match = skillRowRegex.exec(lineText)) !== null) {
      const skillName = match[1].trim();
      const folderName = match[2].trim();

      documentedSkills.add(skillName);

      if (skillName !== folderName) {
        findings.push({
          rule: ID,
          file: 'AGENTS.md',
          line: idx + 1,
          message: `El nombre del skill "${skillName}" no coincide con su carpeta "${folderName}" en la tabla de skills.`,
        });
      }

      if (!existingSkills.has(skillName)) {
        findings.push({
          rule: ID,
          file: 'AGENTS.md',
          line: idx + 1,
          message: `La tabla de AGENTS.md lista el skill "${skillName}", pero no existe su carpeta en .agents/skills/.`,
        });
      }
    }
  });

  // Comprobar que cada skill físico esté documentado en AGENTS.md
  for (const sk of sources.skills) {
    if (!documentedSkills.has(sk.name)) {
      findings.push({
        rule: ID,
        file: 'AGENTS.md',
        line: 1,
        message: `El skill existente ".agents/skills/${sk.name}" no está registrado en la tabla de skills de AGENTS.md.`,
      });
    }
  }

  return findings;
}
