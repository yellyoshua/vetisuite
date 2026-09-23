import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import resolvers from './resolvers'
import OwnerPermissionsEdit from './components/OwnerPermissionsEdit'

export default function Page() {
  const { data, error, isLoading, refetch } = useResolver(resolvers)

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return <PageError message={error} />
  }

  if (!data.owner) {
    return <PageLoading />
  }

  return <OwnerPermissionsEdit owner={data.owner} refetch={() => refetch()} />
}
