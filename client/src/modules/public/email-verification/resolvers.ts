import type { Params } from 'react-router'
import type { ResolverSearch } from '@/hooks/use-resolver'
import emailVerificationService from './email-verification.service'

export type Verification =
  | { status: 'success' }
  | { status: 'error', message: string }

type VerificationFailure = {
  error?: string
  message?: string
}

const INVALID_LINK = 'El enlace de verificación no es válido.'

const verifications = new Map<string, Promise<Verification>>()

export default {
  verification: (_params: Readonly<Params>, search: ResolverSearch) => verify(search.token),
}

function verify(token: unknown): Promise<Verification> {
  if (!token) {
    return Promise.resolve({ status: 'error', message: INVALID_LINK })
  }

  const key = String(token)

  if (!verifications.has(key)) {
    verifications.set(key, confirmEmail(key))
  }

  return verifications.get(key) as Promise<Verification>
}

async function confirmEmail(token: string): Promise<Verification> {
  try {
    await emailVerificationService.post({ token })

    return { status: 'success' }
  } catch (reason) {
    const failure = reason as VerificationFailure

    return { status: 'error', message: failure.error || failure.message || INVALID_LINK }
  }
}
