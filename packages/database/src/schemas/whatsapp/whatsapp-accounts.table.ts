import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { whatsappAccountStatus } from '../enums'
import { organizationsTable } from '../organizations/organizations.table'

export const whatsappAccountsTable = pgTable(
  'whatsapp_accounts',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .unique()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    wabaId: text().notNull(),
    phoneNumberId: text().notNull().unique(),
    displayPhoneNumber: text().notNull(),
    verifiedName: text().notNull(),
    accessToken: text().notNull(),
    status: whatsappAccountStatus().notNull().default('active'),
    consentAcceptedAt: timestamp({ mode: 'date', withTimezone: true }).notNull(),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index().on(t.wabaId)],
)
