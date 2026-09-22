import { relations, sql } from 'drizzle-orm'
import { boolean, check, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { employeesTable } from '../employees/employees.table'
import { role } from '../enums'
import { organizationsTable } from '../organizations/organizations.table'
import { ownersTable } from '../owners/owners.table'
import { superadminsTable } from '../superadmins/superadmins.table'

export const usersTable = pgTable(
  'users',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    email: text().notNull().unique(),
    password: text().notNull(),
    role: role().notNull(),
    emailConfirmed: boolean().notNull().default(false),
    emailConfirmedAt: timestamp({ mode: 'date', withTimezone: true }),
    lastSignInAt: timestamp({ mode: 'date', withTimezone: true }),
    bannedUntil: timestamp({ mode: 'date', withTimezone: true }),
    disabled: boolean().notNull().default(false),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    archivedAt: timestamp({ mode: 'date', withTimezone: true }),
  },
  (t) => [unique().on(t.organization, t.email), check('users_email_check', sql`${t.email} = lower(${t.email})`)],
)

export const usersRelations = relations(usersTable, ({ one }) => ({
  superadmin: one(superadminsTable),
  owner: one(ownersTable),
  employee: one(employeesTable),
}))
