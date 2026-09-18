import { relations, sql } from 'drizzle-orm'
import { check, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { employeesTable } from '../employees/employees.table'
import { organizationsTable } from '../organizations/organizations.table'
import { visitsServiceTable } from './visits-service.table'

export const visitsServiceGroomingTable = pgTable(
  'visits_service_grooming',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    visitService: uuid()
      .notNull()
      .unique('visits_service_grooming_visit_service_unique')
      .references(() => visitsServiceTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    groomer: uuid().references(() => employeesTable.id, { onDelete: 'set null', onUpdate: 'cascade' }),
    belongings: text().notNull().default(''),
    startedAt: timestamp({ mode: 'date', withTimezone: true }),
    finishedAt: timestamp({ mode: 'date', withTimezone: true }),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    archivedAt: timestamp({ mode: 'date', withTimezone: true }),
  },
  (t) => [
    index().on(t.organization),
    check('visits_service_grooming_finished_at_check', sql`${t.finishedAt} >= ${t.startedAt}`),
  ],
)

export const visitsServiceGroomingRelations = relations(visitsServiceGroomingTable, ({ one }) => ({
  visitService: one(visitsServiceTable, {
    fields: [visitsServiceGroomingTable.visitService],
    references: [visitsServiceTable.id],
  }),
  groomer: one(employeesTable, { fields: [visitsServiceGroomingTable.groomer], references: [employeesTable.id] }),
}))
