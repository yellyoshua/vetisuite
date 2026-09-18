import { NotFoundError } from '@/lib/not-found-error'

type ScheduleExceptionSummary = {
  id: string
  date: string
  reason: string
}

type ScheduleExceptionParams = {
  exceptionId: string
}

const SCHEDULE_EXCEPTIONS: ScheduleExceptionSummary[] = [
  { id: 'exc-1', date: '2026-10-12', reason: 'Feriado nacional' },
  { id: 'exc-2', date: '2026-11-02', reason: 'Feriado · guardia de urgencias' },
  { id: 'exc-3', date: '2026-12-24', reason: 'Jornada corta' },
]

function findScheduleException(exceptionId: string): ScheduleExceptionSummary {
  const exception = SCHEDULE_EXCEPTIONS.find((candidate) => candidate.id === exceptionId)
  if (!exception) {
    throw new NotFoundError('No encontramos la excepción que quieres eliminar.')
  }

  return exception
}

export function resolveScheduleExceptionIds(): Promise<string[]> {
  return Promise.resolve().then(() => SCHEDULE_EXCEPTIONS.map((exception) => exception.id))
}

export function resolveScheduleException({ exceptionId }: ScheduleExceptionParams): Promise<ScheduleExceptionSummary> {
  return Promise.resolve().then(() => findScheduleException(exceptionId))
}

export function deleteScheduleException({ exceptionId }: ScheduleExceptionParams): Promise<void> {
  return Promise.resolve().then(() => {
    const exception = findScheduleException(exceptionId)
    SCHEDULE_EXCEPTIONS.splice(SCHEDULE_EXCEPTIONS.indexOf(exception), 1)
  })
}
