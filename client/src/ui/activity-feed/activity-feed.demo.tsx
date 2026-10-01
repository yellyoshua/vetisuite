import { CalendarCheck, CalendarX, Receipt, Syringe, UserPlus } from 'lucide-react'
import ActivityFeed from './activity-feed'

const items = [
  {
    id: 'a1',
    title: 'Cita confirmada',
    description: (
      <>
        <strong>María Fernández</strong> confirmó la consulta de <strong>Luna</strong>
      </>
    ),
    time: '09:42',
    dateTime: '2026-09-24T09:42',
    icon: <CalendarCheck />,
    tone: 'primary' as const,
  },
  {
    id: 'a2',
    title: 'Vacuna aplicada',
    description: (
      <>
        Antirrábica a <strong>Rocky</strong> · Bulldog francés
      </>
    ),
    time: '09:15',
    dateTime: '2026-09-24T09:15',
    icon: <Syringe />,
    tone: 'info' as const,
  },
  {
    id: 'a3',
    title: 'Cita pendiente',
    description: (
      <>
        <strong>Michi</strong> espera confirmación del tutor
      </>
    ),
    time: '08:50',
    dateTime: '2026-09-24T08:50',
    icon: <UserPlus />,
    tone: 'warning' as const,
  },
  {
    id: 'a4',
    title: 'Cita cancelada',
    description: (
      <>
        <strong>Carlos Ruiz</strong> canceló la peluquería de <strong>Toby</strong>
      </>
    ),
    time: 'Ayer',
    dateTime: '2026-09-23T17:30',
    icon: <CalendarX />,
    tone: 'destructive' as const,
  },
  {
    id: 'a5',
    title: 'Factura emitida',
    description: 'Consulta general · $35,00',
    time: 'Ayer',
    dateTime: '2026-09-23T16:05',
    icon: <Receipt />,
    tone: 'muted' as const,
  },
]

export default function ActivityFeedDemo() {
  return (
    <div className="max-w-md">
      <ActivityFeed aria-label="Actividad reciente" items={items} />
    </div>
  )
}
