import type { AuthContext } from '@/core/auth-core'
import type { ListResult } from '@/core/repository'
import type { ClientRow } from './clients.repository'
import type { ClientCreateInput, ClientListQuery } from './clients.schema'

type ClientsService = {
  list(auth: AuthContext, query: ClientListQuery): Promise<ListResult<ClientRow>>
  create(auth: AuthContext, input: ClientCreateInput): Promise<ClientRow>
}

const clientsService: ClientsService = {
  list() {
    throw new Error('Not implemented: clientsService.list')
  },

  create() {
    throw new Error('Not implemented: clientsService.create')
  },
}

export default clientsService
