import type { AuthContext } from '@/core/auth-core'

export type PermissionAction = 'read' | 'create' | 'update'

export type Permission = `${string}:${PermissionAction}`

export function canPerform(_auth: AuthContext, _permission: Permission): boolean {
  throw new Error('Not implemented: canPerform')
}
