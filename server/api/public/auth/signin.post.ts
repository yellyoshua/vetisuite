import { z } from 'zod'
import type { SignInResult } from '@/core/auth-core'
import { defineRoute } from '@/core/base-route'

const signInSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
})

export default defineRoute(signInSchema, (_context): Promise<SignInResult> => {
  throw new Error('Not implemented: POST /api/public/auth/signin')
})
