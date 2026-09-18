import type { ListPage } from '@/hooks/use-list-query'
import { matchesSearch } from '@/lib/matches-search'
import { paginateRows } from '@/lib/paginate-rows'
import { toIsoDate } from '@/lib/to-iso-date'
import type {
  Appointment,
  AppointmentDoctor,
  AppointmentListQuery,
  AppointmentsAgenda,
  AppointmentsAgendaQuery,
} from '../appointments.schema'

type AppointmentSeed = Omit<Appointment, 'date'> & {
  dayOffset: number
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

const DAY_LABEL_FORMAT = new Intl.DateTimeFormat('es-EC', { weekday: 'short', day: 'numeric', month: 'short' })

const SHORT_NAME_LENGTH = 3

const DOCTORS: AppointmentDoctor[] = [
  { id: 'staff-1', name: 'Dra. María Torres' },
  { id: 'staff-2', name: 'Dr. Andrés Vela' },
  { id: 'staff-3', name: 'Dra. Lucía Páez' },
]

const APPOINTMENTS: AppointmentSeed[] = [
  {
    id: 'apt-1',
    dayOffset: 0,
    time: '09:00',
    patientName: 'Max',
    ownerName: 'Carolina Ríos',
    reason: 'Vacunación anual',
    doctorId: 'staff-1',
    doctorName: 'Dra. María Torres',
    status: 'confirmed',
  },
  {
    id: 'apt-2',
    dayOffset: 0,
    time: '10:00',
    patientName: 'Rocky',
    ownerName: 'Marco Salazar',
    reason: 'Control dermatológico',
    doctorId: 'staff-2',
    doctorName: 'Dr. Andrés Vela',
    status: 'pending',
  },
  {
    id: 'apt-3',
    dayOffset: 0,
    time: '11:00',
    patientName: 'Nala',
    ownerName: 'Jorge Paredes',
    reason: 'Chequeo geriátrico',
    doctorId: 'staff-1',
    doctorName: 'Dra. María Torres',
    status: 'confirmed',
  },
  {
    id: 'apt-4',
    dayOffset: 0,
    time: '08:30',
    patientName: 'Kiwi',
    ownerName: 'Elena Buitrón',
    reason: 'Consulta general',
    doctorId: 'staff-3',
    doctorName: 'Dra. Lucía Páez',
    status: 'completed',
  },
  {
    id: 'apt-5',
    dayOffset: -1,
    time: '09:30',
    patientName: 'Toby',
    ownerName: 'Andrés Lema',
    reason: 'Baño medicado',
    doctorId: 'staff-4',
    doctorName: 'Sofía Mena',
    status: 'completed',
  },
  {
    id: 'apt-6',
    dayOffset: -1,
    time: '16:00',
    patientName: 'Simba',
    ownerName: 'Paula Andrade',
    reason: 'Desparasitación',
    doctorId: 'staff-1',
    doctorName: 'Dra. María Torres',
    status: 'cancelled',
  },
  {
    id: 'apt-7',
    dayOffset: 1,
    time: '10:30',
    patientName: 'Luna',
    ownerName: 'Carolina Ríos',
    reason: 'Control post vacuna',
    doctorId: 'staff-3',
    doctorName: 'Dra. Lucía Páez',
    status: 'pending',
  },
  {
    id: 'apt-8',
    dayOffset: 1,
    time: '15:00',
    patientName: 'Coco',
    ownerName: 'Paula Andrade',
    reason: 'Consulta general',
    doctorId: 'staff-2',
    doctorName: 'Dr. Andrés Vela',
    status: 'confirmed',
  },
]

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

function toAppointment({ dayOffset, ...appointment }: AppointmentSeed, today: Date): Appointment {
  return { ...appointment, date: toIsoDate(addDays(today, dayOffset)) }
}

function filterAppointments({ search, filters }: AppointmentListQuery): Appointment[] {
  const today = startOfToday()
  const agendaDate = toIsoDate(parseAgendaDate(filters.date, today))

  return APPOINTMENTS.map((seed) => toAppointment(seed, today))
    .filter(
      (appointment) =>
        appointment.date === agendaDate &&
        matchesSearch(search, [appointment.patientName, appointment.ownerName]) &&
        (!filters.status || appointment.status === filters.status) &&
        (!filters.doctor || appointment.doctorId === filters.doctor),
    )
    .sort((first, second) => first.time.localeCompare(second.time))
}

export function resolveAppointmentsAgenda({ date }: AppointmentsAgendaQuery): Promise<AppointmentsAgenda> {
  return Promise.resolve().then(() => {
    const today = startOfToday()
    const agendaDate = parseAgendaDate(date, today)

    return {
      dayLabel: formatDayLabel(agendaDate, today),
      previousDate: toIsoDate(addDays(agendaDate, -1)),
      nextDate: toIsoDate(addDays(agendaDate, 1)),
      doctors: DOCTORS,
    }
  })
}

export function resolveAppointmentsList(query: AppointmentListQuery): Promise<ListPage<Appointment>> {
  return Promise.resolve().then(() => paginateRows(filterAppointments(query), query))
}
