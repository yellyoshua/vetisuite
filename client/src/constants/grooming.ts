import type { BadgeTone } from '@/constants/badge-tones'

export const GROOMING_STATUS_VALUES = ['pending', 'in-progress', 'finished', 'delivered'] as const

export const GROOMING_STATUS_LABELS: Record<(typeof GROOMING_STATUS_VALUES)[number], string> = {
  pending: 'pendiente',
  'in-progress': 'proceso',
  finished: 'terminado',
  delivered: 'entregado',
}

export const GROOMING_STATUS_TONES: Record<(typeof GROOMING_STATUS_VALUES)[number], BadgeTone> = {
  pending: 'amber',
  'in-progress': 'blue',
  finished: 'green',
  delivered: 'gray',
}
