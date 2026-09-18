import type { Role } from '@/constants/roles'
import type { Permission } from './permissions'

export type PermissionsConfig = {
  roles: Record<Role, Permission[]>
}

export function definePermissions(_config: PermissionsConfig): PermissionsConfig {
  throw new Error('Not implemented: definePermissions')
}
