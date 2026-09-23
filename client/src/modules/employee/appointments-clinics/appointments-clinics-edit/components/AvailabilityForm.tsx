import { CheckIcon, InfoIcon, RotateCcwIcon } from 'lucide-react'
import useForm from '@/hooks/use-form'
import CustomPage from '@/components/CustomPage/CustomPage'
import Form from '@/components/form/Form'
import { Button } from '@/components/ui/button'
import {
  clinicAvailabilitySchema,
  type ClinicAvailability,
  type ClinicAvailabilityInput,
  type ScheduleException,
} from '@/modules/employee/appointments-clinics/appointments-clinics.schema'
import { saveClinicAvailability } from '../resolvers'
import BookableServicesCard from './BookableServicesCard'
import BookingRulesCard from './BookingRulesCard'
import ScheduleExceptionsCard from './ScheduleExceptionsCard'
import WeeklyScheduleCard from './WeeklyScheduleCard'

type AvailabilityFormProps = {
  availability: ClinicAvailability
  exceptions: ScheduleException[]
  refetchAvailability: () => void
  refetchExceptions: () => void
}

const FORM_ID = 'clinic-availability-form'

function toFormValues(availability: ClinicAvailability): ClinicAvailabilityInput {
  return {
    id: availability.id,
    days: availability.days as ClinicAvailabilityInput['days'],
    bookingRules: availability.bookingRules as ClinicAvailabilityInput['bookingRules'],
    bookingToggles: availability.bookingToggles,
    services: availability.services.map((service) => ({
      id: service.id,
      isPortalVisible: service.isPortalVisible,
    })),
  }
}

export default function AvailabilityForm({ availability, exceptions, refetchAvailability, refetchExceptions }: AvailabilityFormProps) {
  const values = toFormValues(availability)
  const form = useForm<ClinicAvailabilityInput>(values, {
    schema: clinicAvailabilitySchema,
    onSubmit: (body) => saveClinicAvailability(body),
    successMessage: 'Cambios guardados',
    onSuccess: () => refetchAvailability(),
  })

  return (
    <CustomPage
      title="Disponibilidad de la clínica"
      description="Horario semanal, duración y márgenes, reglas de reserva y excepciones por fecha. Define lo que el portal ofrece como horas libres."
      actions={
        <>
          <Button type="reset" form={FORM_ID} variant="ghost" disabled={form.isSubmitting}>
            <RotateCcwIcon /> Descartar
          </Button>
          <Button type="submit" form={FORM_ID} disabled={form.isSubmitting}>
            <CheckIcon /> Guardar cambios
          </Button>
        </>
      }
    >
      <Form
        id={FORM_ID}
        onSubmit={form.handleSubmit}
        onReset={(event) => {
          event.preventDefault()
          form.reset(values)
        }}
        className="flex flex-col gap-3.5"
      >
        <WeeklyScheduleCard form={form} initialDays={values.days} />
        <BookingRulesCard control={form.control} />
        <BookableServicesCard form={form} services={availability.services} />
        <ScheduleExceptionsCard exceptions={exceptions} refetch={refetchExceptions} />
        {form.error?.message && (
          <p role="alert" className="rounded-card border border-red bg-red-soft px-4 py-3 text-xs text-red">
            {form.error.message}
          </p>
        )}
        <div className="sticky bottom-0 flex flex-wrap items-center gap-3 rounded-card border border-line bg-card px-4 py-3">
          <p className="flex items-center gap-[7px] text-xs text-sub">
            <InfoIcon className="size-3.5" aria-hidden="true" />
            Los cambios afectan a la agenda de Recepción y al portal de reservas.
          </p>
          <div className="ml-auto flex items-center gap-2">
            <Button type="reset" variant="ghost" size="sm" disabled={form.isSubmitting}>
              Descartar
            </Button>
            <Button type="submit" size="sm" disabled={form.isSubmitting}>
              <CheckIcon /> Guardar cambios
            </Button>
          </div>
        </div>
      </Form>
    </CustomPage>
  )
}
