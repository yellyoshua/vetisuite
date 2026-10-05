import { boolean, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { clientsTable } from '../clients/clients.table'
import { whatsappMessageDirection, whatsappMessageStatus } from '../enums'
import { organizationsTable } from '../organizations/organizations.table'

export const whatsappMessagesTable = pgTable(
  'whatsapp_messages',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    client: uuid().references(() => clientsTable.id, { onDelete: 'set null', onUpdate: 'cascade' }),
    direction: whatsappMessageDirection().notNull(),
    status: whatsappMessageStatus().notNull(),
    wamid: text().unique(),
    phone: text().notNull(),
    template: text(),
    billable: boolean(),
    errorCode: integer(),
    errorMessage: text(),
    sentAt: timestamp({ mode: 'date', withTimezone: true }),
    deliveredAt: timestamp({ mode: 'date', withTimezone: true }),
    readAt: timestamp({ mode: 'date', withTimezone: true }),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [index().on(t.organization, t.createdAt)],
)
