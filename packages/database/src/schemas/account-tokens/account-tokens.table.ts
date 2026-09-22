import { jsonb, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { accountTokenType } from '../enums'
import { usersTable } from '../users/users.table'

export const accountTokensTable = pgTable(
  'account_tokens',
  {
    id: uuid().primaryKey().defaultRandom(),
    user: uuid()
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    type: accountTokenType().notNull(),
    token: text().notNull(),
    data: jsonb(),
    expiresAt: timestamp({ mode: 'date', withTimezone: true }).notNull(),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex().on(t.user, t.type)],
)
