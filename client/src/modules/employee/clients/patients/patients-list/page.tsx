import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import resolvers from './resolvers'
import Patients from './components/Patients'

export default function Page() {
  const { data, error, isLoading } = useResolver(resolvers)

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return <PageError message={error} />
  }

  if (!data.client || !data.patients) {
    return <PageLoading />
  }

  return <Patients client={data.client} patients={data.patients} />
}
