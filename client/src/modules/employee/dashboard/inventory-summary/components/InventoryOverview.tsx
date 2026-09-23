import { ArrowLeftRightIcon, BoxesIcon, PackageIcon } from 'lucide-react'
import CustomPage from '@/components/CustomPage/CustomPage'
import type { InventorySummary } from '@/modules/employee/dashboard/dashboard.schema'
import SummaryKpis, { type KpiDefinition } from '@/modules/employee/dashboard/components/SummaryKpis'
import SummaryListPanels, { type ListPanelDefinition } from '@/modules/employee/dashboard/components/SummaryListPanels'
import type { InventoryKpiKey, InventoryPanelKey } from '@/modules/employee/dashboard/dashboard.schema'

const KPIS: KpiDefinition<InventoryKpiKey>[] = [
  { key: 'stockAlerts', label: 'Alertas de stock', icon: PackageIcon, tone: 'amber' },
  { key: 'inventoryValue', label: 'Valor del inventario', icon: BoxesIcon, tone: 'green' },
]

const PANELS: ListPanelDefinition<InventoryPanelKey>[] = [
  { key: 'stockAlerts', title: 'Alertas de inventario', icon: PackageIcon, tone: 'amber' },
  { key: 'consumptionByArea', title: 'Consumo por área', icon: ArrowLeftRightIcon, tone: 'blue' },
]

type InventoryOverviewProps = {
  summary: InventorySummary
}

export default function InventoryOverview({ summary }: InventoryOverviewProps) {
  return (
    <CustomPage
      title="Inventario"
      description="Catálogo, lotes y movimientos. Abastece a las áreas de atención y deja el cargo que Facturación cobra."
    >
      <SummaryKpis definitions={KPIS} values={summary.kpis} />
      <SummaryListPanels definitions={PANELS} panels={summary.panels} />
    </CustomPage>
  )
}
