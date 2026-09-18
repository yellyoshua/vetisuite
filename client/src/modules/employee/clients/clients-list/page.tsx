import DataTable, { type DataTableColumn } from '@/components/DataTable/DataTable'
import DataTableToolbar, { type FilterOption, type ToolbarSelect } from '@/components/DataTable/DataTableToolbar'
import FilterPresets from '@/components/DataTable/FilterPresets'
import IdentityCell from '@/components/DataTable/IdentityCell'
import RowActions from '@/components/DataTable/RowActions'
import PageHeader from '@/components/PageHeader'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import ButtonLink from '@/components/ui/ButtonLink'
import Icon from '@/components/ui/Icon'
import { CLIENT_STATUS_LABELS, CLIENT_STATUS_TONES } from '@/constants/clients'
import useListQuery from '@/hooks/use-list-query'
import useResolver from '@/hooks/use-resolver'
import { formatDate } from '@/lib/format-date'
import type { Client, ClientFilterKey } from '../clients.schema'
import { resolveClientsList } from './resolvers'

const FILTER_KEYS: ClientFilterKey[] = ['status', 'preset']

const TABLE_MIN_WIDTH = 1020

const STATUS_SELECT: ToolbarSelect<ClientFilterKey> = {
  key: 'status',
  label: 'Estado',
  options: [
    { value: '', label: 'Todos los estados' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
  ],
}

const PRESET_OPTIONS: FilterOption[] = [
  { value: '', label: 'Todos' },
  { value: 'open-account', label: 'Con cuenta abierta' },
  { value: 'new-this-month', label: 'Nuevos este mes' },
  { value: 'no-recent-visit', label: 'Sin visita en 6 meses' },
]

const COLUMNS: DataTableColumn<Client>[] = [
  {
    key: 'client',
    header: 'Cliente',
    render: (client) => <IdentityCell title={client.name} subtitle={`CI ${client.nationalId}`} />,
  },
  { key: 'pets', header: 'Mascotas', render: (client) => client.petNames.join(', ') },
  { key: 'phone', header: 'Teléfono', render: (client) => client.phone },
  { key: 'email', header: 'Correo', render: (client) => client.email || '—' },
  {
    key: 'lastVisit',
    header: 'Última visita',
    render: (client) => (client.lastVisitAt ? formatDate(client.lastVisitAt) : 'Sin visitas'),
  },
  {
    key: 'status',
    header: 'Estado',
    render: (client) => <Badge tone={CLIENT_STATUS_TONES[client.status]}>{CLIENT_STATUS_LABELS[client.status]}</Badge>,
  },
  {
    key: 'actions',
    header: 'Acciones',
    align: 'right',
    isHeaderHidden: true,
    render: (client) => (
      <RowActions subject={client.name} viewTo={`/clients/${client.id}/patients`} editTo={`/clients/${client.id}/edit`} />
    ),
  },
]

export default function ClientsListPage() {
  const { query, setPage, setSearch, setFilter } = useListQuery(FILTER_KEYS)
  const { data, error, isLoading } = useResolver(resolveClientsList, query)

  return (
    <>
      <PageHeader
        title="Clientes y Pacientes"
        description="Dueños y sus mascotas. Es la misma pantalla en todos los módulos: el nombre queda fijo al desplazar la tabla."
        actions={
          <>
            <Button variant="ghost" isDisabled>
              <Icon name="download" size={14} /> Exportar
            </Button>
            <ButtonLink to="/clients/create">
              <Icon name="plus" size={14} /> Nuevo cliente
            </ButtonLink>
          </>
        }
      />
      <DataTableToolbar
        searchPlaceholder="Busca por nombre, cédula o mascota…"
        search={query.search}
        selects={[STATUS_SELECT]}
        filters={query.filters}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
      />
      <FilterPresets
        label="Filtros rápidos de clientes"
        presets={PRESET_OPTIONS}
        activeValue={query.filters.preset}
        count={data && { shown: data.rows.length, total: data.total }}
        onChange={(preset) => setFilter('preset', preset)}
      />
      <DataTable
        label="Clientes"
        columns={COLUMNS}
        data={data}
        error={error}
        isLoading={isLoading}
        pageSize={query.pageSize}
        minWidth={TABLE_MIN_WIDTH}
        rowKey={(client) => client.id}
        onPageChange={setPage}
      />
    </>
  )
}
