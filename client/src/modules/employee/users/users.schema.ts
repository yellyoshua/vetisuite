import { USER_ROLE_VALUES, USER_STATUS_VALUES } from '@/constants/users'
import type { ListQuery } from '@/hooks/use-list-query'

export type UserRole = (typeof USER_ROLE_VALUES)[number]

export type UserStatus = (typeof USER_STATUS_VALUES)[number]

export type User = {
  id: string
  name: string
  email: string
  role: UserRole
  moduleNames: string[]
  lastAccessAt: string
  status: UserStatus
}

export type UserListRow = User & {
  lastAccessLabel: string
}

export type UserFilterKey = 'role' | 'status'

export type UserListQuery = ListQuery<UserFilterKey>
