import { relations, sql } from 'drizzle-orm'
import { check, index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { fieldBinding, fieldType } from '../enums'
import { organizationsTable } from '../organizations/organizations.table'
import { portalsFieldOptionTable } from './portals-field-option.table'
import { portalsFieldTable } from './portals-field.table'
import { portalsSubmissionTable } from './portals-submission.table'

export const portalsAnswerTable = pgTable(
  'portals_answer',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    submission: uuid()
      .notNull()
      .references(() => portalsSubmissionTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    field: uuid().references(() => portalsFieldTable.id, { onDelete: 'set null', onUpdate: 'cascade' }),
    fieldName: text().notNull(),
    fieldLabel: text().notNull(),
    fieldType: fieldType().notNull(),
    binding: fieldBinding(),
    stageTitle: text().notNull(),
    position: integer().notNull(),
    valueText: text(),
    option: uuid().references(() => portalsFieldOptionTable.id, { onDelete: 'set null', onUpdate: 'cascade' }),
    optionLabel: text(),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index().on(t.organization), check('portals_answer_position_check', sql`${t.position} >= 0`)],
)

export const portalsAnswerRelations = relations(portalsAnswerTable, ({ one }) => ({
  submission: one(portalsSubmissionTable, {
    fields: [portalsAnswerTable.submission],
    references: [portalsSubmissionTable.id],
  }),
  field: one(portalsFieldTable, { fields: [portalsAnswerTable.field], references: [portalsFieldTable.id] }),
  option: one(portalsFieldOptionTable, { fields: [portalsAnswerTable.option], references: [portalsFieldOptionTable.id] }),
}))
