export const ROLES = ['superadmin', 'owner', 'employee', 'public'] as const

export type Role = (typeof ROLES)[number]
