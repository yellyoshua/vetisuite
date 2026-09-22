import ErrorState from '@/components/ErrorState'
import LoadingState from '@/components/LoadingState'
import PageHeader from '@/components/PageHeader'
import useResolver from '@/hooks/legacy/use-resolver'
import SummaryKpis, { type KpiDefinition } from '../components/SummaryKpis'
import SummaryListPanels, { type ListPanelDefinition } from '../components/SummaryListPanels'
import type { BillingKpiKey, BillingPanelKey } from '../dashboard.schema'
import { resolveBillingSummary } from './resolvers'

const KPIS: KpiDefinition<BillingKpiKey>[] = [
  { key: 'todayRevenue', label: 'Ingresos de hoy', icon: 'receipt', tone: 'dark' },
  { key: 'openAccounts', label: 'Cuentas abiertas', icon: 'folder-open', tone: 'blue' },
  { key: 'receivables', label: 'Por cobrar', icon: 'circle-alert', tone: 'red' },
  { key: 'averageTicket', label: 'Ticket promedio', icon: 'wallet', tone: 'green' },
]

const PANELS: ListPanelDefinition<BillingPanelKey>[] = [
  { key: 'accountsToClose', title: 'Cuentas por cerrar', icon: 'folder-open', tone: 'amber' },
  { key: 'pendingCollections', title: 'Cobros pendientes', icon: 'circle-alert', tone: 'red' },
]

export default function BillingSummaryPage() {
  const { data, error, isLoading } = useResolver(resolveBillingSummary, {})

  return (
    <>
      <PageHeader
        title="Facturación"
        description="Salida del cliente: reúne los cargos de todos los módulos, factura, cobra y cierra el caso."
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
