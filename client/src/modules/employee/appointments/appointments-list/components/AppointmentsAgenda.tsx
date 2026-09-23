import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AppointmentsAgenda as AgendaType } from '@/modules/employee/appointments/appointments.schema'

type AppointmentsAgendaProps = {
  agenda: AgendaType
  onDateChange: (date: string) => void
}

export default function AppointmentsAgenda({ agenda, onDateChange }: AppointmentsAgendaProps) {
  return (
    <div role="group" aria-label="Día de la agenda" className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-0.5 rounded-control border border-line bg-card p-[3px]">
        <Button variant="ghost" size="icon-sm" aria-label="Día anterior" onClick={() => onDateChange(agenda.previousDate)}>
          <ChevronLeftIcon />
        </Button>
        <span aria-live="polite" className="px-2 font-head text-[13px] font-semibold whitespace-nowrap text-ink">
          {agenda.dayLabel}
        </span>
        <Button variant="ghost" size="icon-sm" aria-label="Día siguiente" onClick={() => onDateChange(agenda.nextDate)}>
          <ChevronRightIcon />
        </Button>
      </div>
      <Button variant="ghost" size="sm" onClick={() => onDateChange('')}>
        Hoy
      </Button>
    </div>
  )
}
