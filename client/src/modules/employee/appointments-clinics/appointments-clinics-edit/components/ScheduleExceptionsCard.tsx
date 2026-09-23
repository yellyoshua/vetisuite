import { PencilIcon, PlusIcon, Trash2Icon } from 'lucide-react'
import useMutation from '@/hooks/use-mutation'
import { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import EmptyState from '@/components/EmptyState/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SCHEDULE_EXCEPTION_KIND_TONES } from '@/constants/appointments-clinics'
import { BADGE_TONE_CLASS_NAMES } from '@/constants/badge-tones'
import { formatDate } from '@/lib/date'
import type { ScheduleException } from '@/modules/employee/appointments-clinics/appointments-clinics.schema'
import { deleteScheduleException } from '../resolvers'
import SectionHeading from './SectionHeading'

type ScheduleExceptionsCardProps = {
  exceptions: ScheduleException[]
  refetch: () => void
}

function describeExceptionHours(exception: ScheduleException): string {
  if (exception.kind === 'closed') {
    return 'cerrado'
  }

  return `${exception.hours.from} a ${exception.hours.to}`
}

function formatExceptionDate(date: string): string {
  return formatDate(`${date}T00:00:00`, { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ScheduleExceptionsCard({ exceptions, refetch }: ScheduleExceptionsCardProps) {
  const [isDeleting, removeException] = useMutation((exception: ScheduleException) => deleteScheduleException(exception.id), {
    confirm: {
      title: 'Eliminar excepción',
      description: (data) => {
        const exception = data as ScheduleException

        return `Se eliminará la excepción del ${formatExceptionDate(exception.date)} (${exception.reason}). Ese día vuelve a regir el horario semanal.`
      },
      confirmText: 'Eliminar excepción',
    },
    successMessage: 'Excepción eliminada correctamente',
    onSuccess: () => refetch(),
  })

  return (
    <CustomPageContainer className="p-5">
      <SectionHeading
        title="Excepciones por fecha"
        description="Feriados y jornadas especiales. Pisan al horario semanal en esa fecha."
        actions={
          <Button type="button" variant="ghost" size="sm" disabled>
            <PlusIcon /> Añadir excepción
          </Button>
        }
      />
      {exceptions.length === 0 && (
        <EmptyState title="Sin excepciones" hint="Todos los días rige el horario semanal." />
      )}
      {exceptions.map((exception) => (
        <div key={exception.id} className="mt-3 flex flex-wrap items-center gap-3 border-t border-line-soft py-3">
          <span className="flex-[0_1_110px] font-head text-[13px] font-semibold text-ink tabular-nums">
            {formatExceptionDate(exception.date)}
          </span>
          <span className="min-w-0 flex-[1_1_180px] text-[12.5px] text-sub">{exception.reason}</span>
          <Badge variant="outline" className={BADGE_TONE_CLASS_NAMES[SCHEDULE_EXCEPTION_KIND_TONES[exception.kind]]}>
            {describeExceptionHours(exception)}
          </Badge>
          <div className="ml-auto flex items-center gap-1.5">
            <Button type="button" variant="ghost" size="sm" disabled>
              <PencilIcon /> Editar
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isDeleting}
              aria-label={`Eliminar excepción del ${formatExceptionDate(exception.date)}`}
              onClick={() => removeException(exception)}
            >
              <Trash2Icon />
            </Button>
          </div>
        </div>
      ))}
    </CustomPageContainer>
  )
}
