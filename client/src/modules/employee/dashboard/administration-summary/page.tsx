import ErrorState from '@/components/ErrorState'
import LoadingState from '@/components/LoadingState'
import PageHeader from '@/components/PageHeader'
import useResolver from '@/hooks/legacy/use-resolver'
import SummaryKpis, { type KpiDefinition } from '../components/SummaryKpis'
import SummaryListPanels, { type ListPanelDefinition } from '../components/SummaryListPanels'
import type { AdministrationKpiKey, AdministrationPanelKey } from '../dashboard.schema'
import { resolveAdministrationSummary } from './resolvers'

const KPIS: KpiDefinition<AdministrationKpiKey>[] = [
  { key: 'activeUsers', label: 'Usuarios activos', icon: 'users', tone: 'green' },
  { key: 'roles', label: 'Roles definidos', icon: 'shield-check', tone: 'blue' },
  { key: 'todayLogins', label: 'Accesos de hoy', icon: 'log-in', tone: 'sub' },
  { key: 'enabledModules', label: 'Módulos habilitados', icon: 'layout-grid', tone: 'green' },
]

const PANELS: ListPanelDefinition<AdministrationPanelKey>[] = [
  { key: 'rolePermissions', title: 'Permisos por rol', icon: 'shield-check', tone: 'blue' },
  { key: 'recentLogins', title: 'Accesos recientes', icon: 'log-in', tone: 'sub' },
]

export default function AdministrationSummaryPage() {
  const { data, error, isLoading } = useResolver(resolveAdministrationSummary, {})

  return (
    <>
      <PageHeader
        title="Administración"
        description="Gobierno del sistema: usuarios, perfiles y roles, y la configuración que rige a todos los módulos."
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
