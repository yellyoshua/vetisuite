import type { Params } from 'react-router'
import type { ResolverSearch } from '@/hooks/use-resolver'
import clientsService from '@/modules/employee/clients/clients.service'
import type { Client } from '@/modules/employee/clients/clients.schema'
import clientsPatientsService from '@/modules/employee/clients/patients/clients-patients.service'
import type { Patient } from '@/modules/employee/clients/patients/patients.schema'

export default {
  client: async (params: Readonly<Params>) => {
    const client = await clientsService.getOne<Client>({ id: params.clientId })

    if (!client) {
      throw new Error('No se encontró el cliente')
    }

    return client
  },
  patients: (params: Readonly<Params>, search: ResolverSearch) => clientsPatientsService.get<Patient[]>({ client: params.clientId, search: search.search, page: search.page }),
}
