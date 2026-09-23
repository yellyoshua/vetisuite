import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import resolvers from './resolvers'
import SuperadminPermissionsEdit from './components/SuperadminPermissionsEdit'

export default function Page() {
  const { data, error, isLoading, refetch } = useResolver(resolvers)

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return <PageError message={error} />
  }

  if (!data.superadmin) {
    return <PageLoading />
  }

  return <SuperadminPermissionsEdit superadmin={data.superadmin} refetch={() => refetch()} />
}
