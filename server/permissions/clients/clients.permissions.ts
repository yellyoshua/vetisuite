import type { AuthContext } from '@/core/auth-core'

export function canListClients(_auth: AuthContext): boolean {
  throw new Error('Not implemented: canListClients')
}

export function canCreateClient(_auth: AuthContext): boolean {
  throw new Error('Not implemented: canCreateClient')
}

export function canRegisterPatient(_auth: AuthContext): boolean {
  throw new Error('Not implemented: canRegisterPatient')
}
