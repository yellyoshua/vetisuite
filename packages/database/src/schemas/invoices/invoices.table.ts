import { relations, sql } from 'drizzle-orm'
import { check, integer, numeric, pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { clientsTable } from '../clients/clients.table'
import { payMethod } from '../enums'
import { organizationsTable } from '../organizations/organizations.table'
import { invoicesItemTable } from './invoices-item.table'

export const invoicesTable = pgTable(
  'invoices',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    client: uuid()
      .notNull()
      .references(() => clientsTable.id, { onDelete: 'no action', onUpdate: 'cascade' }),
    number: integer().notNull(),
    subtotal: numeric({ precision: 12, scale: 2, mode: 'number' }).notNull(),
    discount: numeric({ precision: 12, scale: 2, mode: 'number' }).notNull().default(0),
    discountPercent: numeric({ precision: 5, scale: 2, mode: 'number' }).notNull().default(0),
    tax: numeric({ precision: 12, scale: 2, mode: 'number' }).notNull(),
    previousDebt: numeric({ precision: 12, scale: 2, mode: 'number' }).notNull().default(0),
    total: numeric({ precision: 12, scale: 2, mode: 'number' }).notNull(),
    method: payMethod().notNull(),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    unique().on(t.organization, t.number),
    check(
      'invoices_amounts_check',
      sql`${t.subtotal} >= 0 and ${t.tax} >= 0 and ${t.previousDebt} >= 0 and ${t.total} >= 0`,
    ),
    check('invoices_discount_check', sql`${t.discount} >= 0 and ${t.discount} <= ${t.subtotal}`),
    check('invoices_discount_percent_check', sql`${t.discountPercent} between 0 and 100`),
  ],
)

export const invoicesRelations = relations(invoicesTable, ({ one, many }) => ({
  client: one(clientsTable, { fields: [invoicesTable.client], references: [clientsTable.id] }),
  items: many(invoicesItemTable),
}))
