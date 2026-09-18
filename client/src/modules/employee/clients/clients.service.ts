import type { ListPage } from '@/hooks/use-list-query'
import type { Client, ClientInput, ClientListQuery } from './clients.schema'

const clientsService = {
  list(_query: ClientListQuery): Promise<ListPage<Client>> {
    throw new Error('Not implemented: clientsService.list')
  },
  get(_clientId: string): Promise<Client> {
    throw new Error('Not implemented: clientsService.get')
  },
  create(_input: ClientInput): Promise<Client> {
    throw new Error('Not implemented: clientsService.create')
  },
  update(_clientId: string, _input: ClientInput): Promise<Client> {
    throw new Error('Not implemented: clientsService.update')
  },
}

export default clientsService
