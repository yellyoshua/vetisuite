import { relations, sql } from 'drizzle-orm'
import { boolean, check, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organizationsTable } from '../organizations/organizations.table'
import { portalsFieldTable } from './portals-field.table'

export const portalsFieldOptionTable = pgTable(
  'portals_field_option',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    field: uuid()
      .notNull()
      .references(() => portalsFieldTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    value: text().notNull(),
    label: text().notNull(),
    position: integer().notNull(),
    active: boolean().notNull().default(true),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    archivedAt: timestamp({ mode: 'date', withTimezone: true }),
  },
  (t) => [index().on(t.organization), check('portals_field_option_position_check', sql`${t.position} >= 0`)],
)

export const portalsFieldOptionRelations = relations(portalsFieldOptionTable, ({ one }) => ({
  field: one(portalsFieldTable, { fields: [portalsFieldOptionTable.field], references: [portalsFieldTable.id] }),
}))
