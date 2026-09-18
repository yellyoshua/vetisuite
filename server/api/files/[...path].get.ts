import { z } from 'zod'
import { defineRoute } from '@/core/base-route'

const filePathSchema = z.object({
  path: z.string().min(1),
})

export default defineRoute(filePathSchema, (_context): Promise<Response> => {
  throw new Error('Not implemented: GET /api/files/**')
})
