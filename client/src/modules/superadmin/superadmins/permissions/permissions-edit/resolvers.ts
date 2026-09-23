import type { Params } from 'react-router'
import permissionsService, { type AccountPermissions } from '@/modules/superadmin/superadmins/permissions/permissions.service'

export default {
  superadmin: (params: Readonly<Params>) => permissionsService.get<AccountPermissions>({ id: params.superadminId }),
}
