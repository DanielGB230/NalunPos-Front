// =============================================================================
// tools/verify-docs/verify-docs.spec.mjs — Pruebas unitarias de las 9 reglas
// Runner nativo: node:test y node:assert/strict (sin dependencias externas)
// =============================================================================

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

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
import { runVerifyDocs } from './index.mjs';

/**
 * Crea una estructura de repositorio mínima válida en un directorio temporal aislado.
 */
function createValidFixture() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'verify-docs-test-'));

  // package.json
  fs.writeFileSync(
    path.join(tmpDir, 'package.json'),
    JSON.stringify(
      {
        name: 'test-monorepo',
        scripts: {
          build: 'nx build',
          lint: 'nx lint',
          'verify:csp': 'node tools/verify-csp.mjs',
        },
      },
      null,
      2,
    ),
  );

  // eslint.config.js
  fs.writeFileSync(
    path.join(tmpDir, 'eslint.config.js'),
    `export default {
      tags: ['scope:web', 'scope:admin', 'scope:shared', 'type:app', 'type:ui', 'type:data-access', 'type:util']
    };`,
  );

  // apps y libs con project.json
  fs.mkdirSync(path.join(tmpDir, 'apps', 'NalunPos-Web'), { recursive: true });
  fs.writeFileSync(
    path.join(tmpDir, 'apps', 'NalunPos-Web', 'project.json'),
    JSON.stringify({ name: 'NalunPos-Web', tags: ['scope:web', 'type:app'] }, null, 2),
  );
  fs.writeFileSync(path.join(tmpDir, 'apps', 'NalunPos-Web', 'main.ts'), 'console.log("init");');

  fs.mkdirSync(path.join(tmpDir, 'libs', 'shared', 'auth'), { recursive: true });
  fs.writeFileSync(
    path.join(tmpDir, 'libs', 'shared', 'auth', 'project.json'),
    JSON.stringify({ name: 'shared-auth', tags: ['scope:shared', 'type:data-access'] }, null, 2),
  );
  fs.writeFileSync(
    path.join(tmpDir, 'libs', 'shared', 'auth', 'auth.service.ts'),
    'export class AuthService {}',
  );

  // tools
  fs.mkdirSync(path.join(tmpDir, 'tools'), { recursive: true });
  fs.writeFileSync(path.join(tmpDir, 'tools', 'verify-csp.mjs'), '// dummy verify-csp');

  // ADRs
  fs.mkdirSync(path.join(tmpDir, 'docs', 'architecture', 'adr'), { recursive: true });
  fs.writeFileSync(
    path.join(tmpDir, 'docs', 'architecture', 'adr', '0001-record-architecture-decisions.md'),
    '# 1. Registro de Decisiones\n\n## Contexto\n\n## Decisión\n\n## Consecuencias\n',
  );
  fs.writeFileSync(
    path.join(tmpDir, 'docs', 'architecture', 'adr', 'README.md'),
    '# Registro de ADRs\n\n- [ADR 0001](0001-record-architecture-decisions.md)\n',
  );

  // Skills
  fs.mkdirSync(path.join(tmpDir, '.agents', 'skills', 'frontend-architecture'), {
    recursive: true,
  });
  fs.writeFileSync(
    path.join(tmpDir, '.agents', 'skills', 'frontend-architecture', 'SKILL.md'),
    `---
name: frontend-architecture
description: Directrices de arquitectura frontend para agentes.
---

# Frontend Architecture

Skill que no cita ADRs de backend.
`,
  );

  // Documentos markdown raíz
  fs.writeFileSync(
    path.join(tmpDir, 'README.md'),
    '# Test Project\n\nVer [ADR README](docs/architecture/adr/README.md).\nEjecutar `npm run build` y `npm run verify:csp`.\n',
  );

  fs.writeFileSync(
    path.join(tmpDir, 'AGENTS.md'),
    `# AGENTS.md

## 10. Skills de Agentes

| Skill | Ubicación en el Repositorio | Dominio |
| :--- | :--- | :--- |
| **\`frontend-architecture\`** | [\`.agents/skills/frontend-architecture/SKILL.md\`](./.agents/skills/frontend-architecture/SKILL.md) | Frontend |
`,
  );

  fs.writeFileSync(path.join(tmpDir, 'CONTRIBUTING.md'), '# Contributing\n');
  fs.writeFileSync(path.join(tmpDir, 'SECURITY.md'), '# Security Policy\n');

  return tmpDir;
}

