import { BILLING_DOCUMENT_KIND_VALUES, BILLING_STATUS_VALUES } from '@/constants/billing'

export type BillingStatus = (typeof BILLING_STATUS_VALUES)[number]

export type BillingDocumentKind = (typeof BILLING_DOCUMENT_KIND_VALUES)[number]

export type BillingDocument = {
  id: string
  clientName: string
  kind: BillingDocumentKind
  number: number | string
  chargeCount: number
  total: number
  createdAt: string
  dueDate: string | null
  paidAt: string | null
  status: BillingStatus
}

export type BillingPreset = 'open-account' | 'overdue' | 'paid-today'
