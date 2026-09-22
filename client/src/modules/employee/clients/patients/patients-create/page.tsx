import { useNavigate, useParams } from 'react-router'
import ErrorState from '@/components/ErrorState'
import LoadingState from '@/components/LoadingState'
import PageHeader from '@/components/PageHeader'
import useMutation from '@/hooks/legacy/use-mutation'
import useResolver from '@/hooks/legacy/use-resolver'
import PatientForm from '../components/PatientForm'
import { createPatient, resolvePatientOwner } from './resolvers'

export default function PatientsCreatePage() {
  const { clientId = '' } = useParams()
  const navigate = useNavigate()
  const { data, error, isLoading } = useResolver(resolvePatientOwner, { clientId })
  const [isSaving, savePatient, saveError] = useMutation(createPatient, {
    onSuccess: () => navigate(`/clients/${clientId}/patients`),
  })

  return (
    <>
      <PageHeader title="Nueva mascota" description="Registra una mascota y sus alertas clínicas para este dueño." />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data && (
        <PatientForm
          owner={data}
          isSubmitting={isSaving}
          submitError={saveError}
          onSubmit={(draft) => savePatient({ clientId, draft })}
        />
      )}
    </>
  )
}
