import { ActivityIcon, CheckIcon, ClipboardListIcon, GitBranchIcon } from 'lucide-react'
import CustomPage from '@/components/CustomPage/CustomPage'
import type { CareSummary } from '@/modules/employee/dashboard/dashboard.schema'
import SummaryKpis, { type KpiDefinition } from '@/modules/employee/dashboard/components/SummaryKpis'
import SummaryListPanels, { type ListPanelDefinition } from '@/modules/employee/dashboard/components/SummaryListPanels'
import type { CareKpiKey, CarePanelKey } from '@/modules/employee/dashboard/dashboard.schema'

const KPIS: KpiDefinition<CareKpiKey>[] = [
  { key: 'waiting', label: 'En espera', icon: ClipboardListIcon, tone: 'amber' },
  { key: 'inConsultation', label: 'En consulta', icon: ActivityIcon, tone: 'blue' },
  { key: 'dischargedToday', label: 'Altas de hoy', icon: CheckIcon, tone: 'green' },
]

const PANELS: ListPanelDefinition<CarePanelKey>[] = [
  { key: 'ongoingConsultations', title: 'Consultas en curso', icon: ActivityIcon, tone: 'blue' },
  { key: 'referrals', title: 'Derivaciones desde la consulta', icon: GitBranchIcon, tone: 'green' },
]

type CareOverviewProps = {
  summary: CareSummary
}

export default function CareOverview({ summary }: CareOverviewProps) {
  return (
    <CustomPage
      title="Atención"
      description="Atención ambulatoria: pacientes en consulta ahora mismo, su avance por etapa y las derivaciones que salen de la consulta."
    >
      <SummaryKpis definitions={KPIS} values={summary.kpis} />
      <SummaryListPanels definitions={PANELS} panels={summary.panels} />
    </CustomPage>
  )
}
