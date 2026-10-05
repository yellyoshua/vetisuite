import { CheckCheckIcon, EyeIcon, InboxIcon, SendIcon, TriangleAlertIcon } from 'lucide-react'
import { useSearchParams } from 'react-router'
import FilterChips from '@/components/FilterChips/FilterChips'
import KpiCard from '@/components/KpiCard/KpiCard'
import KpiGrid from '@/components/KpiGrid/KpiGrid'
import { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import { WHATSAPP_RANGE_OPTIONS, WHATSAPP_RANGE_VALUES } from '@/constants/whatsapp'
import type { WhatsappAnalytics } from '../../whatsapp.schema'
import MessagesChart from './MessagesChart'
import SectionHeading from './SectionHeading'

const DEFAULT_RANGE = WHATSAPP_RANGE_VALUES[0]

function share(part: number, total: number): string {
  return total === 0 ? '0%' : `${Math.round((part / total) * 100)}%`
}

export default function AnalyticsPanel({ analytics }: { analytics: WhatsappAnalytics }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { totals } = analytics

  const changeRange = (days: string) => {
    const next = new URLSearchParams(searchParams)

    next.set('days', days)
    setSearchParams(next, { replace: true })
  }

  return (
    <section aria-label="Analítica de mensajes" className="flex flex-col gap-3.5">
      <CustomPageContainer className="flex flex-wrap items-center justify-between gap-3 p-4">
        <SectionHeading
          title="Analítica"
          description="Mensajes utility enviados por Veti Suite y mensajes recibidos de tus clientes."
        />
        <FilterChips
          label="Rango de días"
          options={WHATSAPP_RANGE_OPTIONS}
          value={String(analytics.days || DEFAULT_RANGE)}
          onChange={changeRange}
        />
      </CustomPageContainer>
      <KpiGrid>
        <KpiCard label="Enviados" value={String(totals.sent)} detail={totals.queued > 0 ? `${totals.queued} en cola` : 'mensajes utility'} icon={SendIcon} tone="primary" />
        <KpiCard label="Entregados" value={String(totals.delivered)} detail={`${share(totals.delivered, totals.sent)} de los enviados`} icon={CheckCheckIcon} tone="primary-strong" />
        <KpiCard label="Leídos" value={String(totals.read)} detail={`${share(totals.read, totals.delivered)} de los entregados`} icon={EyeIcon} tone="info" />
        <KpiCard label="Recibidos" value={String(totals.received)} detail="respuestas de clientes" icon={InboxIcon} tone="warning" />
        <KpiCard label="Fallidos" value={String(totals.failed)} detail="no se pudieron entregar" icon={TriangleAlertIcon} tone="danger" />
      </KpiGrid>
      <CustomPageContainer className="p-5">
        <h3 className="font-head text-[14px] font-semibold text-foreground">Mensajes por día</h3>
        <MessagesChart daily={analytics.daily} />
        {totals.sentFromApp > 0 && (
          <p className="mt-3 border-t border-accent pt-3 text-[11.5px] text-muted-foreground">
            Además se enviaron {totals.sentFromApp} mensajes desde la app de WhatsApp Business; no se cuentan entre los enviados por Veti Suite.
          </p>
        )}
      </CustomPageContainer>
    </section>
  )
}
