import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import resolvers from './resolvers'
import Clients from './components/Clients'

export default function Page() {
  const { data, error, isLoading } = useResolver(resolvers)

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return <PageError message={error} />
  }

  if (!data.clients) {
    return <PageLoading />
  }

  return <Clients clients={data.clients} />
}
