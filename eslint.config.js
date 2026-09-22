import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

const unusedArgsIgnorePattern = {
  '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
}

const jsHygieneRules = {
  'no-var': 'error',
  'prefer-const': 'error',
  'max-depth': ['error', 2],
  'max-lines': ['error', 400],
  'max-lines-per-function': ['error', 300],
  'max-statements': ['error', 25],
  'max-params': ['error', 4],
  'no-else-return': 'error',
  'no-return-await': 'error',
  yoda: 'error',
  'no-param-reassign': 'error',
  'no-nested-ternary': 'error',
  'no-warning-comments': 'error',
  'id-length': ['error', { min: 2, exceptions: ['_', 't', 'd', 'q'] }],
  'prefer-template': 'error',
  'newline-before-return': 'error',
  quotes: ['error', 'single', { avoidEscape: true }],
  camelcase: ['error', { allow: ['grant_type', 'redirect_uri', 'expires_in', 'authorize_url'] }],
  'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
}

const serverForbiddenImports = ['error', {
  patterns: [
    { group: ['**/client/src/**', '**/landing/src/**'], message: 'server/ no importa código fuente de otros paquetes.' },
  ],
}]

const clientForbiddenImports = ['error', {
  patterns: [
    { group: ['@vetisuite/*'], message: 'client/ no comparte código: copia lo que necesites a client/src/.' },
    { group: ['next', 'next/*'], message: 'client/ es Vite + react-router, no Next.' },
    { group: ['node:*', 'server-only'], message: 'client/ corre en el navegador: no hay APIs de Node.' },
    { group: ['**/server/**', '**/packages/**', '**/landing/**'], message: 'client/ no importa de otros paquetes del monorepo.' },
  ],
}]

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
    'server/coverage',
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
    files: ['client/src/**/*.{ts,tsx}'],
    rules: { 'no-restricted-imports': clientForbiddenImports, 'no-console': 'error' },
  },
  {
    files: ['client/src/components/ui/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
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
    files: ['server/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node,
    },
    rules: { ...jsHygieneRules, 'no-restricted-imports': serverForbiddenImports, 'no-console': 'error' },
  },
  {
    files: ['server/**/__tests__/**/*.js'],
    languageOptions: {
      globals: globals.vitest,
    },
    rules: { 'max-lines': 'off', 'max-lines-per-function': 'off' },
  },
  {
    files: ['*.js', '*.ts'],
    extends: [js.configs.recommended],
    languageOptions: {
      globals: globals.node,
    },
  },
])
