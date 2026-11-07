// =============================================================================
// tools/verify-docs/rules/npm-scripts.rule.mjs — Regla c): Scripts npm reales
// =============================================================================

export const ID = 'npm-scripts';

/**
 * Valida que todo script documentado como `npm run <script>` exista en la sección
 * "scripts" de package.json.
 */
export function check(sources) {
  const findings = [];
  const scriptRegex = /\bnpm\s+run\s+([a-zA-Z0-9_:-]+)/g;

  for (const doc of sources.markdownDocs) {
    doc.lines.forEach((lineText, idx) => {
      let match;
      while ((match = scriptRegex.exec(lineText)) !== null) {
        const scriptName = match[1];

        // Ignorar placeholders sintácticos como <script>
        if (scriptName.startsWith('<') || scriptName === 'script') continue;

        if (!sources.npmScripts.has(scriptName)) {
          findings.push({
            rule: ID,
            file: doc.relPath,
            line: idx + 1,
            message: `El comando "npm run ${scriptName}" referencia un script inexistente en package.json.`,
          });
        }
      }
    });
  }

  return findings;
}
