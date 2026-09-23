import type { Params } from 'react-router'
import superadminsService from '@/modules/superadmin/superadmins/superadmins.service'
import type { Superadmin } from '@/modules/superadmin/superadmins/superadmins.schema'

export default {
  superadmin: async (params: Readonly<Params>) => {
    const superadmin = await superadminsService.getOne<Superadmin>({ id: params.superadminId })

    if (!superadmin) {
      throw new Error('No se encontró el super admin')
    }

    return superadmin
  },
}
