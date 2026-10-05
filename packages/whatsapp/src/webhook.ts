import { createHmac, timingSafeEqual } from 'node:crypto'
import { appConfig } from './graph'
import { toTemplateCategory, toTemplateStatus } from './templates'

const SIGNATURE_PREFIX = 'sha256='

const DISCONNECT_EVENTS = new Set(['PARTNER_REMOVED', 'ACCOUNT_OFFBOARDED', 'ACCOUNT_DELETED'])

type Metadata = { phone_number_id: string }

type MessageStatus = {
  id: string
  status: string
  timestamp: string
  pricing?: { billable: boolean }
  errors?: { code: number; title?: string; message?: string; error_data?: { details?: string } }[]
}

type MessageValue = {
  metadata: Metadata
  statuses?: MessageStatus[]
  messages?: { id: string; from: string; timestamp: string }[]
}

type EchoValue = {
  metadata: Metadata
  message_echoes?: { id: string; to: string; timestamp: string }[]
}

type TemplateValue = {
  event?: string
  reason?: string
  previous_category?: string
  new_category?: string
  message_template_name: string
  message_template_language: string
}

type AccountValue = {
  event: string
}

type Change = {
  field: string
  value: MessageValue & EchoValue & TemplateValue & AccountValue
}

type Payload = {
  entry?: { id: string; changes?: Change[] }[]
}

const STATUS_NAMES = new Set(['sent', 'delivered', 'read', 'failed'])

function toDate(timestamp: string): Date {
  return new Date(Number(timestamp) * 1000)
}

function statusEvents(value: MessageValue) {
  return (value.statuses || [])
    .filter((status) => STATUS_NAMES.has(status.status))
    .map((status) => ({
      type: 'status' as const,
      phoneNumberId: value.metadata.phone_number_id,
      messageId: status.id,
      status: status.status as 'sent' | 'delivered' | 'read' | 'failed',
      at: toDate(status.timestamp),
      isBillable: status.pricing?.billable ?? null,
      errorCode: status.errors?.[0]?.code ?? null,
      errorMessage: status.errors?.[0]?.error_data?.details || status.errors?.[0]?.title || null,
    }))
}

// Del mensaje entrante solo se conserva que llegó (quién y cuándo), nunca su contenido.
function inboundEvents(value: MessageValue) {
  return (value.messages || []).map((message) => ({
    type: 'inbound' as const,
    phoneNumberId: value.metadata.phone_number_id,
    messageId: message.id,
    from: `+${message.from}`,
    at: toDate(message.timestamp),
  }))
}

function echoEvents(value: EchoValue) {
  return (value.message_echoes || []).map((echo) => ({
    type: 'echo' as const,
    phoneNumberId: value.metadata.phone_number_id,
    messageId: echo.id,
    to: `+${echo.to}`,
    at: toDate(echo.timestamp),
  }))
}

function templateEvents(wabaId: string, change: Change) {
  const { value } = change
  const template = { wabaId, name: value.message_template_name, language: value.message_template_language }

  if (change.field === 'message_template_status_update') {
    return [{ type: 'template-status' as const, ...template, status: toTemplateStatus(value.event || ''), reason: value.reason && value.reason !== 'NONE' ? value.reason : null }]
  }

  // Un aviso de recategorización pendiente no trae previous_category: solo cuenta la ya aplicada.
  if (value.previous_category && value.new_category) {
    return [{ type: 'template-category' as const, ...template, category: toTemplateCategory(value.new_category) }]
  }

  return []
}

type WebhookEvent =
  | ReturnType<typeof statusEvents>[number]
  | ReturnType<typeof inboundEvents>[number]
  | ReturnType<typeof echoEvents>[number]
  | ReturnType<typeof templateEvents>[number]
  | { type: 'disconnected'; wabaId: string }

function changeEvents(wabaId: string, change: Change): WebhookEvent[] {
  if (change.field === 'messages') {
    return [...statusEvents(change.value), ...inboundEvents(change.value)]
  }

  if (change.field === 'smb_message_echoes') {
    return echoEvents(change.value)
  }

  if (change.field === 'message_template_status_update' || change.field === 'template_category_update') {
    return templateEvents(wabaId, change)
  }

  if (change.field === 'account_update' && DISCONNECT_EVENTS.has(change.value.event)) {
    return [{ type: 'disconnected' as const, wabaId }]
  }

  return []
}

export function verifyWebhookSignature({ rawBody, signature }: { rawBody: string; signature: string | undefined }): boolean {
  if (!signature?.startsWith(SIGNATURE_PREFIX)) {
    return false
  }

  const expected = createHmac('sha256', appConfig().appSecret).update(rawBody).digest()
  const received = Buffer.from(signature.slice(SIGNATURE_PREFIX.length), 'hex')

  return received.length === expected.length && timingSafeEqual(received, expected)
}

// Un POST de Meta trae hasta 1000 cambios de cualquier cliente: devolverlos ya normalizados evita
// que server/ conozca el formato del payload. Lo que no interesa se descarta.
export function parseWebhook(payload: unknown): WebhookEvent[] {
  const { entry = [] } = payload as Payload

  return entry.flatMap((item) => (item.changes || []).flatMap((change) => changeEvents(item.id, change)))
}
