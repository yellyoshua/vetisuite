import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import resolvers from './resolvers'
import EmployeePermissionsEdit from './components/EmployeePermissionsEdit'

export default function Page() {
  const { data, error, isLoading, refetch } = useResolver(resolvers)

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return <PageError message={error} />
  }

  if (!data.employee) {
    return <PageLoading />
  }

  return <EmployeePermissionsEdit employee={data.employee} refetch={() => refetch()} />
}
