import type { Client, ClientInput } from './clients.schema'

export type ClientListQuery = {
  search?: string
  page?: number
  pageSize?: number
}

export type ClientListPage = {
  clients: Client[]
  total: number
  page: number
}

const clientsService = {
  list(_query: ClientListQuery): Promise<ClientListPage> {
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
