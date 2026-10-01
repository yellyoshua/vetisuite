import { CalendarDays, CalendarRange, Clock } from 'lucide-react'
import SegmentedControl from './segmented-control'
import useSegmentedControlDemo from './segmented-control.demo.handlers'

const ranges = [
  { value: 'dia', label: 'Día', icon: <Clock /> },
  { value: 'semana', label: 'Semana', icon: <CalendarDays /> },
  { value: 'mes', label: 'Mes', icon: <CalendarRange /> },
]

const statuses = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'cancelada', label: 'Cancelada' },
]

export default function SegmentedControlDemo() {
  const { range, setRange } = useSegmentedControlDemo()

  return (
    <div className="grid w-full max-w-sm gap-3">
      <SegmentedControl aria-label="Rango de citas" options={ranges} value={range} onValueChange={setRange} />
      <p className="text-xs text-muted-foreground">Rango: {range}</p>
      <SegmentedControl aria-label="Estado de la cita" name="status" options={statuses} defaultValue="pendiente" />
    </div>
  )
}
