import useResolver from '@/hooks/use-resolver'
import { PageError, PageLoading } from '@/components/PageState/PageState'
import resolvers from './resolvers'
import WhatsappOverview from './components/WhatsappOverview'

export default function Page() {
  const { data, error, isLoading, refetch } = useResolver(resolvers)

  if (isLoading) {
    return <PageLoading />
  }

  if (error) {
    return <PageError message={error} />
  }

  if (data.account === undefined || !data.analytics || !data.templates || !data.messages) {
    return <PageLoading />
  }

  return (
    <WhatsappOverview
      account={data.account}
      analytics={data.analytics}
      templates={data.templates}
      messages={data.messages}
      refetch={() => refetch()}
    />
  )
}
