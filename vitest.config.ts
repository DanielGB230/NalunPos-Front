import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: {
    alias: {
      '@nalunpos/shared/auth': path.resolve(import.meta.dirname, './libs/shared/auth/src/index.ts'),
      '@nalunpos/shared/data-access': path.resolve(
        import.meta.dirname,
        './libs/shared/data-access/src/index.ts',
      ),
      '@nalunpos/shared/ui': path.resolve(import.meta.dirname, './libs/shared/ui/src/index.ts'),
      '@nalunpos/shared/design-tokens': path.resolve(
        import.meta.dirname,
        './libs/shared/design-tokens/src/index.ts',
      ),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test-setup.ts'],
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/e2e/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
      include: [
        'libs/shared/**/*.ts',
        'apps/NalunPos-Web/src/app/features/warehouses/data-access/**/*.ts',
        'apps/NalunPos-Web/src/app/features/warehouses/pages/**/*.ts',
        'apps/NalunPos-Admin-Web/src/app/features/tenants/data-access/**/*.ts',
        'apps/NalunPos-Admin-Web/src/app/features/tenants/pages/**/*.ts',
      ],
      exclude: [
        '**/*.spec.ts',
        '**/*.routes.ts',
        '**/index.ts',
        '**/*.interface.ts',
        '**/*.interfaces.ts',
        '**/*.model.ts',
        '**/*.token.ts',
        '**/*.config.ts',
        '**/config/**',
        'libs/shared/ui/**',
        'libs/shared/design-tokens/**',
        'libs/shared/data-access/src/services/**',
      ],
    },
  },
});
