import { relations, sql } from 'drizzle-orm'
import { check, index, integer, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { employeesTable } from '../employees/employees.table'
import { organizationsTable } from '../organizations/organizations.table'
import { patientsTable } from '../patients/patients.table'
import { visitsServiceProductTable } from '../visits/visits-service-product.table'
import { consultationsPrescriptionTable } from './consultations-prescription.table'

export const consultationsTable = pgTable(
  'consultations',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    patient: uuid()
      .notNull()
      .references(() => patientsTable.id, { onDelete: 'no action', onUpdate: 'cascade' }),
    vet: uuid().references(() => employeesTable.id, { onDelete: 'set null', onUpdate: 'cascade' }),
    weightKg: numeric({ precision: 6, scale: 2, mode: 'number' }),
    temperatureC: numeric({ precision: 4, scale: 1, mode: 'number' }),
    heartRateBpm: integer(),
    anamnesis: text().notNull(),
    diagnosis: text().notNull(),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index().on(t.organization),
    check('consultations_vitals_check', sql`${t.weightKg} > 0 and ${t.temperatureC} > 0 and ${t.heartRateBpm} > 0`),
  ],
)

export const consultationsRelations = relations(consultationsTable, ({ one, many }) => ({
  patient: one(patientsTable, { fields: [consultationsTable.patient], references: [patientsTable.id] }),
  vet: one(employeesTable, { fields: [consultationsTable.vet], references: [employeesTable.id] }),
  prescriptions: many(consultationsPrescriptionTable),
  products: many(visitsServiceProductTable),
}))
