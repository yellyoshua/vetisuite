import loadEnv from './env'
import { and, eq } from '@vetisuite/database/orm.js'
import { db } from '@vetisuite/database/db.js'
import { whatsappAccountsTable, whatsappMessagesTable } from '@vetisuite/database/schemas'
import { describeError, sendUtilityTemplate } from '@vetisuite/whatsapp/whatsapp.js'
import { z } from 'zod'
import { baseSqsHandler, type SqsRecord } from '@/utils/base-sqs-handler'
import { log } from '@/utils/logger'

const ACCOUNT_UNAVAILABLE = 'account_unavailable'

const MESSAGE_SCHEMA = z.object({
  requestId: z.string().optional(),
  detail: z.object({
    organization: z.uuid(),
    message: z.uuid(),
    to: z.string(),
    template: z.string(),
    language: z.string(),
    parameters: z.record(z.string(), z.string()),
  }),
})

loadEnv()

async function markFailed(messageId: string, errorCode: number | null, errorMessage: string): Promise<void> {
  await db
    .update(whatsappMessagesTable)
    .set({ status: 'failed', errorCode, errorMessage, updatedAt: new Date() })
    .where(and(eq(whatsappMessagesTable.id, messageId), eq(whatsappMessagesTable.status, 'queued')))
}

// SQS entrega al menos una vez: solo se procesa un mensaje que sigue en cola. Un error transitorio
// de Meta se relanza para que SQS reentregue; uno permanente deja el mensaje fallido y no se reintenta.
async function sendMessage(record: SqsRecord): Promise<void> {
  const { requestId, detail } = MESSAGE_SCHEMA.parse(JSON.parse(record.body))
  const [message] = await db
    .select({ status: whatsappMessagesTable.status })
    .from(whatsappMessagesTable)
    .where(and(eq(whatsappMessagesTable.id, detail.message), eq(whatsappMessagesTable.organization, detail.organization)))
    .limit(1)

  if (message?.status !== 'queued') {
    log('info', 'whatsapp.message.skipped', { requestId: requestId ?? null, whatsappMessage: detail.message })

    return
  }

  const [account] = await db
    .select({ phoneNumberId: whatsappAccountsTable.phoneNumberId, accessToken: whatsappAccountsTable.accessToken })
    .from(whatsappAccountsTable)
    .where(and(eq(whatsappAccountsTable.organization, detail.organization), eq(whatsappAccountsTable.status, 'active')))
    .limit(1)

  if (!account) {
    await markFailed(detail.message, null, ACCOUNT_UNAVAILABLE)

    return
  }

  try {
    const { messageId } = await sendUtilityTemplate({
      encryptedAccessToken: account.accessToken,
      phoneNumberId: account.phoneNumberId,
      to: detail.to,
      template: detail.template,
      language: detail.language,
      parameters: detail.parameters,
    })

    await db
      .update(whatsappMessagesTable)
      .set({ status: 'sent', wamid: messageId, sentAt: new Date(), updatedAt: new Date() })
      .where(and(eq(whatsappMessagesTable.id, detail.message), eq(whatsappMessagesTable.status, 'queued')))
  } catch (error) {
    const failure = describeError(error)

    if (failure.isRetryable) {
      throw error
    }

    if (failure.requiresReauth) {
      await db
        .update(whatsappAccountsTable)
        .set({ status: 'reauth_required', updatedAt: new Date() })
        .where(eq(whatsappAccountsTable.organization, detail.organization))
    }

    log('warn', 'whatsapp.message.rejected', { requestId: requestId ?? null, whatsappMessage: detail.message, code: failure.code })
    await markFailed(detail.message, failure.code, failure.message)
  }
}

export { sendMessage }

export default baseSqsHandler(sendMessage)
