import { relations } from 'drizzle-orm'
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organizationsTable } from '../organizations/organizations.table'
import { usersTable } from '../users/users.table'

export const ownersTable = pgTable(
  'owners',
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
    description: text(),
    phone: text(),
    avatar: text(),
    position: text(),
    occupation: text(),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    archivedAt: timestamp({ mode: 'date', withTimezone: true }),
  },
  (t) => [index().on(t.organization)],
)

export const ownersRelations = relations(ownersTable, ({ one }) => ({
  user: one(usersTable, { fields: [ownersTable.user], references: [usersTable.id] }),
}))
