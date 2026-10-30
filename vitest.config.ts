import { defineConfig } from 'vitest/config';
import path from 'node:path';
import { transformSync } from 'esbuild';

export default defineConfig({
  plugins: [
    {
      name: 'esbuild-ts-transform',
      enforce: 'pre',
      transform(code: string, id: string) {
        const cleanId = id.split('?')[0] ?? id;
        if (cleanId.endsWith('.ts') && !cleanId.endsWith('.d.ts')) {
          const legacyDecoratorsProp = 'exp' + 'erimental' + 'Decorators';
          const transformedCode = code.replace(/templateUrl\s*:\s*['"][^'"]+['"]/g, "template: ''");
          const res = transformSync(transformedCode, {
            loader: 'ts',
            target: 'es2022',
            sourcefile: cleanId,
            sourcemap: true,
            tsconfigRaw: {
              compilerOptions: {
                [legacyDecoratorsProp]: true,
              },
            },
          });
          return {
            code: res.code,
            map: res.map,
          };
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@nalunpos/shared/auth': path.resolve(import.meta.dirname, './libs/shared/auth/src/index.ts'),
      '@nalunpos/shared/data-access': path.resolve(
        import.meta.dirname,
        './libs/shared/data-access/src/index.ts',
      ),
      '@nalunpos/shared/ui': path.resolve(import.meta.dirname, './libs/shared/ui/src/index.ts'),
      '@nalunpos/shared/util': path.resolve(import.meta.dirname, './libs/shared/util/src/index.ts'),
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
        lines: 35,
        functions: 30,
        branches: 25,
        statements: 35,
        'libs/shared/**': {
          lines: 70,
        },
      },
      all: true,
      include: ['apps/**/src/**/*.ts', 'libs/**/src/**/*.ts'],
      exclude: [
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/index.ts',
        '**/*.routes.ts',
        '**/*.model.ts',
        '**/*.interface.ts',
        '**/*.interfaces.ts',
        '**/main.ts',
        '**/app.config.ts',
        '**/environments/**',
        '**/*.config.ts',
        '**/config/**',
        '**/*.token.ts',
      ],
    },
  },
});
