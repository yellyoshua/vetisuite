import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import resolvers from './resolvers'
import Owners from './components/Owners'

export default function Page() {
  const { data, error, isLoading, refetch } = useResolver(resolvers)

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return <PageError message={error} />
  }

  if (!data.owners) {
    return <PageLoading />
  }

  return <Owners owners={data.owners} refetch={() => refetch()} />
}
