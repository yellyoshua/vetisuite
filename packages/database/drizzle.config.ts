import { existsSync } from 'node:fs'
import { defineConfig } from 'drizzle-kit'

if (existsSync('.env.local')) {
  process.loadEnvFile('.env.local')
}

export default defineConfig({
  dialect: 'postgresql',
  schema: ['./src/schemas/schemas.ts', './src/schemas/migrations.table.ts'],
  out: './src/migrations',
  dbCredentials: { url: process.env.DATABASE_URL as string },
  casing: 'snake_case',
})
