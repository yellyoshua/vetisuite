import { z } from 'zod'
import type { OAuthTokenResult } from '@/core/auth-core'
import { defineRoute } from '@/core/base-route'

const tokenSchema = z.object({
  grantType: z.literal('authorization_code'),
  code: z.string().min(1),
  clientId: z.string().min(1),
  redirectUri: z.url(),
})

export default defineRoute(tokenSchema, (_context): Promise<OAuthTokenResult> => {
  throw new Error('Not implemented: POST /api/oauth/vetisuite/token')
})
