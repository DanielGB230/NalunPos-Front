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
        'libs/shared/auth/src/guards/**/*.ts',
        'libs/shared/auth/src/services/**/*.ts',
        'libs/shared/auth/src/interceptors/auth.interceptor.ts',
        'libs/shared/data-access/src/interceptors/**/*.ts',
        'apps/NalunPos-Web/src/app/features/warehouses/data-access/**/*.ts',
      ],
      exclude: [
        '**/*.spec.ts',
        '**/*.routes.ts',
        '**/index.ts',
        '**/*.interface.ts',
        '**/*.model.ts',
        '**/*.config.ts',
      ],
    },
  },
});
