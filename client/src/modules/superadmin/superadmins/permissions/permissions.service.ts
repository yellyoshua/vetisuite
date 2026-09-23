import service from '@/core/service'

export type AccountPermissions = {
  id: string
  firstName: string
  lastName: string
  user: {
    id: string
    email: string
    role: string
  }
  permissions: string[]
}

export default service('superadmins-permissions')
