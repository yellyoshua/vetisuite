import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react'
import Alert from './alert'

export default function AlertDemo() {
  return (
    <div className="flex flex-col gap-3">
      <Alert icon={<Info />} title="Recordatorio de vacunas" description="Se enviarán avisos a los tutores 3 días antes de la cita." />
      <Alert variant="success" icon={<CircleCheck />} title="Cita confirmada" description="Luna · Golden Retriever, jueves 10:30." />
      <Alert variant="warning" icon={<TriangleAlert />} title="Stock bajo" description="Quedan 4 dosis de vacuna antirrábica." />
      <Alert variant="destructive" icon={<CircleAlert />} title="No se pudo guardar la consulta" />
    </div>
  )
}
