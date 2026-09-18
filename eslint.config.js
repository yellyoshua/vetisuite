import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const unusedArgsIgnorePattern = {
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
}

export default defineConfig([
  globalIgnores([
    '**/dist',
    '**/.output',
    '**/.nitro',
    '**/.astro',
    '**/.amplify-hosting',
    'old_client',
    'packages/database/src/migrations',
    'ds-bundle',
    '.design-sync',
    '.ds-sync',
  ]),
  {
    files: ['client/**/*.{ts,tsx}', 'landing/**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: unusedArgsIgnorePattern,
  },
  {
    files: ['server/**/*.ts', 'cloudtasks/**/*.{ts,tsx}', 'packages/**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
    rules: unusedArgsIgnorePattern,
  },
  {
    files: ['*.js', '*.ts'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },
])
