import { relations, sql } from 'drizzle-orm'
import { check, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { employeePosition } from '../enums'
import { organizationsTable } from '../organizations/organizations.table'
import { usersTable } from '../users/users.table'

export const employeesTable = pgTable(
  'employees',
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
    phone: text(),
    avatar: text(),
    position: employeePosition().notNull(),
    color: text(),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    archivedAt: timestamp({ mode: 'date', withTimezone: true }),
  },
  (t) => [index().on(t.organization), check('employees_color_check', sql`${t.color} ~ '^#[0-9a-fA-F]{6}$'`)],
)

export const employeesRelations = relations(employeesTable, ({ one }) => ({
  user: one(usersTable, { fields: [employeesTable.user], references: [usersTable.id] }),
}))
