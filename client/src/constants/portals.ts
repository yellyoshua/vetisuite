import type { BadgeTone } from '@/components/legacy-ui/Badge'

export const PORTAL_TYPE_VALUES = ['institutional', 'booking', 'campaign'] as const

export const PORTAL_TYPE_LABELS: Record<(typeof PORTAL_TYPE_VALUES)[number], string> = {
  institutional: 'Institucional',
  booking: 'Agenda',
  campaign: 'Campaña',
}

export const PORTAL_STATUS_VALUES = ['active', 'draft'] as const

export const PORTAL_STATUS_LABELS: Record<(typeof PORTAL_STATUS_VALUES)[number], string> = {
  active: 'activo',
  draft: 'borrador',
}

export const PORTAL_STATUS_TONES: Record<(typeof PORTAL_STATUS_VALUES)[number], BadgeTone> = {
  active: 'green',
  draft: 'gray',
}