function cleanupFixture(dir) {
  try {
    fs.rmSync(dir, { recursive: true, force: true });
  } catch {}
}

describe('Suite de Verificación Documental (tools/verify-docs)', () => {
  // ── Regla a): broken-links ────────────────────────────────────────────────
  describe('Regla a) broken-links', () => {
    test('Positivo: pasa cuando todos los enlaces relativos y anclas existen', () => {
      const dir = createValidFixture();
      try {
        const sources = loadRepoSources(dir);
        const findings = brokenLinksRule.check(sources);
        assert.equal(findings.length, 0);
      } finally {
        cleanupFixture(dir);
      }
    });

    test('Negativo: detecta enlace relativo roto hacia archivo inexistente', () => {
      const dir = createValidFixture();
      try {
        fs.appendFileSync(
          path.join(dir, 'README.md'),
          '\nVer [Documento Fantasma](docs/inexistente.md).\n',
        );
        const sources = loadRepoSources(dir);
        const findings = brokenLinksRule.check(sources);
        assert.ok(findings.length > 0);
        assert.equal(findings[0].rule, brokenLinksRule.ID);
        assert.match(findings[0].message, /archivo inexistente/i);
      } finally {
        cleanupFixture(dir);
      }
    });
  });

  // ── Regla b): adr-index-sync ──────────────────────────────────────────────
  describe('Regla b) adr-index-sync', () => {
    test('Positivo: pasa cuando los archivos de ADR y el índice coinciden 1:1', () => {
      const dir = createValidFixture();
      try {
        const sources = loadRepoSources(dir);
        const findings = adrIndexSyncRule.check(sources);
        assert.equal(findings.length, 0);
      } finally {
        cleanupFixture(dir);
      }
    });

    test('Negativo: detecta ADR existente en disco omitido en el índice README.md', () => {
      const dir = createValidFixture();
      try {
        fs.writeFileSync(
          path.join(tmpDirSafe(dir), 'docs', 'architecture', 'adr', '0002-state-management.md'),
          '# 2. State Management\n',
        );
        const sources = loadRepoSources(dir);
        const findings = adrIndexSyncRule.check(sources);
        assert.ok(findings.length > 0);
        assert.equal(findings[0].rule, adrIndexSyncRule.ID);
        assert.match(findings[0].message, /no está referenciado/i);
      } finally {
        cleanupFixture(dir);
      }
    });
  });

  // ── Regla c): npm-scripts ─────────────────────────────────────────────────
  describe('Regla c) npm-scripts', () => {
    test('Positivo: pasa cuando los scripts npm citados existen en package.json', () => {
      const dir = createValidFixture();
      try {
        const sources = loadRepoSources(dir);
        const findings = npmScriptsRule.check(sources);
        assert.equal(findings.length, 0);
      } finally {
        cleanupFixture(dir);
      }
    });

    test('Negativo: detecta cita de npm run con script inexistente en package.json', () => {
      const dir = createValidFixture();
      try {
        fs.appendFileSync(
          path.join(dir, 'README.md'),
          '\nEjecutar `npm run script-inexistente` para iniciar.\n',
        );
        const sources = loadRepoSources(dir);
        const findings = npmScriptsRule.check(sources);
        assert.ok(findings.length > 0);
        assert.equal(findings[0].rule, npmScriptsRule.ID);
        assert.match(findings[0].message, /script inexistente/i);
      } finally {
        cleanupFixture(dir);
      }
    });
  });

  // ── Regla d): obsolete-terms ──────────────────────────────────────────────
  describe('Regla d) obsolete-terms', () => {
    test('Positivo: pasa cuando no existen términos ni rangos obsoletos', () => {
      const dir = createValidFixture();
      try {
        const sources = loadRepoSources(dir);
        const findings = obsoleteTermsRule.check(sources);
        assert.equal(findings.length, 0);
      } finally {
        cleanupFixture(dir);
      }
    });

    test('Negativo: detecta interceptor obsoleto "authInterceptor" suelto', () => {
      const dir = createValidFixture();
      try {
        fs.appendFileSync(
          path.join(dir, 'README.md'),
          '\nUsar authInterceptor para autorizar solicitudes.\n',
        );
        const sources = loadRepoSources(dir);
        const findings = obsoleteTermsRule.check(sources);
        assert.ok(findings.length > 0);
        assert.equal(findings[0].rule, obsoleteTermsRule.ID);
        assert.match(findings[0].message, /authInterceptor/i);
      } finally {
        cleanupFixture(dir);
      }
    });
  });

  // ── Regla e): agents-skills-table ─────────────────────────────────────────
  describe('Regla e) agents-skills-table', () => {
    test('Positivo: pasa cuando las carpetas de skills coinciden 1:1 con AGENTS.md', () => {
      const dir = createValidFixture();
      try {
        const sources = loadRepoSources(dir);
        const findings = agentsSkillsTableRule.check(sources);
        assert.equal(findings.length, 0);
      } finally {
        cleanupFixture(dir);
      }
    });

    test('Negativo: detecta skill físico no registrado en la tabla de AGENTS.md', () => {
      const dir = createValidFixture();
      try {
        fs.mkdirSync(path.join(dir, '.agents', 'skills', 'nuevo-skill'), { recursive: true });
        fs.writeFileSync(
          path.join(dir, '.agents', 'skills', 'nuevo-skill', 'SKILL.md'),
          '---\nname: nuevo-skill\ndescription: test\n---\n# Skill\n',
        );
        const sources = loadRepoSources(dir);
        const findings = agentsSkillsTableRule.check(sources);
        assert.ok(findings.length > 0);
        assert.equal(findings[0].rule, agentsSkillsTableRule.ID);
        assert.match(findings[0].message, /no está registrado en la tabla/i);
      } finally {
        cleanupFixture(dir);
      }
    });
  });

  // ── Regla f): skill-frontmatter ───────────────────────────────────────────
  describe('Regla f) skill-frontmatter', () => {
    test('Positivo: pasa cuando el frontmatter es válido y coincide con la carpeta', () => {
      const dir = createValidFixture();
      try {
        const sources = loadRepoSources(dir);
        const findings = skillFrontmatterRule.check(sources);
        assert.equal(findings.length, 0);
      } finally {
        cleanupFixture(dir);
      }
    });

    test('Negativo: detecta discrepancia entre name del frontmatter y nombre de carpeta', () => {
      const dir = createValidFixture();
      try {
        fs.writeFileSync(
          path.join(dir, '.agents', 'skills', 'frontend-architecture', 'SKILL.md'),
          '---\nname: nombre-invalido\ndescription: Desc\n---\n# Title\n',
        );
        const sources = loadRepoSources(dir);
        const findings = skillFrontmatterRule.check(sources);
        assert.ok(findings.length > 0);
        assert.equal(findings[0].rule, skillFrontmatterRule.ID);
        assert.match(findings[0].message, /no coincide con el directorio/i);
      } finally {
        cleanupFixture(dir);
      }
    });
  });

  // ── Regla g): skill-adr-disclaimer ────────────────────────────────────────
  describe('Regla g) skill-adr-disclaimer', () => {
    test('Positivo: pasa cuando el skill con menciones de ADR incluye el disclaimer', () => {
      const dir = createValidFixture();
      try {
        fs.writeFileSync(
          path.join(dir, '.agents', 'skills', 'frontend-architecture', 'SKILL.md'),
          `---
name: frontend-architecture
description: Test skill
---

> **Nota:** Los números de ADR que cita este skill (ADR 0008) corresponden al repositorio NalunPos-Api, NO a docs/architecture/adr de este repo.

Cita ADR 0008 para multi-tenancy.
`,
        );
        const sources = loadRepoSources(dir);
        const findings = skillAdrDisclaimerRule.check(sources);
        assert.equal(findings.length, 0);
      } finally {
        cleanupFixture(dir);
      }
    });

    test('Negativo: detecta skill que cita ADRs de backend sin el disclaimer requerido', () => {
      const dir = createValidFixture();
      try {
        fs.writeFileSync(
          path.join(dir, '.agents', 'skills', 'frontend-architecture', 'SKILL.md'),
          `---
name: frontend-architecture
description: Test skill
---

Cita sin disclaimer el ADR 0008 de base de datos.
`,
        );
        const sources = loadRepoSources(dir);
        const findings = skillAdrDisclaimerRule.check(sources);
        assert.ok(findings.length > 0);
        assert.equal(findings[0].rule, skillAdrDisclaimerRule.ID);
        assert.match(findings[0].message, /carece del descargo obligatorio/i);
      } finally {
        cleanupFixture(dir);
      }
    });
  });

  // ── Regla h): referenced-repo-paths ───────────────────────────────────────
  describe('Regla h) referenced-repo-paths', () => {
    test('Positivo: pasa cuando todas las rutas concretas referenciadas existen', () => {
      const dir = createValidFixture();
      try {
        fs.appendFileSync(
          path.join(dir, 'README.md'),
          '\nVer archivo fuente `apps/NalunPos-Web/main.ts`.\n',
        );
        const sources = loadRepoSources(dir);
        const findings = referencedRepoPathsRule.check(sources);
        assert.equal(findings.length, 0);
      } finally {
        cleanupFixture(dir);
      }
    });

    test('Negativo: detecta ruta de archivo concreto bajo apps/ que no existe en disco', () => {
      const dir = createValidFixture();
      try {
        fs.appendFileSync(
          path.join(dir, 'README.md'),
          '\nVer archivo `apps/NalunPos-Web/src/inexistente.ts`.\n',
        );
        const sources = loadRepoSources(dir);
        const findings = referencedRepoPathsRule.check(sources);
        assert.ok(findings.length > 0);
        assert.equal(findings[0].rule, referencedRepoPathsRule.ID);
        assert.match(findings[0].message, /no existe en el repositorio/i);
      } finally {
        cleanupFixture(dir);
      }
    });
  });

  // ── Regla i): nx-tags-consistency ─────────────────────────────────────────
  describe('Regla i) nx-tags-consistency', () => {
    test('Positivo: pasa cuando las etiquetas Nx son válidas y coherentes con project.json', () => {
      const dir = createValidFixture();
      try {
        fs.appendFileSync(
          path.join(dir, 'README.md'),
          '\n| Proyecto | Scope | Type |\n| `NalunPos-Web` | `scope:web` | `type:app` |\n',
        );
        const sources = loadRepoSources(dir);
        const findings = nxTagsConsistencyRule.check(sources);
        assert.equal(findings.length, 0);
      } finally {
        cleanupFixture(dir);
      }
    });

    test('Negativo: detecta etiqueta scope inventada no declarada en project.json ni eslint', () => {
      const dir = createValidFixture();
      try {
        fs.appendFileSync(
          path.join(dir, 'README.md'),
          '\nAplicación con etiqueta `scope:inventado` no permitida.\n',
        );
        const sources = loadRepoSources(dir);
        const findings = nxTagsConsistencyRule.check(sources);
        assert.ok(findings.length > 0);
        assert.equal(findings[0].rule, nxTagsConsistencyRule.ID);
        assert.match(findings[0].message, /no existe en ningún project\.json/i);
      } finally {
        cleanupFixture(dir);
      }
    });

    test('Negativo: detecta tag real asignado al proyecto equivocado', () => {
      const dir = createValidFixture();
      try {
        fs.appendFileSync(
          path.join(dir, 'README.md'),
          '\n| Proyecto | Scope | Type |\n| `libs/shared/auth` | `scope:shared` | `type:ui` |\n',
        );
        const sources = loadRepoSources(dir);
        const findings = nxTagsConsistencyRule.check(sources);
        assert.ok(findings.length > 0);
        assert.equal(findings[0].rule, nxTagsConsistencyRule.ID);
        assert.match(
          findings[0].message,
          /Etiqueta errónea para shared-auth.*cita "type:ui".*declara "type:data-access"/i,
        );
      } finally {
        cleanupFixture(dir);
      }
    });
  });

  // ── Verificación Integrada (Runner runVerifyDocs) ──────────────────────────
  describe('Ejecutor Integrado (runVerifyDocs)', () => {
    test('Ejecuta las 9 reglas completas y retorna éxito sobre fixture limpio', () => {
      const dir = createValidFixture();
      try {
        const result = runVerifyDocs(dir);
        assert.equal(result.success, true);
        assert.equal(result.findings.length, 0);
        assert.equal(result.stats.adrCount, 1);
        assert.equal(result.stats.skillsCount, 1);
      } finally {
        cleanupFixture(dir);
      }
    });
  });
});

function tmpDirSafe(d) {
  return d;
}
