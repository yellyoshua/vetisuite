import { relations, sql } from 'drizzle-orm'
import { boolean, index, pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { clientsTable } from '../clients/clients.table'
import { invoicesTable } from '../invoices/invoices.table'
import { organizationsTable } from '../organizations/organizations.table'
import { visitsServiceTable } from './visits-service.table'

export const visitsTable = pgTable(
  'visits',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    client: uuid()
      .notNull()
      .references(() => clientsTable.id, { onDelete: 'no action', onUpdate: 'cascade' }),
    invoice: uuid().references(() => invoicesTable.id, { onDelete: 'set null', onUpdate: 'cascade' }),
    started: boolean().notNull().default(false),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    archivedAt: timestamp({ mode: 'date', withTimezone: true }),
  },
  (t) => [
    index().on(t.organization),
    uniqueIndex('visits_open_client_unique')
      .on(t.client)
      .where(sql`${t.invoice} is null and ${t.archivedAt} is null`),
  ],
)

export const visitsRelations = relations(visitsTable, ({ one, many }) => ({
  client: one(clientsTable, { fields: [visitsTable.client], references: [clientsTable.id] }),
  invoice: one(invoicesTable, { fields: [visitsTable.invoice], references: [invoicesTable.id] }),
  services: many(visitsServiceTable),
}))
