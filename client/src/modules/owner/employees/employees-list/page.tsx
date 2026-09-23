import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import resolvers from './resolvers'
import Employees from './components/Employees'

export default function Page() {
  const { data, error, isLoading, refetch } = useResolver(resolvers)

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return <PageError message={error} />
  }

  if (!data.employees) {
    return <PageLoading />
  }

  return <Employees employees={data.employees} refetch={() => refetch()} />
}
