import { relations } from 'drizzle-orm'
import { boolean, index, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { appointmentsTable } from '../appointments/appointments.table'
import { clientsTable } from '../clients/clients.table'
import { rejectionReason, submissionStatus } from '../enums'
import { organizationsTable } from '../organizations/organizations.table'
import { patientsTable } from '../patients/patients.table'
import { portalsAnswerTable } from './portals-answer.table'
import { portalsTable } from './portals.table'

export const portalsSubmissionTable = pgTable(
  'portals_submission',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    portal: uuid()
      .notNull()
      .references(() => portalsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    idempotencyKey: text().notNull(),
    status: submissionStatus().notNull().default('received'),
    rejectionReason: rejectionReason(),
    needsReview: boolean().notNull().default(false),
    client: uuid().references(() => clientsTable.id, { onDelete: 'no action', onUpdate: 'cascade' }),
    patient: uuid().references(() => patientsTable.id, { onDelete: 'no action', onUpdate: 'cascade' }),
    appointment: uuid().references(() => appointmentsTable.id, { onDelete: 'set null', onUpdate: 'cascade' }),
    campaignName: text(),
    reviewedAt: timestamp({ mode: 'date', withTimezone: true }),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    archivedAt: timestamp({ mode: 'date', withTimezone: true }),
  },
  (t) => [index().on(t.organization), unique().on(t.portal, t.idempotencyKey)],
)

export const portalsSubmissionRelations = relations(portalsSubmissionTable, ({ one, many }) => ({
  portal: one(portalsTable, { fields: [portalsSubmissionTable.portal], references: [portalsTable.id] }),
  client: one(clientsTable, { fields: [portalsSubmissionTable.client], references: [clientsTable.id] }),
  patient: one(patientsTable, { fields: [portalsSubmissionTable.patient], references: [patientsTable.id] }),
  appointment: one(appointmentsTable, {
    fields: [portalsSubmissionTable.appointment],
    references: [appointmentsTable.id],
  }),
  answers: many(portalsAnswerTable),
}))
