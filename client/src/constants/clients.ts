import type { BadgeTone } from '@/components/ui/Badge'

export const PATIENT_SPECIES_VALUES = ['dog', 'cat', 'bird', 'other'] as const

export const PATIENT_SPECIES_LABELS: Record<(typeof PATIENT_SPECIES_VALUES)[number], string> = {
  dog: 'Perro',
  cat: 'Gato',
  bird: 'Ave',
  other: 'Otro',
}

export const PATIENT_SPECIES = PATIENT_SPECIES_VALUES.map((value) => ({
  value,
  label: PATIENT_SPECIES_LABELS[value],
}))

export const CLIENT_STATUS_VALUES = ['active', 'inactive'] as const

export const CLIENT_STATUS_LABELS: Record<(typeof CLIENT_STATUS_VALUES)[number], string> = {
  active: 'activo',
  inactive: 'inactivo',
}

export const CLIENT_STATUS_TONES: Record<(typeof CLIENT_STATUS_VALUES)[number], BadgeTone> = {
  active: 'green',
  inactive: 'gray',
}
