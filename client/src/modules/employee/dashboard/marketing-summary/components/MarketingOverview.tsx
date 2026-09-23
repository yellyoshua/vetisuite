import { CalendarCheckIcon, UserPlusIcon } from 'lucide-react'
import CustomPage from '@/components/CustomPage/CustomPage'
import { Badge } from '@/components/ui/badge'
import { BADGE_TONE_CLASS_NAMES } from '@/constants/badge-tones'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import type { ComponentProps } from 'react'
import DonutChart from '@/components/DonutChart/DonutChart'
import EmptyState from '@/components/EmptyState/EmptyState'
import Meter from '@/components/Meter/Meter'
import SummaryKpis, { type KpiDefinition } from '@/modules/employee/dashboard/components/SummaryKpis'
import SummaryPanel from '@/modules/employee/dashboard/components/SummaryPanel'
import type {
  FunnelStep,
  FunnelStepKey,
  MarketingKpiKey,
  MarketingSummary,
  PortalPerformance,
} from '@/modules/employee/dashboard/dashboard.schema'

type FunnelStepDefinition = {
  key: FunnelStepKey
  label: string
  tone: ComponentProps<typeof Meter>['tone']
}

const KPIS: KpiDefinition<MarketingKpiKey>[] = [
  { key: 'onlineBookings', label: 'Reservas en línea', icon: CalendarCheckIcon, tone: 'green' },
  { key: 'newClients', label: 'Clientes nuevos', icon: UserPlusIcon, tone: 'amber' },
]

const FUNNEL_STEPS: FunnelStepDefinition[] = [
  { key: 'booked', label: 'Reservan una cita', tone: 'green' },
  { key: 'attended', label: 'Asisten a la cita', tone: 'dark' },
]

function PortalPerformanceList({ portals }: { portals: PortalPerformance[] }) {
  if (portals.length === 0) {
    return <EmptyState title="Sin portales" hint="Los portales publicados aparecerán aquí con sus visitas y citas." />
  }

  return (
    <ul className="mt-1.5">
      {portals.map((portal) => (
        <li key={portal.name} className="border-t border-line-soft py-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="min-w-0 flex-1 font-head text-[13.5px] font-semibold text-ink">{portal.name}</span>
            <Badge variant="outline" className={BADGE_TONE_CLASS_NAMES[portal.tone]}>{portal.status}</Badge>
          </div>
          <div className="mt-2 flex items-center gap-2.5">
            <Meter percent={portal.percent} />
            <span className="whitespace-nowrap text-[11.5px] text-sub tabular-nums">{portal.detail}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

function BookingFunnel({ funnel }: { funnel: Record<FunnelStepKey, FunnelStep> }) {
  return (
    <ol className="mt-4 flex flex-col gap-3">
      {FUNNEL_STEPS.map((step) => (
        <li key={step.key}>
          <div className="mb-[5px] flex items-baseline gap-2">
            <span className="min-w-0 flex-1 text-[12.5px] text-sub">{step.label}</span>
            <b className="font-head text-[13px] tabular-nums">{funnel[step.key].value}</b>
            <span className="w-11 text-right text-[11.5px] text-sub tabular-nums">{funnel[step.key].share}</span>
          </div>
          <Meter percent={funnel[step.key].percent} tone={step.tone} size="lg" />
        </li>
      ))}
    </ol>
  )
}

function MarketingSummaryContent({ summary }: { summary: MarketingSummary }) {
  return (
    <>
      <SummaryKpis definitions={KPIS} values={summary.kpis} />
      <div className="mb-3.5 grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-3.5">
        <SummaryPanel title="Origen de las reservas">
          <DonutChart total={summary.bookingOrigins.total} unit="reservas" segments={summary.bookingOrigins.segments} />
        </SummaryPanel>
        <SummaryPanel title="Del portal a la cita" meta="reservas por portal">
          <BookingFunnel funnel={summary.funnel} />
          <p className="mt-4 border-t border-line-soft pt-3.5 text-[11.5px] text-sub">
            Las reservas del portal entran como pendientes mientras la confirmación automática esté apagada.
          </p>
        </SummaryPanel>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] items-start gap-3.5">
        <SummaryPanel
          title="Rendimiento por portal"
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/portals">Ver portales</Link>
            </Button>
          }
        >
          <PortalPerformanceList portals={summary.portalPerformance} />
        </SummaryPanel>
      </div>
    </>
  )
}

type MarketingOverviewProps = {
  summary: MarketingSummary
}

export default function MarketingOverview({ summary }: MarketingOverviewProps) {
  return (
    <CustomPage
      title="Marketing"
      description="Capta: portales, reservas en línea y la disponibilidad que la clínica publica. Crea clientes y citas; no toca la data de nadie más."
    >
      <MarketingSummaryContent summary={summary} />
    </CustomPage>
  )
}
