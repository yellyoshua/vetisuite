import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import type { VisitScope } from '@/modules/employee/visits/visits.schema'
import resolvers from './resolvers'
import Visits from './components/Visits'

type PageProps = {
  scope: VisitScope
}

export default function Page({ scope }: PageProps) {
  const { data, error, isLoading, refetch } = useResolver(resolvers)

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return <PageError message={error} />
  }

  if (!data.visits) {
    return <PageLoading />
  }

  return <Visits scope={scope} visits={data.visits} refetch={() => refetch()} />
}
