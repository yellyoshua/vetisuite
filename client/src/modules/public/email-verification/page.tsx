import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import resolvers from './resolvers'
import EmailVerification from './components/EmailVerification'

export default function Page() {
  const { data, error, isLoading } = useResolver(resolvers)

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return <PageError message={error} />
  }

  if (!data.verification) {
    return <PageLoading />
  }

  return <EmailVerification verification={data.verification} />
}
