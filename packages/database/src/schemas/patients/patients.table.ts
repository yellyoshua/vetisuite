import { relations } from 'drizzle-orm'
import { date, index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { appointmentsTable } from '../appointments/appointments.table'
import { clientsTable } from '../clients/clients.table'
import { consultationsTable } from '../consultations/consultations.table'
import { patientSex, species } from '../enums'
import { organizationsTable } from '../organizations/organizations.table'
import { visitsServiceTable } from '../visits/visits-service.table'
import { patientsMedicalRecordTable } from './patients-medical-record.table'
import { patientsVaccinationTable } from './patients-vaccination.table'

export const patientsTable = pgTable(
  'patients',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    client: uuid()
      .notNull()
      .references(() => clientsTable.id, { onDelete: 'no action', onUpdate: 'cascade' }),
    name: text().notNull(),
    species: species().notNull(),
    breed: text(),
    sex: patientSex(),
    birthDate: date({ mode: 'string' }),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    archivedAt: timestamp({ mode: 'date', withTimezone: true }),
  },
  (t) => [index().on(t.organization)],
)

export const patientsRelations = relations(patientsTable, ({ one, many }) => ({
  client: one(clientsTable, { fields: [patientsTable.client], references: [clientsTable.id] }),
  medicalRecord: one(patientsMedicalRecordTable),
  vaccinations: many(patientsVaccinationTable),
  appointments: many(appointmentsTable),
  consultations: many(consultationsTable),
  visitServices: many(visitsServiceTable),
}))
