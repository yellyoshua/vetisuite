import { z } from 'zod'
import {
  BOOKING_RULE_OPTIONS,
  BOOKING_RULE_VALUES,
  BOOKING_TOGGLE_VALUES,
  ESTIMATE_SLOT_MINUTES,
  LATEST_BLOCK_END,
  MAX_BLOCKS_PER_DAY,
  NEW_BLOCK_MINUTES,
  WEEKDAY_LABELS,
  WEEKDAY_VALUES,
} from '@/constants/appointments-clinics'

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/

const MINUTES_PER_HOUR = 60

const BOOKING_RULE_ERROR = 'Elige una opción válida en las reglas de reserva.'

export type Weekday = (typeof WEEKDAY_VALUES)[number]

export type BookingRule = (typeof BOOKING_RULE_VALUES)[number]

export type BookingToggle = (typeof BOOKING_TOGGLE_VALUES)[number]

export type TimeBlock = {
  from: string
  to: string
}

export type ScheduleDay = {
  weekday: Weekday
  isOpen: boolean
  blocks: TimeBlock[]
}

export type BookableService = {
  id: string
  name: string
  area: string
  price: number
  isPortalVisible: boolean
}

type ScheduleExceptionBase = {
  id: string
  date: string
  reason: string
}

export type ScheduleException =
  | (ScheduleExceptionBase & { kind: 'closed' })
  | (ScheduleExceptionBase & { kind: 'reduced-hours'; hours: TimeBlock })

export type DayAvailability = {
  weekday?: string
  enabled: boolean
  ranges: { start: string; end: string }[]
}

export type DateOverride = {
  id?: string
  date: string
  label: string
  ranges: { start: string; end: string }[]
}

export type ApiOrganization = {
  id: string
  name: string
  timezone: string
}

export type ApiAppointmentsAvailability = {
  id: string
  slotMinutes: number
  bufferBefore: number
  bufferAfter: number
  minNoticeHours: number
  maxAdvanceDays: number
  maxPerDay: number
  onlineBooking: boolean
  autoConfirm: boolean
  week: DayAvailability[]
  overrides: DateOverride[]
  createdAt?: string
  updatedAt?: string
}

export type ClinicAvailability = {
  id?: string
  days: ScheduleDay[]
  bookingRules: Record<BookingRule, string>
  bookingToggles: Record<BookingToggle, boolean>
  services: BookableService[]
  exceptions: ScheduleException[]
}

export type WeeklySummary = {
  hours: number
  openDays: number
  estimatedAppointments: number
}

function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)

  return hours * MINUTES_PER_HOUR + minutes
}

function hasValidTimes(block: TimeBlock): boolean {
  return TIME_PATTERN.test(block.from) && TIME_PATTERN.test(block.to)
}

function hasOrderedBlocks(blocks: TimeBlock[]): boolean {
  const sortedBlocks = [...blocks].sort((first, second) => first.from.localeCompare(second.from))

  return sortedBlocks.every(
    (block, index) => block.from < block.to && (index === 0 || sortedBlocks[index - 1].to <= block.from),
  )
}

function toTime(totalMinutes: number): string {
  const hours = String(Math.floor(totalMinutes / MINUTES_PER_HOUR)).padStart(2, '0')
  const minutes = String(totalMinutes % MINUTES_PER_HOUR).padStart(2, '0')

  return `${hours}:${minutes}`
}

type MinuteRange = [start: number, end: number]

function toMinuteRanges(blocks: TimeBlock[]): MinuteRange[] {
  return blocks
    .filter(hasValidTimes)
    .map((block): MinuteRange => [toMinutes(block.from), toMinutes(block.to)])
    .filter(([start, end]) => end > start)
    .sort((first, second) => first[0] - second[0])
}

function countDayMinutes(blocks: TimeBlock[]): number {
  const coverage = toMinuteRanges(blocks).reduce(
    ({ total, coveredUntil }, [start, end]) => ({
      total: total + Math.max(0, end - Math.max(start, coveredUntil)),
      coveredUntil: Math.max(coveredUntil, end),
    }),
    { total: 0, coveredUntil: 0 },
  )

  return coverage.total
}

export function createNextBlock(day: ScheduleDay): TimeBlock {
  const start = Math.max(0, ...toMinuteRanges(day.blocks).map(([, end]) => end))
  const end = Math.min(start + NEW_BLOCK_MINUTES, toMinutes(LATEST_BLOCK_END))

  return { from: toTime(start), to: toTime(end) }
}

export function canAddBlock(day: ScheduleDay): boolean {
  return day.blocks.length < MAX_BLOCKS_PER_DAY
}

export function canRemoveBlock(day: ScheduleDay): boolean {
  return day.blocks.length > 1
}

export function summarizeWeek(days: ScheduleDay[]): WeeklySummary {
  const openDays = days.filter((day) => day.isOpen)
  const weekMinutes = openDays.reduce((total, day) => total + countDayMinutes(day.blocks), 0)

  return {
    hours: Math.round(weekMinutes / MINUTES_PER_HOUR),
    openDays: openDays.length,
    estimatedAppointments: Math.round(weekMinutes / ESTIMATE_SLOT_MINUTES),
  }
}

const timeSchema = z.string().regex(TIME_PATTERN, 'Completa cada bloque con horas en formato HH:mm.')

const scheduleDaySchema = z
  .object({
    weekday: z.enum(WEEKDAY_VALUES, 'El día de la semana no es válido.'),
    isOpen: z.boolean(),
    blocks: z
      .array(z.object({ from: timeSchema, to: timeSchema }))
      .min(1, 'Cada día necesita al menos un bloque de atención.')
      .max(MAX_BLOCKS_PER_DAY, `Cada día admite como máximo ${MAX_BLOCKS_PER_DAY} bloques.`),
  })
  .superRefine((day, context) => {
    if (day.isOpen && !hasOrderedBlocks(day.blocks)) {
      context.addIssue({
        code: 'custom',
        message: `${WEEKDAY_LABELS[day.weekday]}: cada bloque debe empezar antes de terminar y no cruzarse con otro.`,
      })
    }
  })

export const clinicAvailabilitySchema = z.object({
  id: z.string().optional(),
  days: z.array(scheduleDaySchema).length(WEEKDAY_VALUES.length, 'El horario debe tener los siete días.'),
  bookingRules: z.object({
    appointmentDuration: z.enum(BOOKING_RULE_OPTIONS.appointmentDuration, BOOKING_RULE_ERROR),
    bufferTime: z.enum(BOOKING_RULE_OPTIONS.bufferTime, BOOKING_RULE_ERROR),
    minimumNotice: z.enum(BOOKING_RULE_OPTIONS.minimumNotice, BOOKING_RULE_ERROR),
    bookingWindow: z.enum(BOOKING_RULE_OPTIONS.bookingWindow, BOOKING_RULE_ERROR),
    timeZone: z.enum(BOOKING_RULE_OPTIONS.timeZone, BOOKING_RULE_ERROR),
  }),
  bookingToggles: z.record(z.enum(BOOKING_TOGGLE_VALUES), z.boolean()),
  services: z.array(
    z.object({
      id: z.string().min(1, 'Falta el identificador de un servicio.'),
      isPortalVisible: z.boolean(),
    }),
  ),
})

export type ClinicAvailabilityInput = z.infer<typeof clinicAvailabilitySchema>
