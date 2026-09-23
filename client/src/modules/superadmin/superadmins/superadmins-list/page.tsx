import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import resolvers from './resolvers'
import Superadmins from './components/Superadmins'

export default function Page() {
  const { data, error, isLoading, refetch } = useResolver(resolvers)

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return <PageError message={error} />
  }

  if (!data.superadmins) {
    return <PageLoading />
  }

  return <Superadmins superadmins={data.superadmins} refetch={() => refetch()} />
}
