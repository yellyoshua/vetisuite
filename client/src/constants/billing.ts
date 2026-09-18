import type { BadgeTone } from '@/components/ui/Badge'

export const BILLING_STATUS_VALUES = ['open', 'receivable', 'paid'] as const

export const BILLING_STATUS_LABELS: Record<(typeof BILLING_STATUS_VALUES)[number], string> = {
  open: 'abierta',
  receivable: 'por cobrar',
  paid: 'pagada',
}

export const BILLING_STATUS_TONES: Record<(typeof BILLING_STATUS_VALUES)[number], BadgeTone> = {
  open: 'amber',
  receivable: 'red',
  paid: 'green',
}

export const BILLING_DOCUMENT_KIND_VALUES = ['account', 'invoice'] as const

export const BILLING_DOCUMENT_KIND_LABELS: Record<(typeof BILLING_DOCUMENT_KIND_VALUES)[number], string> = {
  account: 'Cuenta',
  invoice: 'Factura',
}
