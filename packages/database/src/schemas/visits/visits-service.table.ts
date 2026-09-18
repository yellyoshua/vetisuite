import { relations, sql } from 'drizzle-orm'
import { boolean, check, index, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { serviceType, visitServiceStatus } from '../enums'
import { organizationsTable } from '../organizations/organizations.table'
import { patientsTable } from '../patients/patients.table'
import { servicesTable } from '../services/services.table'
import { visitsServiceGroomingTable } from './visits-service-grooming.table'
import { visitsServiceLabTable } from './visits-service-lab.table'
import { visitsServiceProductTable } from './visits-service-product.table'
import { visitsTable } from './visits.table'

export const visitsServiceTable = pgTable(
  'visits_service',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    visit: uuid()
      .notNull()
      .references(() => visitsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    patient: uuid()
      .notNull()
      .references(() => patientsTable.id, { onDelete: 'no action', onUpdate: 'cascade' }),
    service: uuid().references(() => servicesTable.id, { onDelete: 'set null', onUpdate: 'cascade' }),
    type: serviceType().notNull(),
    label: text().notNull(),
    price: numeric({ precision: 12, scale: 2, mode: 'number' }).notNull(),
    status: visitServiceStatus().notNull(),
    started: boolean().notNull().default(false),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    archivedAt: timestamp({ mode: 'date', withTimezone: true }),
  },
  (t) => [index().on(t.organization), check('visits_service_price_check', sql`${t.price} >= 0`)],
)

export const visitsServiceRelations = relations(visitsServiceTable, ({ one }) => ({
  visit: one(visitsTable, { fields: [visitsServiceTable.visit], references: [visitsTable.id] }),
  patient: one(patientsTable, { fields: [visitsServiceTable.patient], references: [patientsTable.id] }),
  service: one(servicesTable, { fields: [visitsServiceTable.service], references: [servicesTable.id] }),
  grooming: one(visitsServiceGroomingTable),
  lab: one(visitsServiceLabTable),
  product: one(visitsServiceProductTable),
}))
