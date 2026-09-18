import { relations, sql } from 'drizzle-orm'
import { check, index, integer, numeric, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core'
import { consultationsTable } from '../consultations/consultations.table'
import { organizationsTable } from '../organizations/organizations.table'
import { productsTable } from '../products/products.table'
import { visitsServiceTable } from './visits-service.table'

export const visitsServiceProductTable = pgTable(
  'visits_service_product',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    visitService: uuid()
      .notNull()
      .unique('visits_service_product_visit_service_unique')
      .references(() => visitsServiceTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    product: uuid().references(() => productsTable.id, { onDelete: 'set null', onUpdate: 'cascade' }),
    consultation: uuid().references(() => consultationsTable.id, { onDelete: 'set null', onUpdate: 'cascade' }),
    quantity: integer().notNull(),
    unitPrice: numeric({ precision: 12, scale: 2, mode: 'number' }).notNull(),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index().on(t.organization),
    check('visits_service_product_quantity_check', sql`${t.quantity} > 0`),
    check('visits_service_product_unit_price_check', sql`${t.unitPrice} >= 0`),
  ],
)

export const visitsServiceProductRelations = relations(visitsServiceProductTable, ({ one }) => ({
  visitService: one(visitsServiceTable, {
    fields: [visitsServiceProductTable.visitService],
    references: [visitsServiceTable.id],
  }),
  product: one(productsTable, { fields: [visitsServiceProductTable.product], references: [productsTable.id] }),
  consultation: one(consultationsTable, {
    fields: [visitsServiceProductTable.consultation],
    references: [consultationsTable.id],
  }),
}))
