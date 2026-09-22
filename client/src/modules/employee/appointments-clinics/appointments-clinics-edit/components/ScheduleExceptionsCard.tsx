import EmptyState from '@/components/EmptyState'
import ErrorState from '@/components/ErrorState'
import LoadingState from '@/components/LoadingState'
import Badge from '@/components/legacy-ui/Badge'
import Button from '@/components/legacy-ui/Button'
import Card from '@/components/legacy-ui/Card'
import Icon from '@/components/legacy-ui/Icon'
import { SCHEDULE_EXCEPTION_KIND_TONES } from '@/constants/appointments-clinics'
import { DELETE_SCHEDULE_EXCEPTION_MODAL, DELETE_SCHEDULE_EXCEPTION_PARAMS } from '@/constants/modals'
import useModalQuery from '@/hooks/use-modal-query'
import useResolver from '@/hooks/legacy/use-resolver'
import { formatDate } from '@/lib/format-date'
import type { ScheduleException } from '../../appointments-clinics.schema'
import { resolveScheduleExceptions } from '../resolvers'
import SectionHeading from './SectionHeading'

function describeExceptionHours(exception: ScheduleException): string {
  if (exception.kind === 'closed') {
    return 'cerrado'
  }

  return `${exception.hours.from} a ${exception.hours.to}`
}

export default function ScheduleExceptionsCard() {
  const { openModal } = useModalQuery(DELETE_SCHEDULE_EXCEPTION_MODAL, DELETE_SCHEDULE_EXCEPTION_PARAMS)
  const { data: exceptions, error, isLoading } = useResolver(resolveScheduleExceptions, {})

  return (
    <Card className="p-5">
      <SectionHeading
        title="Excepciones por fecha"
        description="Feriados y jornadas especiales. Pisan al horario semanal en esa fecha."
        actions={
          <Button variant="ghost" size="sm" isDisabled>
            <Icon name="plus" size={13} /> Añadir excepción
          </Button>
        }
      />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {exceptions?.length === 0 && (
        <EmptyState title="Sin excepciones" hint="Todos los días rige el horario semanal." />
      )}
      {exceptions?.map((exception) => (
        <div key={exception.id} className="mt-3 flex flex-wrap items-center gap-3 border-t border-line-soft py-3">
          <span className="flex-[0_1_110px] font-head text-[13px] font-semibold text-ink tabular-nums">
            {formatDate(exception.date)}
          </span>
          <span className="min-w-0 flex-[1_1_180px] text-[12.5px] text-sub">{exception.reason}</span>
          <Badge tone={SCHEDULE_EXCEPTION_KIND_TONES[exception.kind]}>{describeExceptionHours(exception)}</Badge>
          <div className="ml-auto flex items-center gap-1.5">
            <Button variant="ghost" size="sm" isDisabled>
              <Icon name="pencil" size={13} /> Editar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              ariaLabel={`Eliminar excepción del ${formatDate(exception.date)}`}
              onClick={() => openModal({ exceptionId: exception.id })}
            >
              <Icon name="trash-2" size={13} />
            </Button>
          </div>
        </div>
      ))}
    </Card>
  )
}
