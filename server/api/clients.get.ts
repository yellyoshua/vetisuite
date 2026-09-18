import { defineRoute } from '@/core/base-route'
import type { ListResult } from '@/core/repository'
import type { ClientRow } from '@/modules/clients/clients.repository'
import { clientListQuerySchema } from '@/modules/clients/clients.schema'

export default defineRoute(clientListQuerySchema, (_context): Promise<ListResult<ClientRow>> => {
  throw new Error('Not implemented: GET /api/clients')
})
