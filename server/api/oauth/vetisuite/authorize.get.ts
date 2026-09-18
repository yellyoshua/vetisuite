import { z } from 'zod'
import { defineRoute } from '@/core/base-route'

const authorizeQuerySchema = z.object({
  responseType: z.literal('code'),
  clientId: z.string().min(1),
  redirectUri: z.url(),
  state: z.string().min(1).optional(),
})

export default defineRoute(authorizeQuerySchema, (_context): Promise<Response> => {
  throw new Error('Not implemented: GET /api/oauth/vetisuite/authorize')
})
