import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import resolvers from './resolvers'
import RecoveryPassword from './components/RecoveryPassword'

export default function Page() {
  const { data, error, isLoading } = useResolver(resolvers)

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return <PageError message={error} />
  }

  return <RecoveryPassword token={data.token ?? ''} />
}
