import { z } from 'zod'
import { defineRoute } from '@/core/base-route'

const stripeEventSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
})

export default defineRoute(stripeEventSchema, (_context): Promise<{ isAcknowledged: boolean }> => {
  throw new Error('Not implemented: POST /api/webhooks/payments/stripe')
})
