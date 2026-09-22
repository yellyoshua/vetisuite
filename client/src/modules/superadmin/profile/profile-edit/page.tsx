import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import resolvers from './resolvers'
import ProfileEdit from './components/ProfileEdit'

export default function Page() {
  const { data, error, isLoading, refetch } = useResolver(resolvers)

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return <PageError message={error} />
  }

  if (!data.profile) {
    return <PageLoading />
  }

  return <ProfileEdit profile={data.profile} refetch={() => refetch()} />
}
