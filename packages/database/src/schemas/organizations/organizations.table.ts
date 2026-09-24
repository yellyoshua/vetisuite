import { sql } from 'drizzle-orm'
import { check, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

export const organizationsTable = pgTable(
  'organizations',
  {
    id: uuid().primaryKey().defaultRandom(),
    name: text().notNull(),
    slug: text().notNull().unique(),
    timezone: text().notNull().default('UTC'),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    archivedAt: timestamp({ mode: 'date', withTimezone: true }),
  },
  (t) => [check('organizations_slug_check', sql`${t.slug} ~ '^[a-z0-9-]+$'`)],
)
