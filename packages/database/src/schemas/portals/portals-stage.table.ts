import { relations, sql } from 'drizzle-orm'
import { boolean, check, index, integer, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { organizationsTable } from '../organizations/organizations.table'
import { portalsFieldTable } from './portals-field.table'
import { portalsTable } from './portals.table'

export const portalsStageTable = pgTable(
  'portals_stage',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    portal: uuid()
      .notNull()
      .references(() => portalsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    name: text().notNull(),
    title: text().notNull(),
    description: text(),
    position: integer().notNull(),
    active: boolean().notNull().default(true),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    archivedAt: timestamp({ mode: 'date', withTimezone: true }),
  },
  (t) => [
    index().on(t.organization),
    unique().on(t.portal, t.name),
    check('portals_stage_position_check', sql`${t.position} >= 0`),
  ],
)

export const portalsStageRelations = relations(portalsStageTable, ({ one, many }) => ({
  portal: one(portalsTable, { fields: [portalsStageTable.portal], references: [portalsTable.id] }),
  fields: many(portalsFieldTable),
}))
