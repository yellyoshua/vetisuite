import type { BadgeTone } from '@/components/legacy-ui/Badge'

export const APPOINTMENT_STATUS_VALUES = ['pending', 'confirmed', 'completed', 'cancelled'] as const

export const APPOINTMENT_STATUS_LABELS: Record<(typeof APPOINTMENT_STATUS_VALUES)[number], string> = {
  pending: 'pendiente',
  confirmed: 'confirmada',
  completed: 'completada',
  cancelled: 'cancelada',
}

export const APPOINTMENT_STATUS_TONES: Record<(typeof APPOINTMENT_STATUS_VALUES)[number], BadgeTone> = {
  pending: 'amber',
  confirmed: 'green',
  completed: 'blue',
  cancelled: 'gray',
}
