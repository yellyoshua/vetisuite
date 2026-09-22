import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import { Button } from '@/components/ui/button'
import resolvers from './resolvers'
import Sessions from './components/Sessions'

export default function Page() {
  const { data, error, isLoading, refetch } = useResolver(resolvers)

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return (
      <div className="space-y-4">
        <PageError message={error} />
        <Button type="button" variant="outline" className="cursor-pointer" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    )
  }

  if (!data.sessions) {
    return <PageLoading />
  }

  return <Sessions sessions={data.sessions} refetch={() => refetch()} />
}
