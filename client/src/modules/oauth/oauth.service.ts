import service from '@/core/service'
import type { SessionProfile } from '@/stores/session.store'

type TokenResponse = {
  expires_in: number
  profile: SessionProfile
}

const tokenService = service('oauth/vetisuite/token')

export function exchangeCode(code: string) {
  return tokenService.post<TokenResponse>({ grant_type: 'authorization_code', code })
}
