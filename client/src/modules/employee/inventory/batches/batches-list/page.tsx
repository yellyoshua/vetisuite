import DataTable, { type DataTableColumn } from '@/components/DataTable/DataTable'
import DataTableToolbar, { type FilterOption, type ToolbarSelect } from '@/components/DataTable/DataTableToolbar'
import FilterPresets from '@/components/DataTable/FilterPresets'
import IdentityCell from '@/components/DataTable/IdentityCell'
import RowActions from '@/components/DataTable/RowActions'
import PageHeader from '@/components/PageHeader'
import Badge from '@/components/legacy-ui/Badge'
import Button from '@/components/legacy-ui/Button'
import Icon from '@/components/legacy-ui/Icon'
import { EXPIRY_STATUS_LABELS, EXPIRY_STATUS_TONES, PRODUCT_CATEGORY_LABELS } from '@/constants/inventory'
import useListQuery from '@/hooks/use-list-query'
import useResolver from '@/hooks/legacy/use-resolver'
import { formatDate } from '@/lib/format-date'
import type { Batch, BatchFilterKey } from '../batches.schema'
import { resolveBatchesList } from './resolvers'

const FILTER_KEYS: BatchFilterKey[] = ['status']

const TABLE_MIN_WIDTH = 1000

const STATUS_SELECT: ToolbarSelect<BatchFilterKey> = {
  key: 'status',
  label: 'Estado del lote',
  options: [
    { value: '', label: 'Todos los lotes' },
    { value: 'valid', label: 'Vigentes' },
    { value: 'expiring', label: 'Por caducar' },
    { value: 'expired', label: 'Vencidos' },
  ],
}

const PRESET_OPTIONS: FilterOption[] = [
  { value: '', label: 'Todos' },
  { value: 'expiring', label: 'Por caducar' },
  { value: 'expired', label: 'Vencidos' },
]

const COLUMNS: DataTableColumn<Batch>[] = [
  {
    key: 'product',
    header: 'Producto',
    render: (batch) => <IdentityCell title={batch.productName} subtitle={PRODUCT_CATEGORY_LABELS[batch.category]} />,
  },
  { key: 'code', header: 'Lote', render: (batch) => batch.code },
  { key: 'quantity', header: 'Cantidad', render: (batch) => batch.quantity },
  { key: 'receivedAt', header: 'Ingreso', render: (batch) => formatDate(batch.receivedAt) },
  { key: 'expiresAt', header: 'Caducidad', render: (batch) => formatDate(batch.expiresAt) },
  {
    key: 'status',
    header: 'Estado',
    render: (batch) => <Badge tone={EXPIRY_STATUS_TONES[batch.status]}>{EXPIRY_STATUS_LABELS[batch.status]}</Badge>,
  },
  {
    key: 'actions',
    header: 'Acciones',
    align: 'right',
    isHeaderHidden: true,
    render: (batch) => <RowActions subject={`${batch.productName} ${batch.code}`} />,
  },
]

export default function BatchesListPage() {
  const { query, setPage, setSearch, setFilter } = useListQuery(FILTER_KEYS)
  const { data, error, isLoading } = useResolver(resolveBatchesList, query)

  return (
    <>
      <PageHeader
        title="Lotes y caducidad"
        description="Cada ingreso entra como lote con su fecha de caducidad; el stock del catálogo es la suma de los lotes vigentes."
        actions={
          <Button isDisabled>
            <Icon name="plus" size={14} /> Ingresar lote
          </Button>
        }
      />
      <DataTableToolbar
        searchPlaceholder="Busca por producto o lote…"
        search={query.search}
        selects={[STATUS_SELECT]}
        filters={query.filters}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
      />
      <FilterPresets
        label="Filtros rápidos de lotes"
        presets={PRESET_OPTIONS}
        activeValue={query.filters.status}
        count={data && { shown: data.rows.length, total: data.total }}
        onChange={(status) => setFilter('status', status)}
      />
      <DataTable
        label="Lotes y caducidad"
        columns={COLUMNS}
        data={data}
        error={error}
        isLoading={isLoading}
        pageSize={query.pageSize}
        minWidth={TABLE_MIN_WIDTH}
        rowKey={(batch) => batch.id}
        onPageChange={setPage}
      />
    </>
  )
}
