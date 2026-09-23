import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import resolvers from './resolvers'
import Appointments from './components/Appointments'

export default function Page() {
  const { data, error, isLoading } = useResolver(resolvers)

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return <PageError message={error} />
  }

  if (!data.agenda || !data.appointments) {
    return <PageLoading />
  }

  return <Appointments agenda={data.agenda} appointments={data.appointments} />
}
