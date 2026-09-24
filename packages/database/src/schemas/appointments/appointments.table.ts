import { relations, sql } from 'drizzle-orm'
import { check, index, integer, pgTable, text, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core'
import { employeesTable } from '../employees/employees.table'
import { appointmentSource, appointmentStatus } from '../enums'
import { organizationsTable } from '../organizations/organizations.table'
import { patientsTable } from '../patients/patients.table'

export const appointmentsTable = pgTable(
  'appointments',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    patient: uuid()
      .notNull()
      .references(() => patientsTable.id, { onDelete: 'no action', onUpdate: 'cascade' }),
    vet: uuid().references(() => employeesTable.id, { onDelete: 'set null', onUpdate: 'cascade' }),
    startsAt: timestamp({ mode: 'string' }).notNull(),
    timezone: text().notNull(),
    durationMinutes: integer().notNull(),
    reason: text().notNull(),
    status: appointmentStatus().notNull().default('pending'),
    source: appointmentSource().notNull().default('staff'),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    archivedAt: timestamp({ mode: 'date', withTimezone: true }),
  },
  (t) => [
    index().on(t.organization),
    uniqueIndex('appointments_vet_starts_at_unique')
      .on(t.vet, t.startsAt)
      .where(sql`${t.status} <> 'cancelled' and ${t.archivedAt} is null`),
    check('appointments_duration_minutes_check', sql`${t.durationMinutes} > 0`),
  ],
)

export const appointmentsRelations = relations(appointmentsTable, ({ one }) => ({
  patient: one(patientsTable, { fields: [appointmentsTable.patient], references: [patientsTable.id] }),
  vet: one(employeesTable, { fields: [appointmentsTable.vet], references: [employeesTable.id] }),
}))
