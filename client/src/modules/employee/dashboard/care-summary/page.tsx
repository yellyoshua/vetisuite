import ErrorState from '@/components/ErrorState'
import LoadingState from '@/components/LoadingState'
import PageHeader from '@/components/PageHeader'
import useResolver from '@/hooks/use-resolver'
import SummaryKpis, { type KpiDefinition } from '../components/SummaryKpis'
import SummaryListPanels, { type ListPanelDefinition } from '../components/SummaryListPanels'
import type { CareKpiKey, CarePanelKey } from '../dashboard.schema'
import { resolveCareSummary } from './resolvers'

const KPIS: KpiDefinition<CareKpiKey>[] = [
  { key: 'waiting', label: 'En espera', icon: 'clipboard-list', tone: 'amber' },
  { key: 'inConsultation', label: 'En consulta', icon: 'activity', tone: 'blue' },
  { key: 'dischargedToday', label: 'Altas de hoy', icon: 'check', tone: 'green' },
  { key: 'averageTime', label: 'Tiempo medio', icon: 'timer', tone: 'sub' },
]

const PANELS: ListPanelDefinition<CarePanelKey>[] = [
  { key: 'ongoingConsultations', title: 'Consultas en curso', icon: 'activity', tone: 'blue' },
  { key: 'referrals', title: 'Derivaciones desde la consulta', icon: 'git-branch', tone: 'green' },
]

export default function CareSummaryPage() {
  const { data, error, isLoading } = useResolver(resolveCareSummary, {})

  return (
    <>
      <PageHeader
        title="Atención"
        description="Atención ambulatoria: pacientes en consulta ahora mismo, su avance por etapa y las derivaciones que salen de la consulta."
      />
      {isLoading && <LoadingState />}
      {error && <ErrorState error={error} />}
      {data && (
        <>
          <SummaryKpis definitions={KPIS} values={data.kpis} />
          <SummaryListPanels definitions={PANELS} panels={data.panels} />
        </>
      )}
    </>
  )
}
