import { relations, sql } from 'drizzle-orm'
import { boolean, check, pgTable, text, timestamp, unique, uuid } from 'drizzle-orm/pg-core'
import { employeesTable } from '../employees/employees.table'
import { portalPurpose, portalStatus, vetPolicy } from '../enums'
import { organizationsTable } from '../organizations/organizations.table'
import { portalsFieldTable } from './portals-field.table'
import { portalsStageTable } from './portals-stage.table'
import { portalsSubmissionTable } from './portals-submission.table'

export const portalsTable = pgTable(
  'portals',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    name: text().notNull(),
    slug: text().notNull(),
    purpose: portalPurpose().notNull(),
    campaignName: text(),
    status: portalStatus().notNull().default('draft'),
    palettePrimary: text().notNull(),
    paletteAccent: text().notNull(),
    paletteBackground: text().notNull(),
    markdown: text().notNull(),
    logoUrl: text().notNull(),
    vetPolicy: vetPolicy().notNull(),
    defaultVet: uuid().references(() => employeesTable.id, { onDelete: 'set null', onUpdate: 'cascade' }),
    defaultReason: text(),
    autoConfirm: boolean().notNull().default(false),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    archivedAt: timestamp({ mode: 'date', withTimezone: true }),
  },
  (t) => [
    unique().on(t.organization, t.slug),
    check('portals_slug_check', sql`${t.slug} ~ '^[a-z0-9-]+$'`),
    check(
      'portals_palette_check',
      sql`${t.palettePrimary} ~ '^#[0-9a-fA-F]{6}$' and ${t.paletteAccent} ~ '^#[0-9a-fA-F]{6}$' and ${t.paletteBackground} ~ '^#[0-9a-fA-F]{6}$'`,
    ),
  ],
)

export const portalsRelations = relations(portalsTable, ({ one, many }) => ({
  defaultVet: one(employeesTable, { fields: [portalsTable.defaultVet], references: [employeesTable.id] }),
  stages: many(portalsStageTable),
  fields: many(portalsFieldTable),
  submissions: many(portalsSubmissionTable),
}))
