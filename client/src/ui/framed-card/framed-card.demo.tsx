import { CalendarCheck, Syringe } from 'lucide-react'
import FramedCard from './framed-card'

export default function FramedCardDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FramedCard title="Citas de hoy" icon={<CalendarCheck />}>
        <p className="text-2xl font-medium tabular-nums">18</p>
        <p className="mt-1 text-xs text-muted-foreground">
          <span className="font-medium text-primary">+3</span> vs ayer
        </p>
      </FramedCard>
      <FramedCard title="Vacunas por vencer" icon={<Syringe />} bodyClassName="bg-muted">
        <p className="text-[13px] text-muted-foreground">7 pacientes necesitan refuerzo esta semana.</p>
      </FramedCard>
    </div>
  )
}
