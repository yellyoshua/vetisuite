import { CircleAlertIcon, FolderOpenIcon, ReceiptIcon, WalletIcon } from 'lucide-react'
import CustomPage from '@/components/CustomPage/CustomPage'
import type { BillingSummary } from '@/modules/employee/dashboard/dashboard.schema'
import SummaryKpis, { type KpiDefinition } from '@/modules/employee/dashboard/components/SummaryKpis'
import SummaryListPanels, { type ListPanelDefinition } from '@/modules/employee/dashboard/components/SummaryListPanels'
import type { BillingKpiKey, BillingPanelKey } from '@/modules/employee/dashboard/dashboard.schema'

const KPIS: KpiDefinition<BillingKpiKey>[] = [
  { key: 'todayRevenue', label: 'Ingresos de hoy', icon: ReceiptIcon, tone: 'dark' },
  { key: 'openAccounts', label: 'Cuentas abiertas', icon: FolderOpenIcon, tone: 'blue' },
  { key: 'receivables', label: 'Por cobrar', icon: CircleAlertIcon, tone: 'red' },
  { key: 'averageTicket', label: 'Ticket promedio', icon: WalletIcon, tone: 'green' },
]

const PANELS: ListPanelDefinition<BillingPanelKey>[] = [
  { key: 'accountsToClose', title: 'Cuentas por cerrar', icon: FolderOpenIcon, tone: 'amber' },
  { key: 'pendingCollections', title: 'Cobros pendientes', icon: CircleAlertIcon, tone: 'red' },
]

type BillingOverviewProps = {
  summary: BillingSummary
}

export default function BillingOverview({ summary }: BillingOverviewProps) {
  return (
    <CustomPage
      title="Facturación"
      description="Salida del cliente: reúne los cargos de todos los módulos, factura, cobra y cierra el caso."
    >
      <SummaryKpis definitions={KPIS} values={summary.kpis} />
      <SummaryListPanels definitions={PANELS} panels={summary.panels} />
    </CustomPage>
  )
}
