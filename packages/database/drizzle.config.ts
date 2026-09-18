import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/schemas/schemas.ts',
  out: './src/migrations',
  dbCredentials: { url: process.env.DATABASE_URL as string },
  casing: 'snake_case',
})
