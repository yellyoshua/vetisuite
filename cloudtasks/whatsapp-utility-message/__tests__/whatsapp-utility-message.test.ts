import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { eq, sql } from '@vetisuite/database/orm.js'
import { db } from '@vetisuite/database/db.js'
import { organizationsTable, whatsappAccountsTable, whatsappMessagesTable } from '@vetisuite/database/schemas'
import { encryptAccessToken } from '@vetisuite/whatsapp/token-vault.js'
import whatsappUtilityMessage from '../whatsapp-utility-message'

const ORGANIZATION = '552e8400-e29b-41d4-a716-446655440001'
const MESSAGE = 'cc2e8400-e29b-41d4-a716-446655440001'

const DETAIL = {
  organization: ORGANIZATION,
  message: MESSAGE,
  to: '+593991234567',
  template: 'appointment_reminder',
  language: 'es',
  parameters: { client_name: 'Carla', pet_name: 'Luna', clinic_name: 'Clínica Norte', date: '12 de octubre', time: '10:30' },
}

function record(detail: object = DETAIL, messageId = 'sqs-1') {
  return { messageId, body: JSON.stringify({ requestId: 'req-1', type: 'whatsapp-utility-message', detail }) }
}

function metaReplies(...replies: { status?: number; body: unknown }[]) {
  const fetchMock = vi.fn()

  replies.forEach(({ status = 200, body }) => fetchMock.mockResolvedValueOnce(new Response(JSON.stringify(body), { status })))
  vi.stubGlobal('fetch', fetchMock)

  return fetchMock
}

async function messageRow() {
  const [row] = await db.select().from(whatsappMessagesTable).where(eq(whatsappMessagesTable.id, MESSAGE))

  return row!
}

async function accountRow() {
  const [row] = await db.select().from(whatsappAccountsTable).where(eq(whatsappAccountsTable.organization, ORGANIZATION))

  return row!
}

beforeEach(async () => {
  await db.execute(sql`truncate table whatsapp_messages, whatsapp_accounts, organizations cascade`)
  await db.insert(organizationsTable).values({ id: ORGANIZATION, name: 'Clínica Norte', slug: 'clinica-norte' })
  await db.insert(whatsappAccountsTable).values({
    organization: ORGANIZATION,
    wabaId: '9001',
    phoneNumberId: '8001',
    displayPhoneNumber: '+593 99 111 1111',
    verifiedName: 'Clínica Norte',
    accessToken: encryptAccessToken('token-clinica'),
    consentAcceptedAt: new Date(),
  })
  await db.insert(whatsappMessagesTable).values({ id: MESSAGE, organization: ORGANIZATION, direction: 'outbound', status: 'queued', phone: DETAIL.to, template: DETAIL.template })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('whatsapp-utility-message', () => {
  it('envía la plantilla con el token de la clínica y guarda el wamid', async () => {
    const fetchMock = metaReplies({ body: { messages: [{ id: 'wamid.OK', message_status: 'accepted' }] } })

    const result = await whatsappUtilityMessage({ Records: [record()] })
    const [url, init] = fetchMock.mock.calls[0] as [URL, RequestInit]

    expect(result.batchItemFailures).toEqual([])
    expect(url.pathname).toContain('/8001/messages')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer token-clinica')
    expect(JSON.parse(String(init.body)).template.name).toBe('appointment_reminder')
    expect(await messageRow()).toMatchObject({ status: 'sent', wamid: 'wamid.OK' })
  })

  it('un mensaje que ya no está en cola no se vuelve a enviar (entrega repetida de SQS)', async () => {
    await db.update(whatsappMessagesTable).set({ status: 'sent', wamid: 'wamid.PREVIO' }).where(eq(whatsappMessagesTable.id, MESSAGE))

    const fetchMock = metaReplies()
    const result = await whatsappUtilityMessage({ Records: [record()] })

    expect(result.batchItemFailures).toEqual([])
    expect(fetchMock).not.toHaveBeenCalled()
    expect((await messageRow()).wamid).toBe('wamid.PREVIO')
  })

  it('un error transitorio de Meta devuelve el registro a SQS y deja el mensaje en cola', async () => {
    metaReplies({ status: 429, body: { error: { code: 130429, message: 'throughput' } } })

    const result = await whatsappUtilityMessage({ Records: [record(DETAIL, 'sqs-9')] })

    expect(result.batchItemFailures).toEqual([{ itemIdentifier: 'sqs-9' }])
    expect((await messageRow()).status).toBe('queued')
  })

  it('un error permanente marca el mensaje fallido y no se reintenta', async () => {
    metaReplies({ status: 400, body: { error: { code: 131026, message: 'x', error_data: { details: 'No está en WhatsApp' } } } })

    const result = await whatsappUtilityMessage({ Records: [record()] })

    expect(result.batchItemFailures).toEqual([])
    expect(await messageRow()).toMatchObject({ status: 'failed', errorCode: 131026, errorMessage: 'No está en WhatsApp' })
    expect((await accountRow()).status).toBe('active')
  })

  it('un token vencido falla el mensaje y pide reconectar la cuenta', async () => {
    metaReplies({ status: 401, body: { error: { code: 190, message: 'expired' } } })

    await whatsappUtilityMessage({ Records: [record()] })

    expect((await messageRow()).status).toBe('failed')
    expect((await accountRow()).status).toBe('reauth_required')
  })

  it('sin cuenta activa el mensaje falla sin llamar a Meta', async () => {
    await db.update(whatsappAccountsTable).set({ status: 'reauth_required' })

    const fetchMock = metaReplies()

    await whatsappUtilityMessage({ Records: [record()] })

    expect(fetchMock).not.toHaveBeenCalled()
    expect(await messageRow()).toMatchObject({ status: 'failed', errorMessage: 'account_unavailable' })
  })

  it('un payload incompleto falla solo ese registro del lote', async () => {
    metaReplies({ body: { messages: [{ id: 'wamid.OK' }] } })

    const result = await whatsappUtilityMessage({ Records: [record({ organization: ORGANIZATION }, 'sqs-malo'), record(DETAIL, 'sqs-bueno')] })

    expect(result.batchItemFailures).toEqual([{ itemIdentifier: 'sqs-malo' }])
    expect((await messageRow()).status).toBe('sent')
  })
})
