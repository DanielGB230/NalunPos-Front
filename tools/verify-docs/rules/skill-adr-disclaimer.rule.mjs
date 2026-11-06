// =============================================================================
// tools/verify-docs/rules/skill-adr-disclaimer.rule.mjs — Regla g): Disclaimer de ADRs en skills
// =============================================================================

import fs from 'node:fs';

export const ID = 'skill-adr-disclaimer';

const REQUIRED_DISCLAIMER_SUBSTRING = 'NalunPos-Api, NO a docs/architecture/adr';

/**
 * Valida que todo SKILL.md que cite números de ADR contenga explícitamente el descargo
 * de responsabilidad indicando que corresponden al repositorio NalunPos-Api.
 */
export function check(sources) {
  const findings = [];
  const adrMentionPattern = /\bADR\s+00\d{2}\b/i;

  for (const skill of sources.skills) {
    if (!fs.existsSync(skill.skillMdPath)) continue;

    const content = fs.readFileSync(skill.skillMdPath, 'utf8');

    // Si el skill cita algún número de ADR (de backend o frontend)
    if (adrMentionPattern.test(content)) {
      const hasBackendDisclaimer = content.includes(REQUIRED_DISCLAIMER_SUBSTRING);
      const hasFrontendLocalDisclaimer =
        content.includes('docs/architecture/adr') && content.includes('ADR');

      if (!hasBackendDisclaimer && !hasFrontendLocalDisclaimer) {
        findings.push({
          rule: ID,
          file: skill.skillMdRelPath,
          line: 1,
          message: `El archivo ${skill.skillMdRelPath} cita números de ADR pero carece del descargo obligatorio ("${REQUIRED_DISCLAIMER_SUBSTRING}" o referencia explícita a "docs/architecture/adr").`,
        });
      }
    }
  }

  return findings;
}
