import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import resolvers from './resolvers'
import AvailabilityForm from './components/AvailabilityForm'

export default function Page() {
  const { data, error, isLoading, refetch } = useResolver(resolvers)

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return <PageError message={error} />
  }

  if (!data.availability || !data.exceptions) {
    return <PageLoading />
  }

  return (
    <AvailabilityForm
      availability={data.availability}
      exceptions={data.exceptions}
      refetchAvailability={() => refetch('availability')}
      refetchExceptions={() => refetch('exceptions')}
    />
  )
}
