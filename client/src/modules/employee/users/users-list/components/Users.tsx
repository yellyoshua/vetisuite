import { PlusIcon, SearchIcon } from 'lucide-react'
import useQueryParams from '@/hooks/use-query-params'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import CustomTable from '@/components/CustomTable/CustomTable'
import FilterChips from '@/components/FilterChips/FilterChips'
import OptionSelect, { type SelectOption } from '@/components/OptionSelect/OptionSelect'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BADGE_TONE_CLASS_NAMES } from '@/constants/badge-tones'
import { USER_ROLE_LABELS, USER_ROLE_VALUES, USER_STATUS_LABELS, USER_STATUS_TONES } from '@/constants/users'
import type { UserListRow } from '@/modules/employee/users/users.schema'

type UsersProps = {
  users: UserListRow[]
}

const ROLE_OPTIONS: SelectOption[] = [
  { value: '', label: 'Todos los roles' },
  ...USER_ROLE_VALUES.map((role) => ({ value: role, label: USER_ROLE_LABELS[role] })),
]

const PRESET_OPTIONS: SelectOption[] = [
  { value: '', label: 'Todos' },
  { value: 'active', label: 'Activos' },
  { value: 'suspended', label: 'Suspendidos' },
]

export default function Users({ users }: UsersProps) {
  const { nextPage, prevPage, search, changeQuery, query } = useQueryParams()
  const currentPage = Number(query.page) || 1

  return (
    <CustomPage
      title="Usuarios y roles"
      description="Quién entra al sistema, con qué perfil y a qué módulos puede acceder cada rol."
      actions={
        <>
          <Button disabled>
            <PlusIcon /> Nuevo usuario
          </Button>
        </>
      }
    >
      <CustomPageContainer className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input
              type="text"
              aria-label="Buscar usuarios"
              placeholder="Busca por nombre o correo…"
              defaultValue={query.search || ''}
              onChange={({ target }) => search(target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-lg text-foreground"
            />
          </div>
          <OptionSelect label="Rol" value={query.role || ''} options={ROLE_OPTIONS} onChange={(role) => changeQuery({ role, page: null })} />
        </div>
        <FilterChips label="Filtros rápidos de usuarios" options={PRESET_OPTIONS} value={query.status || ''} onChange={(status) => changeQuery({ status, page: null })} />
      </CustomPageContainer>

      <CustomTable dataSize={users.length} currentPage={currentPage} nextPage={nextPage} prevPage={prevPage}>
        <CustomTable.Thead>
          <CustomTable.TableRow header={true}>
            <CustomTable.TheadItem>Usuario</CustomTable.TheadItem>
            <CustomTable.TheadItem>Rol</CustomTable.TheadItem>
            <CustomTable.TheadItem>Módulos</CustomTable.TheadItem>
            <CustomTable.TheadItem>Último acceso</CustomTable.TheadItem>
            <CustomTable.TheadItem>Estado</CustomTable.TheadItem>
          </CustomTable.TableRow>
        </CustomTable.Thead>
        <CustomTable.TBody>
          {users.map((user) => (
            <CustomTable.TableRow key={user.id}>
              <CustomTable.TBodyItem><span className="flex flex-col"><span className="font-medium">{user.name}</span><span className="text-sub">{user.email}</span></span></CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{USER_ROLE_LABELS[user.role]}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{user.moduleNames.join(', ')}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem>{user.lastAccessLabel}</CustomTable.TBodyItem>
              <CustomTable.TBodyItem><Badge variant="outline" className={BADGE_TONE_CLASS_NAMES[USER_STATUS_TONES[user.status]]}>{USER_STATUS_LABELS[user.status]}</Badge></CustomTable.TBodyItem>
            </CustomTable.TableRow>
          ))}
        </CustomTable.TBody>
      </CustomTable>
    </CustomPage>
  )
}
