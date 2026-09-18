import DataTable, { type DataTableColumn } from '@/components/DataTable/DataTable'
import DataTableToolbar, { type FilterOption, type ToolbarSelect } from '@/components/DataTable/DataTableToolbar'
import FilterPresets from '@/components/DataTable/FilterPresets'
import IdentityCell from '@/components/DataTable/IdentityCell'
import RowActions from '@/components/DataTable/RowActions'
import PageHeader from '@/components/PageHeader'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Icon from '@/components/ui/Icon'
import { BILLING_DOCUMENT_KIND_LABELS, BILLING_STATUS_LABELS, BILLING_STATUS_TONES } from '@/constants/billing'
import useListQuery from '@/hooks/use-list-query'
import useResolver from '@/hooks/use-resolver'
import { formatCurrency } from '@/lib/format-currency'
import { formatDate } from '@/lib/format-date'
import type { BillingDocument, BillingFilterKey } from '../billing.schema'
import { resolveBillingList } from './resolvers'

const FILTER_KEYS: BillingFilterKey[] = ['status', 'preset']

const TABLE_MIN_WIDTH = 920

const STATUS_SELECT: ToolbarSelect<BillingFilterKey> = {
  key: 'status',
  label: 'Estado',
  options: [
    { value: '', label: 'Todo' },
    { value: 'open', label: 'Cuentas abiertas' },
    { value: 'receivable', label: 'Por cobrar' },
    { value: 'paid', label: 'Pagadas' },
  ],
}

const PRESET_OPTIONS: FilterOption[] = [
  { value: '', label: 'Todo' },
  { value: 'open-account', label: 'Cuentas abiertas' },
  { value: 'overdue', label: 'Vencidas' },
  { value: 'paid-today', label: 'Pagadas hoy' },
]

function formatReference(billingDocument: BillingDocument): string {
  return `${BILLING_DOCUMENT_KIND_LABELS[billingDocument.kind]} ${billingDocument.number}`
}

function formatChargeCount(chargeCount: number): string {
  return `${chargeCount} ${chargeCount === 1 ? 'cargo' : 'cargos'}`
}

const COLUMNS: DataTableColumn<BillingDocument>[] = [
  {
    key: 'client',
    header: 'Cliente',
    render: (billingDocument) => (
      <IdentityCell title={billingDocument.clientName} subtitle={formatReference(billingDocument)} />
    ),
  },
  { key: 'charges', header: 'Cargos', render: (billingDocument) => formatChargeCount(billingDocument.chargeCount) },
  { key: 'total', header: 'Total', render: (billingDocument) => formatCurrency(billingDocument.total) },
  { key: 'date', header: 'Fecha', render: (billingDocument) => formatDate(billingDocument.createdAt) },
  {
    key: 'status',
    header: 'Estado',
    render: (billingDocument) => (
      <Badge tone={BILLING_STATUS_TONES[billingDocument.status]}>{BILLING_STATUS_LABELS[billingDocument.status]}</Badge>
    ),
  },
  {
    key: 'actions',
    header: 'Acciones',
    align: 'right',
    isHeaderHidden: true,
    render: (billingDocument) => (
      <RowActions subject={`${formatReference(billingDocument)} de ${billingDocument.clientName}`} />
    ),
  },
]

export default function BillingListPage() {
  const { query, setPage, setSearch, setFilter } = useListQuery(FILTER_KEYS)
  const { data, error, isLoading } = useResolver(resolveBillingList, query)

  return (
    <>
      <PageHeader
        title="Cuentas y facturas"
        description="Cierre del cliente: los cargos que dejaron los módulos de atención se agrupan, se facturan y se cobran aquí."
        actions={
          <>
            <Button variant="ghost" isDisabled>
              <Icon name="download" size={14} /> Exportar
            </Button>
            <Button isDisabled>
              <Icon name="plus" size={14} /> Nueva factura
            </Button>
          </>
        }
      />
      <DataTableToolbar
        searchPlaceholder="Busca por cliente o factura…"
        search={query.search}
        selects={[STATUS_SELECT]}
        filters={query.filters}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
      />
      <FilterPresets
        label="Filtros rápidos de cuentas y facturas"
        presets={PRESET_OPTIONS}
        activeValue={query.filters.preset}
        count={data && { shown: data.rows.length, total: data.total }}
        onChange={(preset) => setFilter('preset', preset)}
      />
      <DataTable
        label="Cuentas y facturas"
        columns={COLUMNS}
        data={data}
        error={error}
        isLoading={isLoading}
        pageSize={query.pageSize}
        minWidth={TABLE_MIN_WIDTH}
        rowKey={(billingDocument) => billingDocument.id}
        onPageChange={setPage}
      />
    </>
  )
}
