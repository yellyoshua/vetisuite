import { ActivityIcon, CheckIcon, ScissorsIcon, TrendingUpIcon, WalletIcon } from 'lucide-react'
import CustomPage from '@/components/CustomPage/CustomPage'
import type { GroomingSummary } from '@/modules/employee/dashboard/dashboard.schema'
import SummaryKpis, { type KpiDefinition } from '@/modules/employee/dashboard/components/SummaryKpis'
import SummaryListPanels, { type ListPanelDefinition } from '@/modules/employee/dashboard/components/SummaryListPanels'
import type { GroomingKpiKey, GroomingPanelKey } from '@/modules/employee/dashboard/dashboard.schema'

const KPIS: KpiDefinition<GroomingKpiKey>[] = [
  { key: 'todayServices', label: 'Servicios de hoy', icon: ScissorsIcon, tone: 'amber' },
  { key: 'inProgress', label: 'En proceso', icon: ActivityIcon, tone: 'blue' },
  { key: 'finished', label: 'Terminados', icon: CheckIcon, tone: 'green' },
  { key: 'averageTicket', label: 'Ticket promedio', icon: WalletIcon, tone: 'sub' },
]

const PANELS: ListPanelDefinition<GroomingPanelKey>[] = [
  { key: 'groomingRoom', title: 'En la sala de estética', icon: ScissorsIcon, tone: 'amber' },
  { key: 'topServices', title: 'Servicios más pedidos', icon: TrendingUpIcon, tone: 'green' },
]

type GroomingOverviewProps = {
  summary: GroomingSummary
}

export default function GroomingOverview({ summary }: GroomingOverviewProps) {
  return (
    <CustomPage
      title="Estética"
      description="Peluquería y estética: servicios del día, responsables y entrega al cliente."
    >
      <SummaryKpis definitions={KPIS} values={summary.kpis} />
      <SummaryListPanels definitions={PANELS} panels={summary.panels} />
    </CustomPage>
  )
}
