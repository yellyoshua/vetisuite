import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: { '@': fileURLToPath(new URL('..', import.meta.url)) },
  },
  test: {
    environment: 'node',
    setupFiles: ['./__tests__/setup.ts'],
    hookTimeout: 30000,
  },
})
