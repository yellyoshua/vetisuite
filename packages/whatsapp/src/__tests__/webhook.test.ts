import { createHmac } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { parseWebhook, verifyWebhookSignature } from '../webhook'

const metadata = { display_phone_number: '5215512345678', phone_number_id: 'phone-1' }

function sign(rawBody: string, secret = 'app-secret') {
  return `sha256=${createHmac('sha256', secret).update(rawBody).digest('hex')}`
}

describe('verifyWebhookSignature', () => {
  const rawBody = '{"entry":[]}'

  it('acepta la firma calculada con el app secret', () => {
    expect(verifyWebhookSignature({ rawBody, signature: sign(rawBody) })).toBe(true)
  })

  it('rechaza una firma de otro secreto, un cuerpo alterado y la ausencia de firma', () => {
    expect(verifyWebhookSignature({ rawBody, signature: sign(rawBody, 'otro') })).toBe(false)
    expect(verifyWebhookSignature({ rawBody: '{"entry":[1]}', signature: sign(rawBody) })).toBe(false)
    expect(verifyWebhookSignature({ rawBody, signature: undefined })).toBe(false)
    expect(verifyWebhookSignature({ rawBody, signature: 'sha256=zz' })).toBe(false)
  })
})

describe('parseWebhook', () => {
  it('normaliza estados de entrega con su error y facturación', () => {
    const events = parseWebhook({
      entry: [{
        id: 'waba-1',
        changes: [{
          field: 'messages',
          value: {
            metadata,
            statuses: [
              { id: 'wamid.1', status: 'delivered', timestamp: '1760000000', pricing: { billable: true } },
              { id: 'wamid.2', status: 'failed', timestamp: '1760000001', errors: [{ code: 131026, title: 'Undeliverable', error_data: { details: 'No está en WhatsApp' } }] },
              { id: 'wamid.3', status: 'deleted', timestamp: '1760000002' },
            ],
          },
        }],
      }],
    })

    expect(events).toEqual([
      { type: 'status', phoneNumberId: 'phone-1', messageId: 'wamid.1', status: 'delivered', at: new Date(1760000000000), isBillable: true, errorCode: null, errorMessage: null },
      { type: 'status', phoneNumberId: 'phone-1', messageId: 'wamid.2', status: 'failed', at: new Date(1760000001000), isBillable: null, errorCode: 131026, errorMessage: 'No está en WhatsApp' },
    ])
  })

  it('un mensaje entrante conserva quién y cuándo, nunca el contenido', () => {
    const [event] = parseWebhook({
      entry: [{
        id: 'waba-1',
        changes: [{ field: 'messages', value: { metadata, messages: [{ id: 'wamid.9', from: '5215598765432', timestamp: '1760000100', type: 'text', text: { body: 'secreto' } }] } }],
      }],
    })

    expect(event).toEqual({ type: 'inbound', phoneNumberId: 'phone-1', messageId: 'wamid.9', from: '+5215598765432', at: new Date(1760000100000) })
  })

  it('normaliza estado de plantilla, recategorización aplicada y desconexión', () => {
    const template = { message_template_name: 'appointment_reminder', message_template_language: 'es_MX' }
    const events = parseWebhook({
      entry: [{
        id: 'waba-1',
        changes: [
          { field: 'message_template_status_update', value: { ...template, event: 'REJECTED', reason: 'INVALID_FORMAT' } },
          { field: 'template_category_update', value: { ...template, previous_category: 'UTILITY', new_category: 'MARKETING' } },
          { field: 'template_category_update', value: { ...template, new_category: 'UTILITY', correct_category: 'MARKETING' } },
          { field: 'account_update', value: { event: 'PARTNER_REMOVED' } },
          { field: 'account_update', value: { event: 'PARTNER_ADDED' } },
        ],
      }],
    })

    expect(events).toEqual([
      { type: 'template-status', wabaId: 'waba-1', name: 'appointment_reminder', language: 'es_MX', status: 'rejected', reason: 'INVALID_FORMAT' },
      { type: 'template-category', wabaId: 'waba-1', name: 'appointment_reminder', language: 'es_MX', category: 'marketing' },
      { type: 'disconnected', wabaId: 'waba-1' },
    ])
  })

  it('cuenta los mensajes enviados desde la app de WhatsApp Business (coexistencia)', () => {
    const [event] = parseWebhook({
      entry: [{ id: 'waba-1', changes: [{ field: 'smb_message_echoes', value: { metadata, message_echoes: [{ id: 'wamid.5', to: '5215511111111', timestamp: '1760000200' }] } }] }],
    })

    expect(event).toEqual({ type: 'echo', phoneNumberId: 'phone-1', messageId: 'wamid.5', to: '+5215511111111', at: new Date(1760000200000) })
  })

  it('ignora campos que no usa', () => {
    expect(parseWebhook({ entry: [{ id: 'waba-1', changes: [{ field: 'history', value: {} }] }] })).toEqual([])
    expect(parseWebhook({})).toEqual([])
  })
})
