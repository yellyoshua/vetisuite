import Button from '@/components/legacy-ui/Button'
import IconButton from '@/components/legacy-ui/IconButton'
import type { AppointmentsAgenda } from '../../appointments.schema'

type AppointmentsDayNavProps = {
  agenda: AppointmentsAgenda | null
  error: Error | null
  onDateChange: (date: string) => void
}

export default function AppointmentsDayNav({ agenda, error, onDateChange }: AppointmentsDayNavProps) {
  function goToPreviousDay() {
    if (agenda) {
      onDateChange(agenda.previousDate)
    }
  }

  function goToNextDay() {
    if (agenda) {
      onDateChange(agenda.nextDate)
    }
  }

  return (
    <div role="group" aria-label="Día de la agenda" className="mb-3 flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-0.5 rounded-control border border-line bg-card p-[3px]">
        <IconButton icon="chevron-left" label="Día anterior" onClick={goToPreviousDay} />
        <span aria-live="polite" className="px-2 font-head text-[13px] font-semibold whitespace-nowrap text-ink">
          {agenda?.dayLabel}
          {error && (
            <span role="alert" className="text-red">
              {error.message}
            </span>
          )}
        </span>
        <IconButton icon="chevron-right" label="Día siguiente" onClick={goToNextDay} />
      </div>
      <Button variant="ghost" size="sm" onClick={() => onDateChange('')}>
        Hoy
      </Button>
    </div>
  )
}
