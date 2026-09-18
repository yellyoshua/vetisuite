import ErrorState from '@/components/ErrorState'
import LoadingState from '@/components/LoadingState'
import PageHeader from '@/components/PageHeader'
import useResolver from '@/hooks/use-resolver'
import SummaryKpis, { type KpiDefinition } from '../components/SummaryKpis'
import SummaryListPanels, { type ListPanelDefinition } from '../components/SummaryListPanels'
import type { InventoryKpiKey, InventoryPanelKey } from '../dashboard.schema'
import { resolveInventorySummary } from './resolvers'

const KPIS: KpiDefinition<InventoryKpiKey>[] = [
  { key: 'stockAlerts', label: 'Alertas de stock', icon: 'package', tone: 'amber' },
  { key: 'inventoryValue', label: 'Valor del inventario', icon: 'boxes', tone: 'green' },
  { key: 'monthlyOutflows', label: 'Salidas del mes', icon: 'arrow-left-right', tone: 'blue' },
  { key: 'expiringBatches', label: 'Lotes por caducar', icon: 'calendar-clock', tone: 'red' },
]

const PANELS: ListPanelDefinition<InventoryPanelKey>[] = [
  { key: 'stockAlerts', title: 'Alertas de inventario', icon: 'package', tone: 'amber' },
  { key: 'consumptionByArea', title: 'Consumo por área', icon: 'arrow-left-right', tone: 'blue' },
]

export default function InventorySummaryPage() {
  const { data, error, isLoading } = useResolver(resolveInventorySummary, {})

  return (
    <>
      <PageHeader
        title="Inventario"
        description="Catálogo, lotes y movimientos. Abastece a las áreas de atención y deja el cargo que Facturación cobra."
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
