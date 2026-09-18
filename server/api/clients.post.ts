import { defineRoute } from '@/core/base-route'
import type { ClientRow } from '@/modules/clients/clients.repository'
import { clientCreateSchema } from '@/modules/clients/clients.schema'

export default defineRoute(clientCreateSchema, (_context): Promise<ClientRow> => {
  throw new Error('Not implemented: POST /api/clients')
})
