import { pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { whatsappTemplateCategory, whatsappTemplateStatus } from '../enums'
import { organizationsTable } from '../organizations/organizations.table'

export const whatsappTemplatesTable = pgTable(
  'whatsapp_templates',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    name: text().notNull(),
    language: text().notNull(),
    metaId: text().notNull(),
    category: whatsappTemplateCategory().notNull(),
    status: whatsappTemplateStatus().notNull().default('pending'),
    rejectedReason: text(),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [unique('whatsapp_templates_organization_name_language_unique').on(t.organization, t.name, t.language)],
)
