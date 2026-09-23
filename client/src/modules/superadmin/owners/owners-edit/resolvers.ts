import type { Params } from 'react-router'
import ownersService from '@/modules/superadmin/owners/owners.service'
import type { Owner } from '@/modules/superadmin/owners/owners.schema'

export default {
  owner: async (params: Readonly<Params>) => {
    const owner = await ownersService.getOne<Owner>({ id: params.ownerId })

    if (!owner) {
      throw new Error('No se encontró el dueño')
    }

    return owner
  },
}
