import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import resolvers from './resolvers'
import SuperadminEdit from './components/SuperadminEdit'

export default function Page() {
  const { data, error, isLoading } = useResolver(resolvers)

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return <PageError message={error} />
  }

  if (!data.superadmin) {
    return <PageLoading />
  }

  return <SuperadminEdit superadmin={data.superadmin} />
}
