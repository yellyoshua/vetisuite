import ErrorState from '@/components/ErrorState'
import LoadingState from '@/components/LoadingState'
import PageHeader from '@/components/PageHeader'
import useResolver from '@/hooks/legacy/use-resolver'
import SummaryKpis, { type KpiDefinition } from '../components/SummaryKpis'
import SummaryListPanels, { type ListPanelDefinition } from '../components/SummaryListPanels'
import type { GroomingKpiKey, GroomingPanelKey } from '../dashboard.schema'
import { resolveGroomingSummary } from './resolvers'

const KPIS: KpiDefinition<GroomingKpiKey>[] = [
  { key: 'todayServices', label: 'Servicios de hoy', icon: 'scissors', tone: 'amber' },
  { key: 'inProgress', label: 'En proceso', icon: 'activity', tone: 'blue' },
  { key: 'finished', label: 'Terminados', icon: 'check', tone: 'green' },
  { key: 'averageTicket', label: 'Ticket promedio', icon: 'wallet', tone: 'sub' },
]

const PANELS: ListPanelDefinition<GroomingPanelKey>[] = [
  { key: 'groomingRoom', title: 'En la sala de estética', icon: 'scissors', tone: 'amber' },
  { key: 'topServices', title: 'Servicios más pedidos', icon: 'trending-up', tone: 'green' },
]

export default function GroomingSummaryPage() {
  const { data, error, isLoading } = useResolver(resolveGroomingSummary, {})

  return (
    <>
      <PageHeader
        title="Estética"
        description="Peluquería y estética: servicios del día, responsables y entrega al cliente."
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
