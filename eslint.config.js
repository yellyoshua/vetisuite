import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  // `ds-bundle/` es salida generada del converter de design-sync y `.design-sync/`
  // + `client/ds-sync/` son sus entradas (barrel y previews), no código de la app.
  globalIgnores(['**/dist', '**/.output', '**/.nitro', '**/.astro', 'ds-bundle', '.design-sync', 'client/ds-sync']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
  },
])
