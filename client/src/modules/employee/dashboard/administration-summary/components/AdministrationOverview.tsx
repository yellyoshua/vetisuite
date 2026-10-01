import { LayoutGridIcon, LogInIcon, ShieldCheckIcon, UsersIcon } from 'lucide-react'
import CustomPage from '@/components/CustomPage/CustomPage'
import type { AdministrationSummary } from '@/modules/employee/dashboard/dashboard.schema'
import SummaryKpis, { type KpiDefinition } from '@/modules/employee/dashboard/components/SummaryKpis'
import SummaryListPanels, { type ListPanelDefinition } from '@/modules/employee/dashboard/components/SummaryListPanels'
import type { AdministrationKpiKey, AdministrationPanelKey } from '@/modules/employee/dashboard/dashboard.schema'

const KPIS: KpiDefinition<AdministrationKpiKey>[] = [
  { key: 'activeUsers', label: 'Usuarios activos', icon: UsersIcon, tone: 'primary' },
  { key: 'roles', label: 'Roles definidos', icon: ShieldCheckIcon, tone: 'info' },
  { key: 'todayLogins', label: 'Accesos de hoy', icon: LogInIcon, tone: 'muted' },
  { key: 'enabledModules', label: 'Módulos habilitados', icon: LayoutGridIcon, tone: 'primary' },
]

const PANELS: ListPanelDefinition<AdministrationPanelKey>[] = [
  { key: 'rolePermissions', title: 'Permisos por rol', icon: ShieldCheckIcon, tone: 'info' },
  { key: 'recentLogins', title: 'Accesos recientes', icon: LogInIcon, tone: 'muted' },
]

type AdministrationOverviewProps = {
  summary: AdministrationSummary
}

export default function AdministrationOverview({ summary }: AdministrationOverviewProps) {
  return (
    <CustomPage
      title="Administración"
      description="Gobierno del sistema: usuarios, perfiles y roles, y la configuración que rige a todos los módulos."
    >
      <SummaryKpis definitions={KPIS} values={summary.kpis} />
      <SummaryListPanels definitions={PANELS} panels={summary.panels} />
    </CustomPage>
  )
}
