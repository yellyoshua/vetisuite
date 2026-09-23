import type { Params } from 'react-router'
import permissionsService, { type AccountPermissions } from '@/modules/superadmin/owners/permissions/permissions.service'

export default {
  owner: (params: Readonly<Params>) => permissionsService.get<AccountPermissions>({ id: params.ownerId }),
}
