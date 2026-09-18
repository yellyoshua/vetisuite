import { sql } from 'drizzle-orm'
import { boolean, check, integer, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { organizationsTable } from '../organizations/organizations.table'

type TimeRange = { start: string; end: string }

type DayAvailability = { enabled: boolean; ranges: TimeRange[] }

type DateOverride = { date: string; label: string; ranges: TimeRange[] }

export const appointmentsAvailabilityTable = pgTable(
  'appointments_availability',
  {
    id: uuid().primaryKey().defaultRandom(),
    organization: uuid()
      .notNull()
      .unique()
      .references(() => organizationsTable.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
    timezone: text().notNull(),
    week: jsonb().$type<DayAvailability[]>().notNull(),
    overrides: jsonb().$type<DateOverride[]>().notNull(),
    slotMinutes: integer().notNull(),
    bufferBefore: integer().notNull(),
    bufferAfter: integer().notNull(),
    minNoticeHours: integer().notNull(),
    maxAdvanceDays: integer().notNull(),
    maxPerDay: integer().notNull(),
    onlineBooking: boolean().notNull(),
    autoConfirm: boolean().notNull(),
    createdAt: timestamp({ mode: 'date', withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ mode: 'date', withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
    archivedAt: timestamp({ mode: 'date', withTimezone: true }),
  },
  (t) => [
    check('appointments_availability_positive_check', sql`${t.slotMinutes} > 0 and ${t.maxAdvanceDays} > 0`),
    check(
      'appointments_availability_non_negative_check',
      sql`${t.bufferBefore} >= 0 and ${t.bufferAfter} >= 0 and ${t.minNoticeHours} >= 0 and ${t.maxPerDay} >= 0`,
    ),
  ],
)
