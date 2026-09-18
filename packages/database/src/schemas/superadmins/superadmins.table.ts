import { relations } from 'drizzle-orm'
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organizationsTable } from '../organizations/organizations.table'
import { usersTable } from '../users/users.table'

export const superadminsTable = pgTable(
  'superadmins',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    user: uuid()
      .notNull()
      .unique()
      .references(() => usersTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    firstName: text().notNull(),
    lastName: text().notNull(),
    avatar: text(),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    archivedAt: timestamp({ mode: 'date', withTimezone: true }),
  },
  (t) => [index().on(t.organization)],
)

export const superadminsRelations = relations(superadminsTable, ({ one }) => ({
  user: one(usersTable, { fields: [superadminsTable.user], references: [usersTable.id] }),
}))
