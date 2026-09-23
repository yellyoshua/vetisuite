import type { Params } from 'react-router'
import type { ResolverSearch, SearchValue } from '@/hooks/use-resolver'
import { toIsoDate } from '@/lib/to-iso-date'
import appointmentsService from '@/modules/employee/appointments/appointments.service'
import appointmentsCountService from '@/modules/employee/appointments/appointments-count.service'
import type { Appointment, AppointmentsAgenda } from '@/modules/employee/appointments/appointments.schema'

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const DAY_LABEL_FORMAT = new Intl.DateTimeFormat('es-EC', { weekday: 'short', day: 'numeric', month: 'short' })

const SHORT_NAME_LENGTH = 3

function startOfToday(): Date {
  const now = new Date()

  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days)
}

function parseAgendaDate(date: string, today: Date): Date {
  if (!date) {
    return today
  }
  const [year, month, day] = date.split('-').map(Number)
  const agendaDate = new Date(year, month - 1, day)
  if (!ISO_DATE_PATTERN.test(date) || toIsoDate(agendaDate) !== date) {
    throw new Error('La fecha de la agenda no es válida.')
  }

  return agendaDate
}

function formatDayLabel(date: Date, today: Date): string {
  const parts = Object.fromEntries(
    DAY_LABEL_FORMAT.formatToParts(date).map((part) => [part.type, part.value.replace('.', '').slice(0, SHORT_NAME_LENGTH)]),
  )
  const label = `${parts.weekday} ${parts.day} ${parts.month}`

  return toIsoDate(date) === toIsoDate(today) ? `Hoy · ${label}` : label
}

function asText(value: SearchValue | undefined): string {
  return value === undefined || value === null ? '' : String(value)
}

function resolveAgenda(date: string): AppointmentsAgenda {
  const today = startOfToday()
  const agendaDate = parseAgendaDate(date, today)

  return {
    dayLabel: formatDayLabel(agendaDate, today),
    previousDate: toIsoDate(addDays(agendaDate, -1)),
    nextDate: toIsoDate(addDays(agendaDate, 1)),
    doctors: [],
  }
}

export default {
  agenda: (_params: Readonly<Params>, search: ResolverSearch) => resolveAgenda(asText(search.date)),
  appointments: async (_params: Readonly<Params>, search: ResolverSearch) => {
    const today = startOfToday()
    const agendaDate = parseAgendaDate(asText(search.date), today)
    const date = toIsoDate(agendaDate)
    const status = asText(search.status) || undefined
    const vet = asText(search.doctor) || undefined
    const searchValue = asText(search.search) || undefined

    const [appointments] = await Promise.all([
      appointmentsService.get<Appointment[]>({
        date,
        status,
        vet,
        search: searchValue,
        page: search.page,
      }),
      appointmentsCountService.get<{ value: number }>({
        date,
        status,
        vet,
        search: searchValue,
      }),
    ])

    return appointments
  },
}
