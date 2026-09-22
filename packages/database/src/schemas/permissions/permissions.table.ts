import { sql } from 'drizzle-orm'
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { usersTable } from '../users/users.table'

export const permissionsTable = pgTable('permissions', {
  id: uuid().primaryKey().defaultRandom(),
  user: uuid()
    .notNull()
    .unique()
    .references(() => usersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  name: text().notNull(),
  permissions: text().array().notNull().default(sql`'{}'::text[]`),
  createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ mode: 'date', withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
})
