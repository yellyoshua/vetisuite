import { useId } from 'react'
import ErrorState from '@/components/ErrorState'
import LoadingState from '@/components/LoadingState'
import PageHeader from '@/components/PageHeader'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import useResolver from '@/hooks/use-resolver'
import AvailabilityForm from './components/AvailabilityForm'
import { resolveClinicAvailability } from './resolvers'

export default function AppointmentsClinicsEditPage() {
  const formId = useId()
  const { data, error, isLoading } = useResolver(resolveClinicAvailability, {})

  return (
    <>
      <PageHeader
        title="Disponibilidad de la clínica"
        description="Horario semanal, duración y márgenes, reglas de reserva y excepciones por fecha. Define lo que el portal ofrece como horas libres."
        actions={
          <>
            <Button type="reset" form={formId} variant="ghost" isDisabled={!data}>
              <Icon name="rotate-ccw" size={14} /> Descartar
            </Button>
            <Button type="submit" form={formId} isDisabled={!data}>
              <Icon name="check" size={14} /> Guardar cambios
            </Button>
          </>
        }
      />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data && <AvailabilityForm formId={formId} availability={data} />}
    </>
  )
}
