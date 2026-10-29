// =============================================================================
// eslint.config.js — NalunPos-Front (ESLint Flat Config)
// Angular 22 + TypeScript strict + angular-eslint + typescript-eslint + Nx
// =============================================================================

// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import angular from '@angular-eslint/eslint-plugin';
import angularTemplate from '@angular-eslint/eslint-plugin-template';
import angularTemplateParser from '@angular-eslint/template-parser';
import nxPlugin from '@nx/eslint-plugin';

export default tseslint.config(
  // ── Ignores globales ────────────────────────────────────────────────────────
  {
    ignores: ['dist/**', '.angular/**', '.nx/**', 'node_modules/**', 'coverage/**', '**/*.js'],
  },

  // ── Base recomendada ESLint (solo .ts) ───────────────────────────────────
  {
    ...eslint.configs.recommended,
    files: ['**/*.ts'],
  },

  // ── TypeScript + Angular config para archivos TS ──────────────────────────
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
      '@typescript-eslint': tseslint.plugin,
      '@angular-eslint': angular,
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
              notDependOnLibsWithTags: [
                'scope:web',
                'scope:admin',
                'type:data-access',
                'type:feature',
              ],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:shared'],
            },
            {
              sourceTag: 'type:app',
              onlyDependOnLibsWithTags: [
                'type:feature',
                'type:ui',
                'type:data-access',
                'type:util',
              ],
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

      // ── Angular 22 best practices (F0-2 obligatorias) ────────────────────
      '@angular-eslint/prefer-on-push-component-change-detection': 'error',
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/prefer-inject': 'error',
      '@angular-eslint/use-component-selector': 'error',
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      '@angular-eslint/no-input-rename': 'error',
      '@angular-eslint/no-output-rename': 'error',
      '@angular-eslint/component-selector': [
        'error',
        { type: 'element', prefix: ['app', 'lib', 'ui'], style: 'kebab-case' },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        { type: 'attribute', prefix: ['app', 'lib', 'ui'], style: 'camelCase' },
      ],

      // ── TypeScript estricto (F0-2 obligatorio) ───────────────────────────
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
      'no-unused-vars': 'off',
      'no-undef': 'off',

      // ── Prohibición de localStorage/sessionStorage fuera de shared-auth ──
      'no-restricted-globals': [
        'error',
        {
          name: 'localStorage',
          message: 'Prohibido usar localStorage directamente. Usar AuthService (libs/shared/auth).',
        },
        {
          name: 'sessionStorage',
          message:
            'Prohibido usar sessionStorage directamente. Usar AuthService (libs/shared/auth).',
        },
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'window',
          property: 'localStorage',
          message:
            'Prohibido usar window.localStorage directamente. Usar AuthService (libs/shared/auth).',
        },
        {
          object: 'window',
          property: 'sessionStorage',
          message:
            'Prohibido usar window.sessionStorage directamente. Usar AuthService (libs/shared/auth).',
        },
      ],
    },
  },

  // ── Excepción: shared-auth SÍ puede usar almacenamiento ──────────────────
  {
    files: ['libs/shared/auth/**/*.ts'],
    rules: {
      'no-restricted-globals': 'off',
      'no-restricted-properties': 'off',
    },
  },

  // ── Plantillas HTML (F0-2 obligatorias: accesibilidad + control flow) ────
  {
    files: ['**/*.html'],
    languageOptions: {
      parser: angularTemplateParser,
    },
    plugins: {
      '@angular-eslint/template': angularTemplate,
    },
    rules: {
      '@angular-eslint/template/alt-text': 'error',
      '@angular-eslint/template/elements-content': 'error',
      '@angular-eslint/template/label-has-associated-control': 'error',
      '@angular-eslint/template/role-has-required-aria': 'error',
      '@angular-eslint/template/valid-aria': 'error',
      '@angular-eslint/template/prefer-control-flow': 'error',
    },
  },

  // ── Spec files ──────────────────────────────────────────────────────────
  {
    files: ['**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
