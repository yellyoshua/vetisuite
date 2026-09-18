import { relations } from 'drizzle-orm'
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organizationsTable } from '../organizations/organizations.table'
import { visitsServiceTable } from './visits-service.table'

export const visitsServiceLabTable = pgTable(
  'visits_service_lab',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    visitService: uuid()
      .notNull()
      .unique('visits_service_lab_visit_service_unique')
      .references(() => visitsServiceTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    result: text().notNull(),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.organization)],
)

export const visitsServiceLabRelations = relations(visitsServiceLabTable, ({ one }) => ({
  visitService: one(visitsServiceTable, {
    fields: [visitsServiceLabTable.visitService],
    references: [visitsServiceTable.id],
  }),
}))
