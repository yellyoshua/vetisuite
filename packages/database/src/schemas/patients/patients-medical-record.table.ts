import { relations } from 'drizzle-orm'
import { boolean, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organizationsTable } from '../organizations/organizations.table'
import { patientsTable } from './patients.table'

export const patientsMedicalRecordTable = pgTable(
  'patients_medical_record',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    patient: uuid()
      .notNull()
      .unique()
      .references(() => patientsTable.id, { onDelete: 'no action', onUpdate: 'cascade' }),
    allergies: text().array().notNull().default([]),
    aggressive: boolean().notNull().default(false),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    archivedAt: timestamp({ mode: 'date', withTimezone: true }),
  },
  (t) => [index().on(t.organization)],
)

export const patientsMedicalRecordRelations = relations(patientsMedicalRecordTable, ({ one }) => ({
  patient: one(patientsTable, { fields: [patientsMedicalRecordTable.patient], references: [patientsTable.id] }),
}))
