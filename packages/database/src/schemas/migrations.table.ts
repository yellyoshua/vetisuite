import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const migrationsTable = pgTable('migrations', {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  delta: integer().notNull().unique(),
  description: text().notNull(),
  createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
})
