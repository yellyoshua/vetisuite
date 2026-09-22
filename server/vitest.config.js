import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('.', import.meta.url))
    }
  },
  test: {
    globals: true,
    environment: 'node',
    fileParallelism: false,
    setupFiles: ['./tests/setup.js'],
    hookTimeout: 30000,
    include: ['{api,core,middleware,modules,permissions,utils}/**/__tests__/**/*.test.js'],
    coverage: {
      provider: 'v8',
      include: ['api/**', 'core/**', 'modules/**', 'permissions/**', 'utils/**'],
      exclude: ['**/__tests__/**', '**/*.d.ts', '**/node_modules/**']
    }
  }
});
