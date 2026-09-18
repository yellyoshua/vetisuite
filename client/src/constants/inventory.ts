import type { BadgeTone } from '@/components/ui/Badge'

export const PRODUCT_CATEGORY_VALUES = ['vaccines', 'medicines', 'supplies', 'food', 'grooming'] as const

export const PRODUCT_CATEGORY_LABELS: Record<(typeof PRODUCT_CATEGORY_VALUES)[number], string> = {
  vaccines: 'Vacunas',
  medicines: 'Medicamentos',
  supplies: 'Insumos',
  food: 'Alimentos',
  grooming: 'Estética',
}

export const PRODUCT_STATUS_VALUES = ['available', 'expiring', 'low-stock', 'expired'] as const

export const PRODUCT_STATUS_LABELS: Record<(typeof PRODUCT_STATUS_VALUES)[number], string> = {
  available: 'disponible',
  expiring: 'por caducar',
  'low-stock': 'stock bajo',
  expired: 'vencido',
}

export const PRODUCT_STATUS_TONES: Record<(typeof PRODUCT_STATUS_VALUES)[number], BadgeTone> = {
  available: 'green',
  expiring: 'amber',
  'low-stock': 'red',
  expired: 'red',
}

export const EXPIRY_STATUS_VALUES = ['valid', 'expiring', 'expired'] as const

export const EXPIRY_STATUS_LABELS: Record<(typeof EXPIRY_STATUS_VALUES)[number], string> = {
  valid: 'vigente',
  expiring: 'por caducar',
  expired: 'vencido',
}

export const EXPIRY_STATUS_TONES: Record<(typeof EXPIRY_STATUS_VALUES)[number], BadgeTone> = {
  valid: 'green',
  expiring: 'amber',
  expired: 'red',
}

export const MOVEMENT_TYPE_VALUES = ['in', 'out', 'write-off'] as const

export const MOVEMENT_TYPE_LABELS: Record<(typeof MOVEMENT_TYPE_VALUES)[number], string> = {
  in: 'entrada',
  out: 'salida',
  'write-off': 'baja',
}

export const MOVEMENT_TYPE_TONES: Record<(typeof MOVEMENT_TYPE_VALUES)[number], BadgeTone> = {
  in: 'green',
  out: 'amber',
  'write-off': 'red',
}

export const MOVEMENT_TYPE_SIGNS: Record<(typeof MOVEMENT_TYPE_VALUES)[number], string> = {
  in: '+',
  out: '−',
  'write-off': '−',
}
