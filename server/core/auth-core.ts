import type { H3Event } from 'nitro'
import type { Role } from '@/constants/roles'

export type AuthContext = {
  userId: string
  clinicId: string
  role: Role
  isAuthenticated: boolean
}

export type SignInResult = {
  accessToken: string
  expiresAt: string
}

export type OAuthTokenResult = {
  accessToken: string
  tokenType: 'Bearer'
  expiresIn: number
}

export function resolveAuthContext(_event: H3Event): Promise<AuthContext | null> {
  throw new Error('Not implemented: resolveAuthContext')
}

export function requireAuthContext(_event: H3Event): AuthContext {
  throw new Error('Not implemented: requireAuthContext')
}
