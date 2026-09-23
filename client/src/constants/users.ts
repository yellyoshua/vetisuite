import type { BadgeTone } from '@/constants/badge-tones'

export const USER_ROLE_VALUES = ['admin', 'veterinarian', 'groomer', 'reception'] as const

export const USER_ROLE_LABELS: Record<(typeof USER_ROLE_VALUES)[number], string> = {
  admin: 'Administrador',
  veterinarian: 'Veterinario',
  groomer: 'Estilista',
  reception: 'Recepción',
}

export const USER_STATUS_VALUES = ['active', 'suspended'] as const

export const USER_STATUS_LABELS: Record<(typeof USER_STATUS_VALUES)[number], string> = {
  active: 'activo',
  suspended: 'suspendido',
}

export const USER_STATUS_TONES: Record<(typeof USER_STATUS_VALUES)[number], BadgeTone> = {
  active: 'green',
  suspended: 'gray',
}
