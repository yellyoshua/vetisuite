import { useEffect } from 'react'
import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import { landingDomain } from '@/lib/environment'
import resolvers from './resolvers'

const SIGNUP_URL = `${landingDomain}/?modal=signup`

export default function Page() {
  const { error } = useResolver(resolvers)

  useEffect(() => {
    window.location.href = SIGNUP_URL
  }, [])

  if (error) {
    return <PageError message={error} />
  }

  return <PageLoading />
}
