import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { usersTable } from '../users/users.table'

export const sessionsTable = pgTable(
  'sessions',
  {
    id: uuid().primaryKey().defaultRandom(),
    user: uuid()
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    ip: text().notNull(),
    userAgent: text().notNull(),
    expiresAt: timestamp({ mode: 'date', withTimezone: true }).notNull(),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.user)],
)
