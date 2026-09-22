import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { usersTable } from '../users/users.table'

export const oauthCodesTable = pgTable(
  'oauth_codes',
  {
    id: uuid().primaryKey().defaultRandom(),
    code: text().notNull().unique(),
    user: uuid()
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    ip: text().notNull(),
    userAgent: text().notNull(),
    redirectUri: text().notNull(),
    expiresAt: timestamp({ mode: 'date', withTimezone: true }).notNull(),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.user)],
)
