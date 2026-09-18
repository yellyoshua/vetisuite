import { relations, sql } from 'drizzle-orm'
import { check, index, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { invoicesTable } from '../invoices/invoices.table'
import { organizationsTable } from '../organizations/organizations.table'
import { patientsTable } from '../patients/patients.table'
import { visitsTable } from '../visits/visits.table'

export const clientsTable = pgTable(
  'clients',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    name: text().notNull(),
    phone: text().notNull(),
    email: text(),
    debt: numeric({ precision: 12, scale: 2, mode: 'number' }).notNull().default(0),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    archivedAt: timestamp({ mode: 'date', withTimezone: true }),
  },
  (t) => [index().on(t.organization), check('clients_debt_check', sql`${t.debt} >= 0`)],
)

export const clientsRelations = relations(clientsTable, ({ many }) => ({
  patients: many(patientsTable),
  visits: many(visitsTable),
  invoices: many(invoicesTable),
}))
