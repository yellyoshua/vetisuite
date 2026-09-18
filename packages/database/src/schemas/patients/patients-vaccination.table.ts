import { relations, sql } from 'drizzle-orm'
import { check, date, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organizationsTable } from '../organizations/organizations.table'
import { patientsTable } from './patients.table'

export const patientsVaccinationTable = pgTable(
  'patients_vaccination',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    patient: uuid()
      .notNull()
      .references(() => patientsTable.id, { onDelete: 'no action', onUpdate: 'cascade' }),
    vaccine: text().notNull(),
    appliedAt: timestamp({ mode: 'date', withTimezone: true }).notNull(),
    nextDueAt: date({ mode: 'string' }),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    archivedAt: timestamp({ mode: 'date', withTimezone: true }),
  },
  (t) => [
    index().on(t.organization),
    check('patients_vaccination_next_due_at_check', sql`${t.nextDueAt} >= ${t.appliedAt}::date`),
  ],
)

export const patientsVaccinationRelations = relations(patientsVaccinationTable, ({ one }) => ({
  patient: one(patientsTable, { fields: [patientsVaccinationTable.patient], references: [patientsTable.id] }),
}))
