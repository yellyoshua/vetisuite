import type { Params } from 'react-router'
import clientsService from '@/modules/employee/clients/clients.service'
import type { Client } from '@/modules/employee/clients/clients.schema'

export default {
  client: async (params: Readonly<Params>) => {
    const client = await clientsService.getOne<Client>({ id: params.clientId })

    if (!client) {
      throw new Error('No se encontró el cliente')
    }

    return client
  },
}
