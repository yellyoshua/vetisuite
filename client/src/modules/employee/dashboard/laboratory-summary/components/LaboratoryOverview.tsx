import { ActivityIcon, FileCheckIcon, FlaskConicalIcon, TrendingUpIcon } from 'lucide-react'
import CustomPage from '@/components/CustomPage/CustomPage'
import type { LaboratorySummary } from '@/modules/employee/dashboard/dashboard.schema'
import SummaryKpis, { type KpiDefinition } from '@/modules/employee/dashboard/components/SummaryKpis'
import SummaryListPanels, { type ListPanelDefinition } from '@/modules/employee/dashboard/components/SummaryListPanels'
import type { LaboratoryKpiKey, LaboratoryPanelKey } from '@/modules/employee/dashboard/dashboard.schema'

const KPIS: KpiDefinition<LaboratoryKpiKey>[] = [
  { key: 'openOrders', label: 'Órdenes abiertas', icon: FlaskConicalIcon, tone: 'amber' },
  { key: 'inAnalysis', label: 'En análisis', icon: ActivityIcon, tone: 'blue' },
  { key: 'todayResults', label: 'Resultados de hoy', icon: FileCheckIcon, tone: 'green' },
]

const PANELS: ListPanelDefinition<LaboratoryPanelKey>[] = [
  { key: 'pendingOrders', title: 'Órdenes por resolver', icon: FlaskConicalIcon, tone: 'amber' },
  { key: 'topExams', title: 'Exámenes más solicitados', icon: TrendingUpIcon, tone: 'green' },
]

type LaboratoryOverviewProps = {
  summary: LaboratorySummary
}

export default function LaboratoryOverview({ summary }: LaboratoryOverviewProps) {
  return (
    <CustomPage
      title="Laboratorio" description="Órdenes, muestras y resultados del laboratorio interno y externo."
    >
      <SummaryKpis definitions={KPIS} values={summary.kpis} />
      <SummaryListPanels definitions={PANELS} panels={summary.panels} />
    </CustomPage>
  )
}
