// =============================================================================
// tools/verify-docs/rules/obsolete-terms.rule.mjs — Regla d): Términos obsoletos
// =============================================================================

import { VERIFY_DOCS_CONFIG } from '../config.mjs';

export const ID = 'obsolete-terms';

/**
 * Valida que ningún documento contenga términos, rangos o interceptores obsoletos.
 */
export function check(sources) {
  const findings = [];

  for (const doc of sources.markdownDocs) {
    doc.lines.forEach((lineText, idx) => {
      for (const term of VERIFY_DOCS_CONFIG.obsoleteTerms) {
        if (term.pattern.test(lineText)) {
          findings.push({
            rule: ID,
            file: doc.relPath,
            line: idx + 1,
            message: term.message,
          });
        }
      }
    });
  }

  return findings;
}

