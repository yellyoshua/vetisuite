import { parseInput } from '@/lib/parse-input'
import {
  WEEKDAY_VALUES,
} from '@/constants/appointments-clinics'
import {
  clinicAvailabilitySchema,
  type ApiAppointmentsAvailability,
  type ApiOrganization,
  type ClinicAvailability,
  type ClinicAvailabilityInput,
  type ScheduleException,
  type ScheduleDay,
  type Weekday,
} from '@/modules/employee/appointments-clinics/appointments-clinics.schema'
import appointmentsAvailabilityService from '@/modules/employee/appointments-clinics/appointments-availability.service'
import organizationService from '@/modules/employee/appointments-clinics/organization.service'

function createDefaultWorkday(weekday: Weekday): ScheduleDay {
  return {
    weekday,
    isOpen: weekday !== 'sunday',
    blocks: [
      { from: '08:00', to: '13:00' },
      { from: '14:00', to: '18:00' },
    ],
  }
}

function mapRecordToAvailability(record: ApiAppointmentsAvailability, timezone: string): ClinicAvailability {
  const days: ScheduleDay[] = WEEKDAY_VALUES.map((weekday, index) => {
    const found = record.week?.find((item) => item.weekday === weekday) || record.week?.[index]
    if (!found) {
      return { weekday, isOpen: false, blocks: [{ from: '09:00', to: '17:00' }] }
    }

    return {
      weekday,
      isOpen: found.enabled,
      blocks: found.ranges.length > 0
        ? found.ranges.map((range) => ({ from: range.start, to: range.end }))
        : [{ from: '09:00', to: '17:00' }],
    }
  })

  const exceptions: ScheduleException[] = (record.overrides || []).map((override) => {
    const isClosed = override.ranges.length === 0

    if (isClosed) {
      return {
        id: override.id || override.date,
        date: override.date,
        reason: override.label,
        kind: 'closed',
      }
    }

    return {
      id: override.id || override.date,
      date: override.date,
      reason: override.label,
      kind: 'reduced-hours',
      hours: { from: override.ranges[0].start, to: override.ranges[0].end },
    }
  })

  const bufferLabel = record.bufferAfter === 0 ? 'Sin margen' : `${record.bufferAfter} minutos`
  const noticeLabel = record.minNoticeHours === 0 ? 'Sin mínimo' : `${record.minNoticeHours} horas`

  return {
    id: record.id,
    days,
    bookingRules: {
      appointmentDuration: `${record.slotMinutes} minutos`,
      bufferTime: bufferLabel,
      minimumNotice: noticeLabel,
      bookingWindow: `${record.maxAdvanceDays} días`,
      timeZone: timezone,
    },
    bookingToggles: {
      portalBooking: record.onlineBooking,
      autoConfirm: record.autoConfirm,
    },
    services: [],
    exceptions,
  }
}

function createDefaultAvailability(timezone: string): ClinicAvailability {
  return {
    days: WEEKDAY_VALUES.map(createDefaultWorkday),
    bookingRules: {
      appointmentDuration: '30 minutos',
      bufferTime: '10 minutos',
      minimumNotice: '2 horas',
      bookingWindow: '30 días',
      timeZone: timezone,
    },
    bookingToggles: {
      portalBooking: true,
      autoConfirm: false,
    },
    services: [],
    exceptions: [],
  }
}

export async function resolveAvailability(): Promise<ClinicAvailability> {
  const [record, organization] = await Promise.all([
    appointmentsAvailabilityService.getOne<ApiAppointmentsAvailability>(),
    organizationService.get<ApiOrganization>(),
  ])

  if (!record) {
    return createDefaultAvailability(organization.timezone)
  }

  return mapRecordToAvailability(record, organization.timezone)
}

export async function resolveExceptions(): Promise<ScheduleException[]> {
  const availability = await resolveAvailability()

  return availability.exceptions
}

export async function deleteScheduleException(exceptionId: string): Promise<void> {
  const record = await appointmentsAvailabilityService.getOne<ApiAppointmentsAvailability>()
  if (!record) {
    return
  }

  const remainingOverrides = (record.overrides || []).filter(
    (override) => (override.id || override.date) !== exceptionId,
  )

  await appointmentsAvailabilityService.put({
    id: record.id,
    week: record.week,
    overrides: remainingOverrides,
    slotMinutes: record.slotMinutes,
    bufferBefore: record.bufferBefore,
    bufferAfter: record.bufferAfter,
    minNoticeHours: record.minNoticeHours,
    maxAdvanceDays: record.maxAdvanceDays,
    maxPerDay: record.maxPerDay,
    onlineBooking: record.onlineBooking,
    autoConfirm: record.autoConfirm,
  })
}

export async function saveClinicAvailability(draft: ClinicAvailabilityInput): Promise<ClinicAvailability> {
  const input = parseInput(clinicAvailabilitySchema, draft)
  const existing = await appointmentsAvailabilityService.getOne<ApiAppointmentsAvailability>()

  const slotMinutes = Number.parseInt(input.bookingRules.appointmentDuration, 10) || 30
  const bufferAfter = input.bookingRules.bufferTime === 'Sin margen' ? 0 : Number.parseInt(input.bookingRules.bufferTime, 10) || 0
  const minNoticeHours = input.bookingRules.minimumNotice === 'Sin mínimo' ? 0 : Number.parseInt(input.bookingRules.minimumNotice, 10) || 0
  const maxAdvanceDays = Number.parseInt(input.bookingRules.bookingWindow, 10) || 30

  const week = input.days.map((day) => ({
    weekday: day.weekday,
    enabled: day.isOpen,
    ranges: day.isOpen ? day.blocks.map((block) => ({ start: block.from, end: block.to })) : [],
  }))

  const overrides = existing?.overrides || []

  const payload = {
    id: input.id || existing?.id,
    week,
    overrides,
    slotMinutes,
    bufferBefore: 0,
    bufferAfter,
    minNoticeHours,
    maxAdvanceDays,
    maxPerDay: existing?.maxPerDay ?? 20,
    onlineBooking: input.bookingToggles.portalBooking,
    autoConfirm: input.bookingToggles.autoConfirm,
  }

  const response = await appointmentsAvailabilityService.put<{ availability: ApiAppointmentsAvailability }>(payload)
  const organization = await organizationService.put<ApiOrganization>({ timezone: input.bookingRules.timeZone })

  if (response?.availability) {
    return mapRecordToAvailability(response.availability, organization.timezone)
  }

  return resolveAvailability()
}

export default {
  availability: resolveAvailability,
  exceptions: resolveExceptions,
}
