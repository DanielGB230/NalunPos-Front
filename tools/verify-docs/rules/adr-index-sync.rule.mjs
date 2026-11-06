// =============================================================================
// tools/verify-docs/rules/adr-index-sync.rule.mjs — Regla b): Sincronización índice ADR
// =============================================================================

export const ID = 'adr-index-sync';

/**
 * Valida la sincronización bidireccional entre los archivos físicos en docs/architecture/adr/
 * y las entradas listadas en docs/architecture/adr/README.md.
 */
export function check(sources) {
  const findings = [];
  const adrReadme = sources.markdownDocs.find(
    (d) => d.relPath === 'docs/architecture/adr/README.md',
  );

  if (!adrReadme) {
    findings.push({
      rule: ID,
      file: 'docs/architecture/adr/README.md',
      line: 1,
      message: 'No se encontró el índice de ADRs en docs/architecture/adr/README.md.',
    });
    return findings;
  }

  const readmeContent = adrReadme.content;

  // 1. Cada archivo ADR en disco debe figurar en el README de ADRs
  for (const adr of sources.adrFiles) {
    if (!readmeContent.includes(adr.fileName)) {
      findings.push({
        rule: ID,
        file: 'docs/architecture/adr/README.md',
        line: 1,
        message: `El archivo físico de ADR "${adr.fileName}" no está referenciado en docs/architecture/adr/README.md.`,
      });
    }
  }

  // 2. Cada archivo ADR referenciado en el README debe existir físicamente
  const adrMentionRegex =
    /(?:\[[^\]]*\]\((?:\.\/)?(00\d{2}[^)#\s]*\.md)\)|(?:^|\s)(00\d{2}[^\s,)]*\.md))/gm;
  let match;
  const existingFiles = new Set(sources.adrFiles.map((a) => a.fileName));

  adrReadme.lines.forEach((lineText, idx) => {
    while ((match = adrMentionRegex.exec(lineText)) !== null) {
      const referencedFile = match[1] || match[2];
      if (referencedFile && !existingFiles.has(referencedFile)) {
        findings.push({
          rule: ID,
          file: 'docs/architecture/adr/README.md',
          line: idx + 1,
          message: `El índice de ADR referencia el archivo "${referencedFile}", pero no existe en docs/architecture/adr/.`,
        });
      }
    }
  });

  return findings;
}
