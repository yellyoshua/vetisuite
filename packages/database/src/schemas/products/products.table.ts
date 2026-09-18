import { sql } from 'drizzle-orm'
import { check, date, index, integer, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { productCategory } from '../enums'
import { organizationsTable } from '../organizations/organizations.table'

export const productsTable = pgTable(
  'products',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    name: text().notNull(),
    category: productCategory().notNull(),
    stock: integer().notNull().default(0),
    minStock: integer().notNull().default(0),
    price: numeric({ precision: 12, scale: 2, mode: 'number' }).notNull(),
    expiry: date({ mode: 'string' }),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    archivedAt: timestamp({ mode: 'date', withTimezone: true }),
  },
  (t) => [
    index().on(t.organization),
    check('products_stock_check', sql`${t.stock} >= 0 and ${t.minStock} >= 0`),
    check('products_price_check', sql`${t.price} >= 0`),
  ],
)
