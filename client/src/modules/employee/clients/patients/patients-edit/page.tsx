import { useNavigate, useParams } from 'react-router'
import ErrorState from '@/components/ErrorState'
import LoadingState from '@/components/LoadingState'
import PageHeader from '@/components/PageHeader'
import useMutation from '@/hooks/use-mutation'
import useResolver from '@/hooks/use-resolver'
import PatientForm from '../components/PatientForm'
import { resolvePatientEdit, updatePatient } from './resolvers'

export default function PatientsEditPage() {
  const { clientId = '', patientId = '' } = useParams()
  const navigate = useNavigate()
  const { data, error, isLoading } = useResolver(resolvePatientEdit, { clientId, patientId })
  const [isSaving, savePatient, saveError] = useMutation(updatePatient, {
    onSuccess: () => navigate(`/clients/${clientId}/patients`),
  })

  return (
    <>
      <PageHeader title="Editar mascota" description="Actualiza los datos y las alertas clínicas de la mascota." />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data && (
        <PatientForm
          key={data.patient.id}
          owner={data.owner}
          patient={data.patient}
          isSubmitting={isSaving}
          submitError={saveError}
          onSubmit={(draft) => savePatient({ clientId, patientId, draft })}
        />
      )}
    </>
  )
}
