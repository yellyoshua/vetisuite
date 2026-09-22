import DataTable, { type DataTableColumn } from '@/components/DataTable/DataTable'
import DataTableToolbar, { type FilterOption, type ToolbarSelect } from '@/components/DataTable/DataTableToolbar'
import FilterPresets from '@/components/DataTable/FilterPresets'
import IdentityCell from '@/components/DataTable/IdentityCell'
import RowActions from '@/components/DataTable/RowActions'
import PageHeader from '@/components/PageHeader'
import Badge from '@/components/legacy-ui/Badge'
import Button from '@/components/legacy-ui/Button'
import Icon from '@/components/legacy-ui/Icon'
import { USER_ROLE_LABELS, USER_ROLE_VALUES, USER_STATUS_LABELS, USER_STATUS_TONES } from '@/constants/users'
import useListQuery from '@/hooks/use-list-query'
import useResolver from '@/hooks/legacy/use-resolver'
import type { UserFilterKey, UserListRow } from '../users.schema'
import { resolveUsersList } from './resolvers'

const FILTER_KEYS: UserFilterKey[] = ['role', 'status']

const TABLE_MIN_WIDTH = 980

const ROLE_SELECT: ToolbarSelect<UserFilterKey> = {
  key: 'role',
  label: 'Rol',
  options: [
    { value: '', label: 'Todos los roles' },
    ...USER_ROLE_VALUES.map((role) => ({ value: role, label: USER_ROLE_LABELS[role] })),
  ],
}

const STATUS_PRESETS: FilterOption[] = [
  { value: '', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'suspended', label: 'Suspendidos' },
]

const COLUMNS: DataTableColumn<UserListRow>[] = [
  {
    key: 'user',
    header: 'Usuario',
    render: (user) => <IdentityCell title={user.name} subtitle={user.email} />,
  },
  { key: 'role', header: 'Rol', render: (user) => USER_ROLE_LABELS[user.role] },
  { key: 'modules', header: 'Módulos', render: (user) => user.moduleNames.join(', ') },
  { key: 'lastAccess', header: 'Último acceso', render: (user) => user.lastAccessLabel },
  {
    key: 'status',
    header: 'Estado',
    render: (user) => <Badge tone={USER_STATUS_TONES[user.status]}>{USER_STATUS_LABELS[user.status]}</Badge>,
  },
  {
    key: 'actions',
    header: 'Acciones',
    align: 'right',
    isHeaderHidden: true,
    render: (user) => <RowActions subject={user.name} />,
  },
]

export default function UsersListPage() {
  const { query, setPage, setSearch, setFilter } = useListQuery(FILTER_KEYS)
  const { data, error, isLoading } = useResolver(resolveUsersList, query)

  return (
    <>
      <PageHeader
        title="Usuarios y roles"
        description="Quién entra al sistema, con qué perfil y a qué módulos puede acceder cada rol."
        actions={
          <Button isDisabled>
            <Icon name="plus" size={14} /> Nuevo usuario
          </Button>
        }
      />
      <DataTableToolbar
        searchPlaceholder="Busca por nombre o correo…"
        search={query.search}
        selects={[ROLE_SELECT]}
        filters={query.filters}
        onSearchChange={setSearch}
        onFilterChange={setFilter}
      />
      <FilterPresets
        label="Filtros rápidos de usuarios"
        presets={STATUS_PRESETS}
        activeValue={query.filters.status}
        count={data && { shown: data.rows.length, total: data.total }}
        onChange={(status) => setFilter('status', status)}
      />
      <DataTable
        label="Usuarios"
        columns={COLUMNS}
        data={data}
        error={error}
        isLoading={isLoading}
        pageSize={query.pageSize}
        minWidth={TABLE_MIN_WIDTH}
        rowKey={(user) => user.id}
        onPageChange={setPage}
      />
    </>
  )
}
