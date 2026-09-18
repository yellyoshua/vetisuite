import { relations, sql } from 'drizzle-orm'
import { check, index, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { businessArea } from '../enums'
import { organizationsTable } from '../organizations/organizations.table'
import { patientsTable } from '../patients/patients.table'
import { visitsServiceTable } from '../visits/visits-service.table'
import { invoicesTable } from './invoices.table'

export const invoicesItemTable = pgTable(
  'invoices_item',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    invoice: uuid()
      .notNull()
      .references(() => invoicesTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    description: text().notNull(),
    amount: numeric({ precision: 12, scale: 2, mode: 'number' }).notNull(),
    area: businessArea().notNull(),
    patient: uuid()
      .notNull()
      .references(() => patientsTable.id, { onDelete: 'no action', onUpdate: 'cascade' }),
    visitService: uuid().references(() => visitsServiceTable.id, { onDelete: 'set null', onUpdate: 'cascade' }),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.organization), check('invoices_item_amount_check', sql`${t.amount} >= 0`)],
)

export const invoicesItemRelations = relations(invoicesItemTable, ({ one }) => ({
  invoice: one(invoicesTable, { fields: [invoicesItemTable.invoice], references: [invoicesTable.id] }),
  patient: one(patientsTable, { fields: [invoicesItemTable.patient], references: [patientsTable.id] }),
  visitService: one(visitsServiceTable, {
    fields: [invoicesItemTable.visitService],
    references: [visitsServiceTable.id],
  }),
}))
