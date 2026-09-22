import DataTable, { type DataTableColumn } from '@/components/DataTable/DataTable'
import DataTableToolbar, { type FilterOption, type ToolbarSelect } from '@/components/DataTable/DataTableToolbar'
import FilterPresets from '@/components/DataTable/FilterPresets'
import IdentityCell from '@/components/DataTable/IdentityCell'
import RowActions from '@/components/DataTable/RowActions'
import PageHeader from '@/components/PageHeader'
import Badge from '@/components/legacy-ui/Badge'
import Button from '@/components/legacy-ui/Button'
import Icon from '@/components/legacy-ui/Icon'
import {
  PRODUCT_CATEGORY_LABELS,
  PRODUCT_CATEGORY_VALUES,
  PRODUCT_STATUS_LABELS,
  PRODUCT_STATUS_TONES,
} from '@/constants/inventory'
import useListQuery from '@/hooks/use-list-query'
import useResolver from '@/hooks/legacy/use-resolver'
import { formatCurrency } from '@/lib/format-currency'
import { formatDate } from '@/lib/format-date'
import type { Product, ProductFilterKey } from '../inventory.schema'
import { resolveProductsList } from './resolvers'

const FILTER_KEYS: ProductFilterKey[] = ['category', 'preset']

const TABLE_MIN_WIDTH = 940

const CATEGORY_SELECT: ToolbarSelect<ProductFilterKey> = {
  key: 'category',
  label: 'Categoría',
  options: [
    { value: '', label: 'Todas las categorías' },
    ...PRODUCT_CATEGORY_VALUES.map((value) => ({ value, label: PRODUCT_CATEGORY_LABELS[value] })),
  ],
}

const PRESET_OPTIONS: FilterOption[] = [
  { value: '', label: 'Todo' },
  { value: 'low-stock', label: 'Stock bajo' },
  { value: 'expiring', label: 'Por caducar' },
  { value: 'no-movement', label: 'Sin movimiento' },
]

const COLUMNS: DataTableColumn<Product>[] = [
  {
    key: 'product',
    header: 'Producto',
    render: (product) => <IdentityCell title={product.name} subtitle={PRODUCT_CATEGORY_LABELS[product.category]} />,
  },
  { key: 'price', header: 'Precio', render: (product) => formatCurrency(product.price) },
  { key: 'stock', header: 'Stock', render: (product) => `${product.stock} / mín. ${product.minStock}` },
  {
    key: 'expiresAt',
    header: 'Caducidad',
    render: (product) => (product.expiresAt ? formatDate(product.expiresAt) : '—'),
  },
  {
    key: 'status',
    header: 'Estado',
    render: (product) => <Badge tone={PRODUCT_STATUS_TONES[product.status]}>{PRODUCT_STATUS_LABELS[product.status]}</Badge>,
  },
  {
    key: 'actions',
    header: 'Acciones',
    align: 'right',
    isHeaderHidden: true,
    render: (product) => <RowActions subject={product.name} />,
  },
]

export default function InventoryListPage() {
  const { query, setPage, setSearch, setFilter } = useListQuery(FILTER_KEYS)
  const { data, error, isLoading } = useResolver(resolveProductsList, query)

  return (
    <>
      <PageHeader
        title="Catálogo"
        description="Productos, precio de venta y stock mínimo. Es la única fuente de precios que consumen los demás módulos."
        actions={
          <>
            <Button variant="ghost" isDisabled>
              <Icon name="download" size={14} /> Exportar
            </Button>
            <Button isDisabled>
              <Icon name="plus" size={14} /> Nuevo producto
            </Button>
          </>
        }
      />
      <DataTableToolbar
        searchPlaceholder="Busca un producto…"
        search={query.search}
        selects={[CATEGORY_SELECT]}
        filters={query.filters}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
      />
      <FilterPresets
        label="Filtros rápidos del catálogo"
        presets={PRESET_OPTIONS}
        activeValue={query.filters.preset}
        count={data && { shown: data.rows.length, total: data.total }}
        onChange={(preset) => setFilter('preset', preset)}
      />
      <DataTable
        label="Catálogo de productos"
        columns={COLUMNS}
        data={data}
        error={error}
        isLoading={isLoading}
        pageSize={query.pageSize}
        minWidth={TABLE_MIN_WIDTH}
        rowKey={(product) => product.id}
        onPageChange={setPage}
      />
    </>
  )
}
