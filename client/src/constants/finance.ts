import type { DonutTone } from '@/components/DonutChart'

export const FINANCE_PERIOD_VALUES = ['month', 'quarter', 'year', 'custom'] as const

export const FINANCE_PERIOD_LABELS: Record<(typeof FINANCE_PERIOD_VALUES)[number], string> = {
  month: 'Mes en curso',
  quarter: 'Trimestre',
  year: 'Año',
  custom: 'Personalizado',
}

export const FINANCE_COMPARISON_VALUES = ['none', 'previous-month', 'previous-year'] as const

export const FINANCE_COMPARISON_LABELS: Record<(typeof FINANCE_COMPARISON_VALUES)[number], string> = {
  none: 'Sin comparación',
  'previous-month': 'Comparar con mes anterior',
  'previous-year': 'Comparar con el año pasado',
}

export const FINANCE_PAYMENT_METHOD_VALUES = ['cash', 'card', 'transfer'] as const

export const FINANCE_PAYMENT_METHOD_LABELS: Record<(typeof FINANCE_PAYMENT_METHOD_VALUES)[number], string> = {
  cash: 'Efectivo',
  card: 'Tarjeta',
  transfer: 'Transferencia',
}

export const FINANCE_PAYMENT_METHOD_TONES: Record<(typeof FINANCE_PAYMENT_METHOD_VALUES)[number], DonutTone> = {
  cash: 'green',
  card: 'blue',
  transfer: 'amber',
}

export const FINANCE_TREND_VALUES = ['up', 'down'] as const

export const FINANCE_TREND_CLASS_NAMES: Record<(typeof FINANCE_TREND_VALUES)[number], string> = {
  up: 'text-green',
  down: 'text-red',
}
