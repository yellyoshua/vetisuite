import { relations } from 'drizzle-orm'
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organizationsTable } from '../organizations/organizations.table'
import { consultationsTable } from './consultations.table'

export const consultationsPrescriptionTable = pgTable(
  'consultations_prescription',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    consultation: uuid()
      .notNull()
      .references(() => consultationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    medication: text().notNull(),
    dosage: text().notNull(),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.organization)],
)

export const consultationsPrescriptionRelations = relations(consultationsPrescriptionTable, ({ one }) => ({
  consultation: one(consultationsTable, {
    fields: [consultationsPrescriptionTable.consultation],
    references: [consultationsTable.id],
  }),
}))
