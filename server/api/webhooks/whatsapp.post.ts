import { z } from 'zod'
import { defineRoute } from '@/core/base-route'

const whatsappEventSchema = z.object({
  object: z.string().min(1),
  entry: z.array(z.object({ id: z.string().min(1) })),
})

export default defineRoute(whatsappEventSchema, (_context): Promise<{ isAcknowledged: boolean }> => {
  throw new Error('Not implemented: POST /api/webhooks/whatsapp')
})
