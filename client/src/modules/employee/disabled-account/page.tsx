import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import DisabledAccount from '@/components/DisabledAccount/DisabledAccount'
import resolvers from './resolvers'

export default function Page() {
  const { error, isLoading } = useResolver(resolvers)

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return <PageError message={error} />
  }

  return <DisabledAccount />
}
