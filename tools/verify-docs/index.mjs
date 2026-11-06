// =============================================================================
// tools/verify-docs/index.mjs — Ejecutor CLI de verificación de documentación
// =============================================================================

import { loadRepoSources } from './sources.mjs';
import * as brokenLinksRule from './rules/broken-links.rule.mjs';
import * as adrIndexSyncRule from './rules/adr-index-sync.rule.mjs';
import * as npmScriptsRule from './rules/npm-scripts.rule.mjs';
import * as obsoleteTermsRule from './rules/obsolete-terms.rule.mjs';
import * as agentsSkillsTableRule from './rules/agents-skills-table.rule.mjs';
import * as skillFrontmatterRule from './rules/skill-frontmatter.rule.mjs';
import * as skillAdrDisclaimerRule from './rules/skill-adr-disclaimer.rule.mjs';
import * as referencedRepoPathsRule from './rules/referenced-repo-paths.rule.mjs';
import * as nxTagsConsistencyRule from './rules/nx-tags-consistency.rule.mjs';

export const RULES = [
  brokenLinksRule,
  adrIndexSyncRule,
  npmScriptsRule,
  obsoleteTermsRule,
  agentsSkillsTableRule,
  skillFrontmatterRule,
  skillAdrDisclaimerRule,
  referencedRepoPathsRule,
  nxTagsConsistencyRule,
];

/**
 * Ejecuta el conjunto completo de reglas sobre el repositorio indicado.
 * Retorna { success: boolean, findings: Array, stats: Object }
 */
export function runVerifyDocs(rootDir = process.cwd()) {
  const sources = loadRepoSources(rootDir);
  const allFindings = [];

  for (const ruleModule of RULES) {
    try {
      const ruleFindings = ruleModule.check(sources);
      if (Array.isArray(ruleFindings)) {
        allFindings.push(...ruleFindings);
      }
    } catch (err) {
      allFindings.push({
        rule: ruleModule.ID || 'unknown',
        file: 'tools/verify-docs',
        line: 1,
        message: `Excepción al ejecutar la regla "${ruleModule.ID}": ${err.message}`,
      });
    }
  }

  return {
    success: allFindings.length === 0,
    findings: allFindings,
    stats: {
      docsCount: sources.markdownDocs.length,
      adrCount: sources.adrFiles.length,
      skillsCount: sources.skills.length,
      npmScriptsCount: sources.npmScripts.size,
    },
  };
}

// Ejecución directa por CLI
if (
  process.argv[1] &&
  process.argv[1].replace(/\\/g, '/').endsWith('tools/verify-docs/index.mjs')
) {
  console.log('=============================================================================');
  console.log('Verificación de Integridad Documental (tools/verify-docs)');
  console.log(`Directorio raíz: ${process.cwd()}`);
  console.log('=============================================================================');

  const result = runVerifyDocs(process.cwd());

  console.log(`Documentos escaneados: ${result.stats.docsCount}`);
  console.log(`ADRs validados:        ${result.stats.adrCount}`);
  console.log(`Skills validados:      ${result.stats.skillsCount}`);
  console.log(`Scripts npm auditados: ${result.stats.npmScriptsCount}`);
  console.log('-----------------------------------------------------------------------------');

  if (!result.success) {
    console.error(
      `\n❌ Se encontraron ${result.findings.length} inconsistencias en la documentación:\n`,
    );
    for (const f of result.findings) {
      console.error(`  [${f.rule}] ${f.file}:${f.line} -> ${f.message}`);
    }
    console.log('\n=============================================================================');
    process.exit(1);
  }

  console.log('\n✓ VERIFICACIÓN EXITOSA: La documentación cumple con las 9 reglas de integridad.');
  console.log('=============================================================================');
  process.exit(0);
}
