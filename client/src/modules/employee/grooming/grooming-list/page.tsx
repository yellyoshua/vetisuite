import DataTable, { type DataTableColumn } from '@/components/DataTable/DataTable'
import DataTableToolbar, { type FilterOption, type ToolbarSelect } from '@/components/DataTable/DataTableToolbar'
import FilterPresets from '@/components/DataTable/FilterPresets'
import IdentityCell from '@/components/DataTable/IdentityCell'
import RowActions from '@/components/DataTable/RowActions'
import PageHeader from '@/components/PageHeader'
import Badge from '@/components/legacy-ui/Badge'
import Button from '@/components/legacy-ui/Button'
import Icon from '@/components/legacy-ui/Icon'
import { GROOMING_STATUS_LABELS, GROOMING_STATUS_TONES } from '@/constants/grooming'
import useListQuery from '@/hooks/use-list-query'
import useResolver from '@/hooks/legacy/use-resolver'
import type { GroomingFilterKey, GroomingService } from '../grooming.schema'
import { resolveGroomingList } from './resolvers'

const FILTER_KEYS: GroomingFilterKey[] = ['status', 'preset']

const TABLE_MIN_WIDTH = 920

const STATUS_SELECT: ToolbarSelect<GroomingFilterKey> = {
  key: 'status',
  label: 'Estado',
  options: [
    { value: '', label: 'Todos los estados' },
    { value: 'pending', label: 'Pendiente' },
    { value: 'in-progress', label: 'Proceso' },
    { value: 'finished', label: 'Terminado' },
    { value: 'delivered', label: 'Entregado' },
  ],
}

const PRESET_OPTIONS: FilterOption[] = [
  { value: '', label: 'Todo' },
  { value: 'undelivered', label: 'Sin entregar' },
  { value: 'delivered', label: 'Entregados' },
]

const COLUMNS: DataTableColumn<GroomingService>[] = [
  {
    key: 'patient',
    header: 'Paciente',
    render: (service) => <IdentityCell title={service.patientName} subtitle={service.ownerName} />,
  },
  { key: 'service', header: 'Servicio', render: (service) => service.serviceName },
  { key: 'stylist', header: 'Estilista', render: (service) => service.stylistName },
  { key: 'checkIn', header: 'Ingreso', render: (service) => service.checkInTime },
  {
    key: 'status',
    header: 'Estado',
    render: (service) => (
      <Badge tone={GROOMING_STATUS_TONES[service.status]}>{GROOMING_STATUS_LABELS[service.status]}</Badge>
    ),
  },
  {
    key: 'actions',
    header: 'Acciones',
    align: 'right',
    isHeaderHidden: true,
    render: (service) => <RowActions subject={`${service.serviceName} de ${service.patientName}`} />,
  },
]

export default function GroomingListPage() {
  const { query, setPage, setSearch, setFilter } = useListQuery(FILTER_KEYS)
  const { data, error, isLoading } = useResolver(resolveGroomingList, query)

  return (
    <>
      <PageHeader
        title="Peluquería y Estética"
        description="Servicios de estética del día, con su responsable y estado."
        actions={
          <Button isDisabled>
            <Icon name="plus" size={14} /> Nuevo check-in
          </Button>
        }
      />
      <DataTableToolbar
        searchPlaceholder="Busca por paciente o dueño…"
        search={query.search}
        selects={[STATUS_SELECT]}
        filters={query.filters}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
      />
      <FilterPresets
        label="Filtros rápidos de peluquería"
        presets={PRESET_OPTIONS}
        activeValue={query.filters.preset}
        count={data && { shown: data.rows.length, total: data.total }}
        onChange={(preset) => setFilter('preset', preset)}
      />
      <DataTable
        label="Servicios de peluquería y estética"
        columns={COLUMNS}
        data={data}
        error={error}
        isLoading={isLoading}
        pageSize={query.pageSize}
        minWidth={TABLE_MIN_WIDTH}
        rowKey={(service) => service.id}
        onPageChange={setPage}
      />
    </>
  )
}
