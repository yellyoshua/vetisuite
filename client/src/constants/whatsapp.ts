import type { BadgeTone } from '@/constants/badge-tones'

export const WHATSAPP_RANGE_VALUES = ['7', '14', '30'] as const

export const WHATSAPP_RANGE_OPTIONS = WHATSAPP_RANGE_VALUES.map((value) => ({ value, label: `Últimos ${value} días` }))

export const WHATSAPP_ACCOUNT_STATUS_VALUES = ['active', 'reauth_required'] as const

export const WHATSAPP_ACCOUNT_STATUS_LABELS: Record<(typeof WHATSAPP_ACCOUNT_STATUS_VALUES)[number], string> = {
  active: 'Conectado',
  reauth_required: 'Reconexión necesaria',
}

export const WHATSAPP_ACCOUNT_STATUS_TONES: Record<(typeof WHATSAPP_ACCOUNT_STATUS_VALUES)[number], BadgeTone> = {
  active: 'primary',
  reauth_required: 'danger',
}

export const WHATSAPP_TEMPLATE_LABELS: Record<string, string> = {
  appointment_reminder: 'Recordatorio de cita',
  vaccine_due_reminder: 'Vacuna próxima a vencer',
}

export const WHATSAPP_TEMPLATE_STATUS_VALUES = ['pending', 'approved', 'rejected', 'paused', 'disabled'] as const

export const WHATSAPP_TEMPLATE_STATUS_LABELS: Record<(typeof WHATSAPP_TEMPLATE_STATUS_VALUES)[number], string> = {
  pending: 'En revisión',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  paused: 'Pausada',
  disabled: 'Deshabilitada',
}

export const WHATSAPP_TEMPLATE_STATUS_TONES: Record<(typeof WHATSAPP_TEMPLATE_STATUS_VALUES)[number], BadgeTone> = {
  pending: 'warning',
  approved: 'primary',
  rejected: 'danger',
  paused: 'warning',
  disabled: 'neutral',
}

export const WHATSAPP_TEMPLATE_CATEGORY_VALUES = ['utility', 'marketing', 'authentication'] as const

export const WHATSAPP_TEMPLATE_CATEGORY_LABELS: Record<(typeof WHATSAPP_TEMPLATE_CATEGORY_VALUES)[number], string> = {
  utility: 'Utility',
  marketing: 'Marketing',
  authentication: 'Autenticación',
}

export const WHATSAPP_MESSAGE_STATUS_VALUES = ['queued', 'sent', 'delivered', 'read', 'failed'] as const

export const WHATSAPP_MESSAGE_STATUS_LABELS: Record<(typeof WHATSAPP_MESSAGE_STATUS_VALUES)[number], string> = {
  queued: 'En cola',
  sent: 'Enviado',
  delivered: 'Entregado',
  read: 'Leído',
  failed: 'Fallido',
}

export const WHATSAPP_MESSAGE_STATUS_TONES: Record<(typeof WHATSAPP_MESSAGE_STATUS_VALUES)[number], BadgeTone> = {
  queued: 'neutral',
  sent: 'info',
  delivered: 'primary',
  read: 'primary',
  failed: 'danger',
}

export const WHATSAPP_MESSAGE_DIRECTION_LABELS = { outbound: 'Enviado', inbound: 'Recibido' } as const
