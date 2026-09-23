import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import resolvers from './resolvers'
import AdministrationOverview from './components/AdministrationOverview'

export default function Page() {
  const { data, error, isLoading } = useResolver(resolvers)

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return <PageError message={error} />
  }

  if (!data.summary) {
    return <PageLoading />
  }

  return <AdministrationOverview summary={data.summary} />
}
