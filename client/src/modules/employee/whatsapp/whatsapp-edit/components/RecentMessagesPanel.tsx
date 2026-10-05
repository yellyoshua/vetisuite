import { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import EmptyState from '@/components/EmptyState/EmptyState'
import { Badge } from '@/components/ui/badge'
import { BADGE_TONE_CLASS_NAMES } from '@/constants/badge-tones'
import {
  WHATSAPP_MESSAGE_DIRECTION_LABELS,
  WHATSAPP_MESSAGE_STATUS_LABELS,
  WHATSAPP_MESSAGE_STATUS_TONES,
  WHATSAPP_TEMPLATE_LABELS,
} from '@/constants/whatsapp'
import { formatDateTime } from '@/lib/date'
import type { WhatsappMessage } from '../../whatsapp.schema'
import SectionHeading from './SectionHeading'

function describeMessage(message: WhatsappMessage): string {
  const kind = message.template ? (WHATSAPP_TEMPLATE_LABELS[message.template] ?? message.template) : WHATSAPP_MESSAGE_DIRECTION_LABELS[message.direction]

  return `${kind} · ${message.client?.name ?? message.phone}`
}

export default function RecentMessagesPanel({ messages }: { messages: WhatsappMessage[] }) {
  return (
    <CustomPageContainer className="p-5">
      <SectionHeading title="Últimos mensajes" description="De cada mensaje se guarda solo quién, cuándo y su estado, nunca el contenido." />
      {messages.length === 0 && <EmptyState title="Sin mensajes" hint="Los mensajes enviados y recibidos aparecerán aquí." />}
      <ul className="mt-1.5">
        {messages.map((message) => (
          <li key={message.id} className="flex flex-wrap items-center gap-3 border-t border-accent py-3 first:mt-3">
            <span className="min-w-0 flex-[1_1_220px] text-[13px] text-foreground">{describeMessage(message)}</span>
            <span className="text-[11.5px] text-muted-foreground tabular-nums">
              {formatDateTime(message.createdAt, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </span>
            <Badge variant="outline" className={BADGE_TONE_CLASS_NAMES[WHATSAPP_MESSAGE_STATUS_TONES[message.status]]}>
              {message.direction === 'inbound' ? WHATSAPP_MESSAGE_DIRECTION_LABELS.inbound : WHATSAPP_MESSAGE_STATUS_LABELS[message.status]}
            </Badge>
            {message.errorMessage && <p className="basis-full text-[12px] text-danger">{message.errorMessage}</p>}
          </li>
        ))}
      </ul>
    </CustomPageContainer>
  )
}
