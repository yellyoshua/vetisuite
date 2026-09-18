import type { ClientListPage, ClientListQuery } from './clients.service'

export default function resolveClientsPage(_query: ClientListQuery): Promise<ClientListPage> {
  throw new Error('Not implemented: resolveClientsPage')
}
