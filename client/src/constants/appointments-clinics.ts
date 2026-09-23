import type { BadgeTone } from '@/constants/badge-tones'

export const WEEKDAY_VALUES = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const

export const WEEKDAY_LABELS: Record<(typeof WEEKDAY_VALUES)[number], string> = {
  monday: 'Lunes',
  tuesday: 'Martes',
  wednesday: 'Miércoles',
  thursday: 'Jueves',
  friday: 'Viernes',
  saturday: 'Sábado',
  sunday: 'Domingo',
}

export const COPY_MONDAY_TARGETS: readonly (typeof WEEKDAY_VALUES)[number][] = ['tuesday', 'wednesday', 'thursday', 'friday']

export const MAX_BLOCKS_PER_DAY = 3

export const NEW_BLOCK_MINUTES = 60

export const LATEST_BLOCK_END = '23:59'

export const TIME_BLOCK_TAGS = ['mañana', 'tarde', 'extra'] as const

export const ESTIMATE_SLOT_MINUTES = 30

export const BOOKING_RULE_VALUES = [
  'appointmentDuration',
  'bufferTime',
  'minimumNotice',
  'bookingWindow',
  'timeZone',
] as const

export const BOOKING_RULE_LABELS: Record<(typeof BOOKING_RULE_VALUES)[number], string> = {
  appointmentDuration: 'Duración de la cita',
  bufferTime: 'Margen entre citas',
  minimumNotice: 'Anticipación mínima',
  bookingWindow: 'Se puede reservar hasta',
  timeZone: 'Zona horaria',
}

export const BOOKING_RULE_OPTIONS = {
  appointmentDuration: ['20 minutos', '30 minutos', '45 minutos'],
  bufferTime: ['Sin margen', '10 minutos', '15 minutos'],
  minimumNotice: ['Sin mínimo', '2 horas', '12 horas', '24 horas'],
  bookingWindow: ['15 días', '30 días', '60 días'],
  timeZone: ['America/Guayaquil', 'America/Bogota'],
} as const satisfies Record<(typeof BOOKING_RULE_VALUES)[number], readonly string[]>

export const BOOKING_TOGGLE_VALUES = ['portalBooking', 'autoConfirm'] as const

export const BOOKING_TOGGLE_LABELS: Record<(typeof BOOKING_TOGGLE_VALUES)[number], string> = {
  portalBooking: 'Reservas desde el portal',
  autoConfirm: 'Confirmar automáticamente',
}

export const BOOKING_TOGGLE_HINTS: Record<(typeof BOOKING_TOGGLE_VALUES)[number], string> = {
  portalBooking: 'Los clientes pueden pedir cita en el portal de la clínica.',
  autoConfirm: 'Sin esto, cada reserva entra como pendiente en la agenda de Recepción.',
}

type ScheduleExceptionKind = 'closed' | 'reduced-hours'

export const SCHEDULE_EXCEPTION_KIND_TONES: Record<ScheduleExceptionKind, BadgeTone> = {
  closed: 'red',
  'reduced-hours': 'amber',
}
