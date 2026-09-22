import { useEffect, useRef, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router'
import { exchangeCode } from '@/modules/oauth/oauth.service'
import { useSessionStore, type SessionProfile } from '@/stores/session.store'

type ClaimStatus = 'claiming' | 'claimed' | 'failed'

type SetSession = (session: { profile: SessionProfile }) => void

export default function OauthCallback() {
  const [searchParams] = useSearchParams()
  const setSession = useSessionStore((state) => state.setSession)
  const [status, setStatus] = useState<ClaimStatus>('claiming')
  const claiming = useRef(false)
  const code = searchParams.get('code')

  useEffect(() => {
    if (claiming.current) {
      return
    }

    claiming.current = true

    claimSession(code, setSession).then(setStatus)
  }, [code, setSession])

  if (status === 'claimed') {
    return <Navigate to="/" replace />
  }

  if (status === 'failed') {
    return <Navigate to="/sign-in" replace />
  }

  return <p role="status">Iniciando sesión…</p>
}

async function claimSession(code: string | null, setSession: SetSession): Promise<ClaimStatus> {
  if (!code) {
    return 'failed'
  }

  try {
    setSession(await exchangeCode(code))

    return 'claimed'
  } catch {
    return 'failed'
  }
}
