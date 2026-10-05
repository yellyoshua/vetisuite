import type {
  WHATSAPP_ACCOUNT_STATUS_VALUES,
  WHATSAPP_MESSAGE_STATUS_VALUES,
  WHATSAPP_TEMPLATE_CATEGORY_VALUES,
  WHATSAPP_TEMPLATE_STATUS_VALUES,
} from '@/constants/whatsapp'

export type WhatsappAccount = {
  id: string
  displayPhoneNumber: string
  verifiedName: string
  status: (typeof WHATSAPP_ACCOUNT_STATUS_VALUES)[number]
  createdAt: string
}

export type WhatsappTemplate = {
  name: string
  language: string
  category: (typeof WHATSAPP_TEMPLATE_CATEGORY_VALUES)[number]
  status: (typeof WHATSAPP_TEMPLATE_STATUS_VALUES)[number]
  rejectedReason: string | null
  updatedAt: string
}

export type WhatsappMessage = {
  id: string
  direction: 'outbound' | 'inbound'
  status: (typeof WHATSAPP_MESSAGE_STATUS_VALUES)[number]
  phone: string
  template: string | null
  errorCode: number | null
  errorMessage: string | null
  createdAt: string
  client: { name: string } | null
}

export type WhatsappAnalytics = {
  days: number
  totals: {
    queued: number
    sent: number
    delivered: number
    read: number
    failed: number
    received: number
    sentFromApp: number
  }
  daily: { date: string; sent: number; received: number }[]
}

export type WhatsappConnectionInput = {
  code: string
  wabaId: string
  phoneNumberId?: string
  consentAccepted: true
}
