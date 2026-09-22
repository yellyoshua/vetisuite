import service from '@/core/service'

export type ProfileSession = {
  id: string
  userAgent: string | null
  createdAt: string
  expiresAt: string
  isCurrent: boolean
}

export default service('profile-sessions')
