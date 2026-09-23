import type { Params } from 'react-router'
import type { ResolverSearch } from '@/hooks/use-resolver'
import clientsService from '@/modules/employee/clients/clients.service'
import clientsCountService from '@/modules/employee/clients/clients-count.service'
import type { Client } from '@/modules/employee/clients/clients.schema'

export default {
  clients: async (_params: Readonly<Params>, search: ResolverSearch) => {
    const [clients] = await Promise.all([
      clientsService.get<Client[]>({ search: search.search, page: search.page }),
      clientsCountService.get<{ value: number }>({ search: search.search }),
    ])

    return clients
  },
}
