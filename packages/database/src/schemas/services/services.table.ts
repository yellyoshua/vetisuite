import { sql } from 'drizzle-orm'
import { check, numeric, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { serviceType } from '../enums'
import { organizationsTable } from '../organizations/organizations.table'

export const servicesTable = pgTable(
  'services',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    type: serviceType().notNull(),
    name: text().notNull(),
    price: numeric({ precision: 12, scale: 2, mode: 'number' }).notNull(),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    archivedAt: timestamp({ mode: 'date', withTimezone: true }),
  },
  (t) => [unique().on(t.organization, t.type, t.name), check('services_price_check', sql`${t.price} >= 0`)],
)
