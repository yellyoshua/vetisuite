import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'nitro'

const rootDir = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  serverDir: './',
  ignore: ['modules/**'],
  errorHandler: './core/nitro-error-handler.ts',
  alias: {
    '@': rootDir,
  },
})
