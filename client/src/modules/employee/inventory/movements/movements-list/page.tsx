import DataTable, { type DataTableColumn } from '@/components/DataTable/DataTable'
import DataTableToolbar, { type FilterOption, type ToolbarSelect } from '@/components/DataTable/DataTableToolbar'
import FilterPresets from '@/components/DataTable/FilterPresets'
import IdentityCell from '@/components/DataTable/IdentityCell'
import RowActions from '@/components/DataTable/RowActions'
import PageHeader from '@/components/PageHeader'
import Badge from '@/components/legacy-ui/Badge'
import Button from '@/components/legacy-ui/Button'
import Icon from '@/components/legacy-ui/Icon'
import { MOVEMENT_TYPE_LABELS, MOVEMENT_TYPE_SIGNS, MOVEMENT_TYPE_TONES } from '@/constants/inventory'
import useListQuery from '@/hooks/use-list-query'
import useResolver from '@/hooks/legacy/use-resolver'
import { formatDate } from '@/lib/format-date'
import type { Movement, MovementFilterKey } from '../movements.schema'
import { resolveMovementsList } from './resolvers'

const FILTER_KEYS: MovementFilterKey[] = ['type']

const TABLE_MIN_WIDTH = 1080

const TYPE_SELECT: ToolbarSelect<MovementFilterKey> = {
  key: 'type',
  label: 'Tipo de movimiento',
  options: [
    { value: '', label: 'Todos los movimientos' },
    { value: 'in', label: 'Entradas' },
    { value: 'out', label: 'Salidas' },
    { value: 'write-off', label: 'Bajas' },
  ],
}

const PRESET_OPTIONS: FilterOption[] = [
  { value: '', label: 'Todo' },
  { value: 'in', label: 'Entradas' },
  { value: 'out', label: 'Salidas' },
  { value: 'write-off', label: 'Bajas' },
]

const COLUMNS: DataTableColumn<Movement>[] = [
  {
    key: 'product',
    header: 'Producto',
    render: (movement) => <IdentityCell title={movement.productName} subtitle={movement.batchCode} />,
  },
  {
    key: 'type',
    header: 'Movimiento',
    render: (movement) => <Badge tone={MOVEMENT_TYPE_TONES[movement.type]}>{MOVEMENT_TYPE_LABELS[movement.type]}</Badge>,
  },
  {
    key: 'quantity',
    header: 'Cantidad',
    render: (movement) => `${MOVEMENT_TYPE_SIGNS[movement.type]}${movement.quantity}`,
  },
  { key: 'destination', header: 'Destino', render: (movement) => movement.destination },
  { key: 'date', header: 'Fecha', render: (movement) => `${formatDate(movement.date)} · ${movement.time}` },
  { key: 'responsible', header: 'Responsable', render: (movement) => movement.responsibleName },
  {
    key: 'actions',
    header: 'Acciones',
    align: 'right',
    isHeaderHidden: true,
    render: (movement) => <RowActions subject={`${movement.productName} ${movement.batchCode}`} />,
  },
]

export default function MovementsListPage() {
  const { query, setPage, setSearch, setFilter } = useListQuery(FILTER_KEYS)
  const { data, error, isLoading } = useResolver(resolveMovementsList, query)

  return (
    <>
      <PageHeader
        title="Movimientos"
        description="Entradas y salidas. Una salida a una visita crea el cargo que Facturación cobrará después."
        actions={
          <>
            <Button variant="ghost" isDisabled>
              <Icon name="download" size={14} /> Exportar
            </Button>
            <Button isDisabled>
              <Icon name="plus" size={14} /> Nuevo movimiento
            </Button>
          </>
        }
      />
      <DataTableToolbar
        searchPlaceholder="Busca por producto o destino…"
        search={query.search}
        selects={[TYPE_SELECT]}
        filters={query.filters}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
      />
      <FilterPresets
        label="Filtros rápidos de movimientos"
        presets={PRESET_OPTIONS}
        activeValue={query.filters.type}
        count={data && { shown: data.rows.length, total: data.total }}
        onChange={(type) => setFilter('type', type)}
      />
      <DataTable
        label="Movimientos de inventario"
        columns={COLUMNS}
        data={data}
        error={error}
        isLoading={isLoading}
        pageSize={query.pageSize}
        minWidth={TABLE_MIN_WIDTH}
        rowKey={(movement) => movement.id}
        onPageChange={setPage}
      />
    </>
  )
}
