// =============================================================================
// eslint.config.js — NalunPos-Front (ESLint Flat Config - F0-1 Module Boundaries)
// =============================================================================

// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import nxPlugin from '@nx/eslint-plugin';

export default tseslint.config(
  // ── Ignores globales ────────────────────────────────────────────────────────
  {
    ignores: [
      'dist/**',
      '.angular/**',
      '.nx/**',
      'node_modules/**',
      'coverage/**',
      '**/*.js',
    ],
  },

  // ── Base recomendada ESLint ──────────────────────────────────────────────
  {
    ...eslint.configs.recommended,
    files: ['**/*.ts'],
  },

  // ── TypeScript config para archivos TS ────────────────────────────────────
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      '@nx': nxPlugin,
    },
    rules: {
      // ── Nx Module Boundaries (F0-1) ──────────────────────────────────────
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: false,
          allow: [],
          depConstraints: [
            {
              sourceTag: 'scope:web',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:web'],
            },
            {
              sourceTag: 'scope:admin',
              onlyDependOnLibsWithTags: ['scope:shared', 'scope:admin'],
            },
            {
              sourceTag: 'scope:landing',
              onlyDependOnLibsWithTags: ['scope:shared'],
              notDependOnLibsWithTags: ['scope:web', 'scope:admin', 'type:data-access', 'type:feature'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: ['type:feature', 'type:ui', 'type:data-access', 'type:util'],
            },
            {
              sourceTag: 'type:feature',
              onlyDependOnLibsWithTags: ['type:ui', 'type:data-access', 'type:util'],
            },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: ['type:ui', 'type:util'],
            },
            {
              sourceTag: 'type:data-access',
              onlyDependOnLibsWithTags: ['type:data-access', 'type:util'],
            },
            {
              sourceTag: 'type:util',
              onlyDependOnLibsWithTags: ['type:util'],
            },
          ],
        },
      ],
      'no-unused-vars': 'off', // delegado a ts en F0-2
      'no-undef': 'off', // TypeScript valida variables globales
    },
  },
);
