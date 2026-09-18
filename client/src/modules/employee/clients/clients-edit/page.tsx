import { useNavigate, useParams } from 'react-router'
import ErrorState from '@/components/ErrorState'
import LoadingState from '@/components/LoadingState'
import PageHeader from '@/components/PageHeader'
import useMutation from '@/hooks/use-mutation'
import useResolver from '@/hooks/use-resolver'
import ClientForm from '../components/ClientForm'
import { resolveClientEdit, updateClient } from './resolvers'

export default function ClientsEditPage() {
  const { clientId = '' } = useParams()
  const navigate = useNavigate()
  const { data, error, isLoading } = useResolver(resolveClientEdit, { clientId })
  const [isSaving, saveClient, saveError] = useMutation(updateClient, {
    onSuccess: () => navigate('/clients'),
  })

  return (
    <>
      <PageHeader title="Editar cliente" description="Actualiza los datos de contacto del dueño." />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data && (
        <ClientForm
          key={data.id}
          client={data}
          isSubmitting={isSaving}
          submitError={saveError}
          onSubmit={(input) => saveClient({ clientId, input })}
        />
      )}
    </>
  )
}
