import type { BadgeTone } from '@/constants/badge-tones'

export const PORTAL_PURPOSE_VALUES = ['booking', 'capture'] as const
export const PORTAL_TYPE_VALUES = PORTAL_PURPOSE_VALUES

export const PORTAL_PURPOSE_LABELS: Record<(typeof PORTAL_PURPOSE_VALUES)[number], string> = {
  booking: 'Reserva',
  capture: 'Captación',
}
export const PORTAL_TYPE_LABELS = PORTAL_PURPOSE_LABELS

export const PORTAL_STATUS_VALUES = ['published', 'draft'] as const

export const PORTAL_STATUS_LABELS: Record<(typeof PORTAL_STATUS_VALUES)[number], string> = {
  published: 'publicado',
  draft: 'borrador',
}

export const PORTAL_STATUS_TONES: Record<(typeof PORTAL_STATUS_VALUES)[number], BadgeTone> = {
  published: 'green',
  draft: 'gray',
}
