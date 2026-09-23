import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import resolvers from './resolvers'
import LaboratoryOverview from './components/LaboratoryOverview'

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

  return <LaboratoryOverview summary={data.summary} />
}
