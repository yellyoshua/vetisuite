import {fileURLToPath} from 'node:url';
import {defineNitroConfig} from 'nitropack/config';

export default defineNitroConfig({
  compatibilityDate: '2026-07-16',
  alias: {
    '@': fileURLToPath(new URL('.', import.meta.url))
  },
  errorHandler: fileURLToPath(new URL('./core/nitro-error-handler.js', import.meta.url)),
  srcDir: '.',
  ignore: ['modules/**', 'tests/**', '**/__tests__/**'],
  moduleSideEffects: [
    fileURLToPath(new URL('./permissions/', import.meta.url))
  ],
  preset: process.env.NITRO_PRESET || 'aws-lambda'
});
