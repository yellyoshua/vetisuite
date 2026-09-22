import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import resolvers from './resolvers'
import ChangePassword from './components/ChangePassword'

export default function Page() {
  const { error, isLoading } = useResolver(resolvers)

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return <PageError message={error} />
  }

  return <ChangePassword />
}
