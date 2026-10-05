import { InfoIcon } from 'lucide-react'
import { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import { WHATSAPP_TEMPLATE_LABELS } from '@/constants/whatsapp'

const TEMPLATE_NAMES = Object.values(WHATSAPP_TEMPLATE_LABELS).join(' y ').toLowerCase()

export default function UtilityOnlyNotice() {
  return (
    <CustomPageContainer className="flex gap-3 border-info/30 bg-info-soft p-4">
      <InfoIcon className="mt-0.5 size-4 shrink-0 text-info" aria-hidden="true" />
      <div className="min-w-0 text-[12.5px] text-foreground">
        <p className="font-head text-[13.5px] font-semibold">Por ahora solo mensajes utility</p>
        <p className="mt-1 text-pretty text-muted-foreground">
          Veti Suite envía únicamente mensajes utility: avisos sobre un hecho concreto de tu cliente, como {TEMPLATE_NAMES}.
          No se envían promociones, campañas ni saludos de cumpleaños: Meta los clasifica como marketing y tienen otras reglas
          y otra tarifa. Tus clientes deben haber aceptado recibir estos avisos por WhatsApp.
        </p>
      </div>
    </CustomPageContainer>
  )
}
