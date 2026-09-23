import type { Params } from 'react-router'
import permissionsService, { type AccountPermissions } from '@/modules/owner/employees/permissions/permissions.service'

export default {
  employee: (params: Readonly<Params>) => permissionsService.get<AccountPermissions>({ id: params.employeeId }),
}
