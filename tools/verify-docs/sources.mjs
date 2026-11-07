// =============================================================================
// tools/verify-docs/sources.mjs — Lector de fuentes de verdad en tiempo real
// =============================================================================

import fs from 'node:fs';
import path from 'node:path';
import { VERIFY_DOCS_CONFIG } from './config.mjs';

/**
 * Normaliza una ruta a forward-slashes relativa a rootDir.
 */
export function normalizePath(p) {
  return p.replace(/\\/g, '/');
}

/**
 * Convierte un encabezado Markdown en slug de ancla (estilo GitHub).
 */
export function slugifyHeader(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina diacríticos/tildes
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Elimina signos de puntuación
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Carga todas las fuentes de verdad del monorepo desde el sistema de archivos.
 * Prohibido hardcodear listas de proyectos, skills, ADRs o tags.
 */
export function loadRepoSources(rootDir = process.cwd()) {
  const normRoot = path.resolve(rootDir);

  // 1. package.json y scripts npm reales
  const pkgPath = path.join(normRoot, 'package.json');
  let packageJson = {};
  if (fs.existsSync(pkgPath)) {
    try {
      packageJson = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    } catch (err) {
      throw new Error(`Error al parsear package.json: ${err.message}`);
    }
  }
  const npmScripts = new Set(Object.keys(packageJson.scripts || {}));

  // 2. Indexación de todos los archivos del repositorio
  const repoFiles = new Set();
  function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (VERIFY_DOCS_CONFIG.repoIgnoreDirs.includes(entry.name)) continue;
        walkDir(path.join(dir, entry.name));
      } else if (entry.isFile()) {
        const rel = normalizePath(path.relative(normRoot, path.join(dir, entry.name)));
        repoFiles.add(rel);
      }
    }
  }
  walkDir(normRoot);

  // 3. Archivos reales de ADR en docs/architecture/adr/
  const adrDir = path.join(normRoot, 'docs', 'architecture', 'adr');
  const adrFiles = [];
  if (fs.existsSync(adrDir)) {
    const entries = fs.readdirSync(adrDir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isFile() && e.name.startsWith('00') && e.name.endsWith('.md')) {
        adrFiles.push({
          fileName: e.name,
          fullPath: path.join(adrDir, e.name),
          relPath: normalizePath(path.join('docs', 'architecture', 'adr', e.name)),
        });
      }
    }
  }
  adrFiles.sort((a, b) => a.fileName.localeCompare(b.fileName));

  // 4. Carpetas y archivos de skills en .agents/skills/
  const skillsDir = path.join(normRoot, '.agents', 'skills');
  const skills = [];
  if (fs.existsSync(skillsDir)) {
    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
    for (const e of entries) {
      if (e.isDirectory()) {
        const skillMd = path.join(skillsDir, e.name, 'SKILL.md');
        if (fs.existsSync(skillMd)) {
          skills.push({
            name: e.name,
            folderPath: path.join(skillsDir, e.name),
            skillMdPath: skillMd,
            skillMdRelPath: normalizePath(path.join('.agents', 'skills', e.name, 'SKILL.md')),
          });
        }
      }
    }
  }
  skills.sort((a, b) => a.name.localeCompare(b.name));

  // 5. Todos los project.json en apps/ y libs/ (Etiquetas reales)
  const projectTags = new Map();
  const validNxTags = new Set();

  function scanProjects(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) {
        const pjPath = path.join(full, 'project.json');
        if (fs.existsSync(pjPath)) {
          try {
            const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
            const tags = Array.isArray(pj.tags) ? pj.tags : [];
            const projName = pj.name || e.name;
            const scope = tags.find((t) => t.startsWith('scope:'));
            const type = tags.find((t) => t.startsWith('type:'));

            for (const t of tags) validNxTags.add(t);

            const info = {
              name: projName,
              folderName: e.name,
              tags,
              scope,
              type,
              relPath: normalizePath(path.relative(normRoot, full)),
            };
            projectTags.set(projName, info);
            projectTags.set(e.name, info);
            projectTags.set(info.relPath, info);
          } catch {}
        }
        scanProjects(full);
      }
    }
  }
  scanProjects(path.join(normRoot, 'apps'));
  scanProjects(path.join(normRoot, 'libs'));

  // Tags válidos desde eslint.config.js
  const eslintPath = path.join(normRoot, 'eslint.config.js');
  if (fs.existsSync(eslintPath)) {
    const eslintContent = fs.readFileSync(eslintPath, 'utf8');
    const tagMatches = eslintContent.match(/(?:scope|type):[a-z0-9-]+/g) || [];
    for (const tm of tagMatches) {
      validNxTags.add(tm);
    }
  }

  // 6. Recopilación de todos los documentos Markdown objetivo
  const markdownDocs = [];
  const scannedMdPaths = new Set();

  function addMdDoc(relPath) {
    const full = path.join(normRoot, relPath);
    if (!fs.existsSync(full) || scannedMdPaths.has(relPath)) return;
    scannedMdPaths.add(relPath);

    const content = fs.readFileSync(full, 'utf8');
    const lines = content.split(/\r?\n/);
    const headers = [];

    lines.forEach((lineText, idx) => {
      const m = lineText.match(/^#{1,6}\s+(.+)$/);
      if (m) {
        const rawTitle = m[1].trim();
        headers.push({
          text: rawTitle,
          slug: slugifyHeader(rawTitle),
          line: idx + 1,
        });
      }
    });

    markdownDocs.push({
      relPath: normalizePath(relPath),
      fullPath: full,
      dirRel: normalizePath(path.dirname(relPath)),
      content,
      lines,
      headers,
    });
  }

  // Documentos raíz
  for (const rd of VERIFY_DOCS_CONFIG.rootDocs) {
    addMdDoc(rd);
  }

  // Directorios de documentación
  function scanDirForMd(dirRel) {
    const fullDir = path.join(normRoot, dirRel);
    if (!fs.existsSync(fullDir)) return;
    const entries = fs.readdirSync(fullDir, { withFileTypes: true });
    for (const e of entries) {
      const subRel = path.join(dirRel, e.name);
      if (e.isDirectory()) {
        scanDirForMd(subRel);
      } else if (e.isFile() && e.name.endsWith('.md')) {
        addMdDoc(subRel);
      }
    }
  }

  for (const d of VERIFY_DOCS_CONFIG.docDirectories) {
    scanDirForMd(d);
  }

  markdownDocs.sort((a, b) => a.relPath.localeCompare(b.relPath));

  return {
    rootDir: normRoot,
    packageJson,
    npmScripts,
    repoFiles,
    adrFiles,
    skills,
    projectTags,
    validNxTags,
    markdownDocs,
  };
}
