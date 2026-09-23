import type { BadgeTone } from '@/constants/badge-tones'

export const CLINIC_RECORD_STATUS_VALUES = ['in-progress', 'requested', 'result'] as const

export const CLINIC_RECORD_STATUS_LABELS: Record<(typeof CLINIC_RECORD_STATUS_VALUES)[number], string> = {
  'in-progress': 'en proceso',
  requested: 'solicitado',
  result: 'resultado',
}

export const CLINIC_RECORD_STATUS_TONES: Record<(typeof CLINIC_RECORD_STATUS_VALUES)[number], BadgeTone> = {
  'in-progress': 'blue',
  requested: 'amber',
  result: 'green',
}
