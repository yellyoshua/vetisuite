import { useNavigate } from 'react-router'
import PageHeader from '@/components/PageHeader'
import useMutation from '@/hooks/legacy/use-mutation'
import ClientForm from '../components/ClientForm'
import { createClient } from './resolvers'

export default function ClientsCreatePage() {
  const navigate = useNavigate()
  const [isSaving, saveClient, saveError] = useMutation(createClient, {
    onSuccess: () => navigate('/clients'),
  })

  return (
    <>
      <PageHeader title="Nuevo cliente" description="Registra al dueño; después podrás añadir sus mascotas desde su ficha." />
      <ClientForm isSubmitting={isSaving} submitError={saveError} onSubmit={saveClient} />
    </>
  )
}
