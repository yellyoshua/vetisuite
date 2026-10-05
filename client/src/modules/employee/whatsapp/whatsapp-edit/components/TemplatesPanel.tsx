import { RefreshCwIcon } from 'lucide-react'
import useMutation from '@/hooks/use-mutation'
import { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import EmptyState from '@/components/EmptyState/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BADGE_TONE_CLASS_NAMES } from '@/constants/badge-tones'
import {
  WHATSAPP_TEMPLATE_CATEGORY_LABELS,
  WHATSAPP_TEMPLATE_LABELS,
  WHATSAPP_TEMPLATE_STATUS_LABELS,
  WHATSAPP_TEMPLATE_STATUS_TONES,
} from '@/constants/whatsapp'
import type { WhatsappTemplate } from '../../whatsapp.schema'
import { syncWhatsappTemplates } from '../resolvers'
import SectionHeading from './SectionHeading'

type TemplatesPanelProps = {
  templates: WhatsappTemplate[]
  refetch: () => void
}

export default function TemplatesPanel({ templates, refetch }: TemplatesPanelProps) {
  const [isSyncing, sync] = useMutation(syncWhatsappTemplates, {
    skipConfirm: true,
    successMessage: 'Plantillas sincronizadas con WhatsApp',
    onSuccess: () => refetch(),
  })

  return (
    <CustomPageContainer className="p-5">
      <SectionHeading
        title="Plantillas"
        description="Meta revisa cada plantilla y decide su categoría. Solo se envían las aprobadas como utility."
        actions={
          <Button type="button" variant="ghost" size="sm" disabled={isSyncing} onClick={() => sync()}>
            <RefreshCwIcon /> Sincronizar
          </Button>
        }
      />
      {templates.length === 0 && (
        <EmptyState title="Sin plantillas" hint="Al conectar WhatsApp se crean las plantillas utility de la clínica." />
      )}
      {templates.map((template) => (
        <div key={`${template.name}-${template.language}`} className="mt-3 flex flex-wrap items-center gap-3 border-t border-accent py-3">
          <span className="min-w-0 flex-[1_1_200px] font-head text-[13px] font-semibold text-foreground">
            {WHATSAPP_TEMPLATE_LABELS[template.name] ?? template.name}
          </span>
          <Badge variant="outline" className={BADGE_TONE_CLASS_NAMES[template.category === 'utility' ? 'info' : 'warning']}>
            {WHATSAPP_TEMPLATE_CATEGORY_LABELS[template.category]}
          </Badge>
          <Badge variant="outline" className={BADGE_TONE_CLASS_NAMES[WHATSAPP_TEMPLATE_STATUS_TONES[template.status]]}>
            {WHATSAPP_TEMPLATE_STATUS_LABELS[template.status]}
          </Badge>
          {template.category !== 'utility' && (
            <p className="basis-full text-[12px] text-warning">
              Meta la clasificó como {WHATSAPP_TEMPLATE_CATEGORY_LABELS[template.category].toLowerCase()}: no se enviará porque Veti Suite solo envía utility.
            </p>
          )}
          {template.rejectedReason && <p className="basis-full text-[12px] text-danger">Motivo del rechazo: {template.rejectedReason}</p>}
        </div>
      ))}
    </CustomPageContainer>
  )
}
