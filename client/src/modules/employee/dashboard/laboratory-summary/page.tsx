import ErrorState from '@/components/ErrorState'
import LoadingState from '@/components/LoadingState'
import PageHeader from '@/components/PageHeader'
import useResolver from '@/hooks/use-resolver'
import SummaryKpis, { type KpiDefinition } from '../components/SummaryKpis'
import SummaryListPanels, { type ListPanelDefinition } from '../components/SummaryListPanels'
import type { LaboratoryKpiKey, LaboratoryPanelKey } from '../dashboard.schema'
import { resolveLaboratorySummary } from './resolvers'

const KPIS: KpiDefinition<LaboratoryKpiKey>[] = [
  { key: 'openOrders', label: 'Órdenes abiertas', icon: 'flask-conical', tone: 'amber' },
  { key: 'inAnalysis', label: 'En análisis', icon: 'activity', tone: 'blue' },
  { key: 'todayResults', label: 'Resultados de hoy', icon: 'file-check', tone: 'green' },
  { key: 'averageTurnaround', label: 'Respuesta media', icon: 'timer', tone: 'sub' },
]

const PANELS: ListPanelDefinition<LaboratoryPanelKey>[] = [
  { key: 'pendingOrders', title: 'Órdenes por resolver', icon: 'flask-conical', tone: 'amber' },
  { key: 'topExams', title: 'Exámenes más solicitados', icon: 'trending-up', tone: 'green' },
]

export default function LaboratorySummaryPage() {
  const { data, error, isLoading } = useResolver(resolveLaboratorySummary, {})

  return (
    <>
      <PageHeader title="Laboratorio" description="Órdenes, muestras y resultados del laboratorio interno y externo." />
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
