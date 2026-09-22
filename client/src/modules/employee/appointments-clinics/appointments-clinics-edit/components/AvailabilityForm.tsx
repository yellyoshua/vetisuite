import type { FormEvent } from 'react'
import Button from '@/components/legacy-ui/Button'
import Icon from '@/components/legacy-ui/Icon'
import { DELETE_SCHEDULE_EXCEPTION_MODAL, DELETE_SCHEDULE_EXCEPTION_PARAMS } from '@/constants/modals'
import useModalQuery from '@/hooks/use-modal-query'
import useMutation from '@/hooks/legacy/use-mutation'
import type { ClinicAvailability } from '../../appointments-clinics.schema'
import { saveClinicAvailability } from '../resolvers'
import useAvailabilityDraft from '../use-availability-draft'
import BookableServicesCard from './BookableServicesCard'
import BookingRulesCard from './BookingRulesCard'
import ScheduleExceptionsCard from './ScheduleExceptionsCard'
import WeeklyScheduleCard from './WeeklyScheduleCard'

type AvailabilityFormProps = {
  formId: string
  availability: ClinicAvailability
}

export default function AvailabilityForm({ formId, availability }: AvailabilityFormProps) {
  const { draft, isSaved, weeklySummary, dispatch } = useAvailabilityDraft(availability)
  const deleteExceptionModal = useModalQuery(DELETE_SCHEDULE_EXCEPTION_MODAL, DELETE_SCHEDULE_EXCEPTION_PARAMS)
  const [isSaving, saveAvailability, saveError] = useMutation(saveClinicAvailability, {
    onSuccess: (savedAvailability) => dispatch({ type: 'commit', availability: savedAvailability }),
  })

  function submitAvailability(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    saveAvailability(draft)
  }

  function discardChanges(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    dispatch({ type: 'discard' })
  }

  return (
    <form id={formId} onSubmit={submitAvailability} onReset={discardChanges} className="flex flex-col gap-3.5">
      <WeeklyScheduleCard days={draft.days} weeklySummary={weeklySummary} dispatch={dispatch} />
      <BookingRulesCard bookingRules={draft.bookingRules} bookingToggles={draft.bookingToggles} dispatch={dispatch} />
      <BookableServicesCard services={draft.services} dispatch={dispatch} />
      <ScheduleExceptionsCard key={deleteExceptionModal.isOpen ? 'deleting' : 'idle'} />
      <div className="sticky bottom-0 flex flex-wrap items-center gap-3 rounded-card border border-line bg-card px-4 py-3">
        <p className="flex items-center gap-[7px] text-xs text-sub">
          <Icon name="info" size={14} />
          Los cambios afectan a la agenda de Recepción y al portal de reservas.
        </p>
        <p role="status" className="text-xs font-semibold text-green">
          {isSaved && 'Cambios guardados'}
        </p>
        {saveError && (
          <p role="alert" className="text-xs text-red">
            {saveError.message}
          </p>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Button type="reset" variant="ghost" size="sm" isDisabled={isSaving}>
            Descartar
          </Button>
          <Button type="submit" size="sm" isDisabled={isSaving}>
            <Icon name="check" size={13} /> Guardar cambios
          </Button>
        </div>
      </div>
    </form>
  )
}
