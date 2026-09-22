import DataTable, { type DataTableColumn } from '@/components/DataTable/DataTable'
import DataTableToolbar, { type FilterOption, type ToolbarSelect } from '@/components/DataTable/DataTableToolbar'
import FilterPresets from '@/components/DataTable/FilterPresets'
import IdentityCell from '@/components/DataTable/IdentityCell'
import RowActions from '@/components/DataTable/RowActions'
import PageHeader from '@/components/PageHeader'
import Badge from '@/components/legacy-ui/Badge'
import Button from '@/components/legacy-ui/Button'
import Icon from '@/components/legacy-ui/Icon'
import { PORTAL_STATUS_LABELS, PORTAL_STATUS_TONES, PORTAL_TYPE_LABELS, PORTAL_TYPE_VALUES } from '@/constants/portals'
import useListQuery from '@/hooks/use-list-query'
import useResolver from '@/hooks/legacy/use-resolver'
import type { Portal, PortalFilterKey } from '../portals.schema'
import { resolvePortalsList } from './resolvers'

const FILTER_KEYS: PortalFilterKey[] = ['type', 'preset']

const TABLE_MIN_WIDTH = 940

const SPACE_GROUPED_NUMBER = new Intl.NumberFormat('fr-FR')

const TYPE_SELECT: ToolbarSelect<PortalFilterKey> = {
  key: 'type',
  label: 'Tipo',
  options: [
    { value: '', label: 'Todos los tipos' },
    ...PORTAL_TYPE_VALUES.map((value) => ({ value, label: PORTAL_TYPE_LABELS[value] })),
  ],
}

const PRESET_OPTIONS: FilterOption[] = [
  { value: '', label: 'Todos' },
  { value: 'published', label: 'Publicados' },
  { value: 'drafts', label: 'Borradores' },
]

const COLUMNS: DataTableColumn<Portal>[] = [
  {
    key: 'portal',
    header: 'Portal',
    render: (portal) => <IdentityCell title={portal.name} subtitle={portal.url} />,
  },
  { key: 'type', header: 'Tipo', render: (portal) => PORTAL_TYPE_LABELS[portal.type] },
  {
    key: 'visits',
    header: 'Visitas (30 d)',
    render: (portal) => SPACE_GROUPED_NUMBER.format(portal.visitsLast30Days),
  },
  {
    key: 'appointments',
    header: 'Citas agendadas',
    render: (portal) => SPACE_GROUPED_NUMBER.format(portal.bookedAppointments),
  },
  {
    key: 'status',
    header: 'Estado',
    render: (portal) => <Badge tone={PORTAL_STATUS_TONES[portal.status]}>{PORTAL_STATUS_LABELS[portal.status]}</Badge>,
  },
  {
    key: 'actions',
    header: 'Acciones',
    align: 'right',
    isHeaderHidden: true,
    render: (portal) => <RowActions subject={portal.name} />,
  },
]

export default function PortalsListPage() {
  const { query, setPage, setSearch, setFilter } = useListQuery(FILTER_KEYS)
  const { data, error, isLoading } = useResolver(resolvePortalsList, query)

  return (
    <>
      <PageHeader
        title="Portales"
        description="Páginas por las que entran las visitas y las reservas de cita."
        actions={
          <Button isDisabled>
            <Icon name="plus" size={14} /> Nuevo portal
          </Button>
        }
      />
      <DataTableToolbar
        searchPlaceholder="Busca un portal…"
        search={query.search}
        selects={[TYPE_SELECT]}
        filters={query.filters}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
      />
      <FilterPresets
        label="Filtros rápidos de portales"
        presets={PRESET_OPTIONS}
        activeValue={query.filters.preset}
        count={data && { shown: data.rows.length, total: data.total }}
        onChange={(preset) => setFilter('preset', preset)}
      />
      <DataTable
        label="Portales"
        columns={COLUMNS}
        data={data}
        error={error}
        isLoading={isLoading}
        pageSize={query.pageSize}
        minWidth={TABLE_MIN_WIDTH}
        rowKey={(portal) => portal.id}
        onPageChange={setPage}
      />
    </>
  )
}
