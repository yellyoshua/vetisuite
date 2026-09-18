import { relations, sql } from 'drizzle-orm'
import { boolean, check, date, index, integer, numeric, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { fieldBinding, fieldType, optionsSource } from '../enums'
import { organizationsTable } from '../organizations/organizations.table'
import { portalsFieldOptionTable } from './portals-field-option.table'
import { portalsStageTable } from './portals-stage.table'
import { portalsTable } from './portals.table'

export const portalsFieldTable = pgTable(
  'portals_field',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    portal: uuid()
      .notNull()
      .references(() => portalsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    stage: uuid()
      .notNull()
      .references(() => portalsStageTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    name: text().notNull(),
    label: text().notNull(),
    helpText: text(),
    placeholder: text(),
    type: fieldType().notNull(),
    binding: fieldBinding(),
    required: boolean().notNull().default(false),
    position: integer().notNull(),
    active: boolean().notNull().default(true),
    minLength: integer(),
    maxLength: integer(),
    minValue: numeric({ mode: 'number' }),
    maxValue: numeric({ mode: 'number' }),
    minDate: date({ mode: 'string' }),
    maxDate: date({ mode: 'string' }),
    optionsSource: optionsSource(),
    minSelected: integer(),
    maxSelected: integer(),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    archivedAt: timestamp({ mode: 'date', withTimezone: true }),
  },
  (t) => [
    index().on(t.organization),
    unique().on(t.portal, t.name),
    check('portals_field_position_check', sql`${t.position} >= 0`),
    check('portals_field_length_check', sql`${t.minLength} <= ${t.maxLength}`),
    check('portals_field_value_check', sql`${t.minValue} <= ${t.maxValue}`),
    check('portals_field_date_check', sql`${t.minDate} <= ${t.maxDate}`),
    check('portals_field_selected_check', sql`${t.minSelected} <= ${t.maxSelected}`),
  ],
)

export const portalsFieldRelations = relations(portalsFieldTable, ({ one, many }) => ({
  portal: one(portalsTable, { fields: [portalsFieldTable.portal], references: [portalsTable.id] }),
  stage: one(portalsStageTable, { fields: [portalsFieldTable.stage], references: [portalsStageTable.id] }),
  options: many(portalsFieldOptionTable),
}))
