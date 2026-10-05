import { formatDate } from '@/lib/date'
import type { WhatsappAnalytics } from '../../whatsapp.schema'

const BAR_MAX_HEIGHT = 96

function describeDay(day: WhatsappAnalytics['daily'][number]): string {
  return `${formatDate(`${day.date}T00:00:00`, { day: '2-digit', month: 'short' })}: ${day.sent} enviados, ${day.received} recibidos`
}

export default function MessagesChart({ daily }: { daily: WhatsappAnalytics['daily'] }) {
  const maxValue = Math.max(1, ...daily.flatMap((day) => [day.sent, day.received]))

  return (
    <div className="mt-4">
      <ul className="flex h-[132px] gap-1.5">
        {daily.map((day) => (
          <li key={day.date} aria-label={describeDay(day)} title={describeDay(day)} className="flex h-full min-w-0 flex-1 flex-col-reverse items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground tabular-nums">{day.date.slice(8)}</span>
            <div aria-hidden="true" className="flex flex-1 items-end gap-0.5">
              <div className="w-1.5 rounded-t-[3px] bg-primary sm:w-2" style={{ height: `${(day.sent / maxValue) * BAR_MAX_HEIGHT}px` }} />
              <div className="w-1.5 rounded-t-[3px] bg-info sm:w-2" style={{ height: `${(day.received / maxValue) * BAR_MAX_HEIGHT}px` }} />
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 flex items-center gap-4 text-[11.5px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span aria-hidden="true" className="size-2 rounded-full bg-primary" />Enviados</span>
        <span className="flex items-center gap-1.5"><span aria-hidden="true" className="size-2 rounded-full bg-info" />Recibidos</span>
      </p>
    </div>
  )
}
