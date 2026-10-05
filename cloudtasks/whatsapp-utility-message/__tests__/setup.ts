import { vi } from 'vitest'

process.env.DATABASE_URL = 'postgresql://test@localhost:5432/test'
process.env.WHATSAPP_APP_ID = 'app-id'
process.env.WHATSAPP_APP_SECRET = 'app-secret'
process.env.WHATSAPP_TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString('base64')

vi.mock('@vetisuite/database/db.js', async () => {
  const [{ drizzle, PGlite }, { generateDrizzleJson, generateMigration }, schemas, { sql }] = await Promise.all([
    import('@vetisuite/database/pglite.js'),
    import('@vetisuite/database/kit-api.js'),
    import('@vetisuite/database/schemas'),
    import('@vetisuite/database/orm.js'),
  ])
  const db = drizzle({ client: new PGlite(), schema: schemas, casing: 'snake_case' })
  const statements = await generateMigration(
    generateDrizzleJson({}, undefined, undefined, 'snake_case'),
    generateDrizzleJson({ ...schemas }, undefined, undefined, 'snake_case'),
  )

  for (const statement of statements) {
    await db.execute(sql.raw(statement))
  }

  return { db }
})
