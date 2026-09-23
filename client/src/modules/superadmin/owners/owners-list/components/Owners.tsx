import { Link } from 'react-router'
import { BadgeCheckIcon, KeyRoundIcon, LockIcon, LockOpenIcon, PencilIcon, PlusIcon, SearchIcon } from 'lucide-react'
import useQueryParams from '@/hooks/use-query-params'
import { useOpenModal } from '@/components/modalWrapper'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import CustomTable from '@/components/CustomTable/CustomTable'
import CustomTooltip from '@/components/CustomTooltip/CustomTooltip'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { OWNERS_DISABLE_MODAL } from '@/constants/modals'
import { formatDate } from '@/lib/date'
import { getInitials, getPictureSrc } from '@/lib/utils'
import type { Owner } from '@/modules/superadmin/owners/owners.schema'
import OwnersDisableModal from '../../components/OwnersDisableModal'

type OwnersProps = {
  owners: Owner[]
  refetch: () => void
}

export default function Owners({ owners, refetch }: OwnersProps) {
  const { nextPage, prevPage, search, query } = useQueryParams()
  const openModal = useOpenModal()
  const currentPage = Number(query.page) || 1

  return (
    <CustomPage
      title="Dueños"
      description="Gestiona los dueños de las clínicas registradas en la plataforma"
      actions={
        <Link to="/owners/create" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <PlusIcon className="w-5 h-5" />
          Crear Dueño
        </Link>
      }
    >
      <CustomPageContainer>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

          <input
            type="text"
            aria-label="Buscar dueños"
            placeholder="Buscar por nombre o apellido..."
            defaultValue={query.search || ''}
            onChange={({ target }) => search(target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
        </div>
      </CustomPageContainer>

      <CustomTable dataSize={owners.length} currentPage={currentPage} nextPage={nextPage} prevPage={prevPage}>
        <CustomTable.Thead>
          <CustomTable.TableRow header={true}>
            <CustomTable.TheadItem>Creado</CustomTable.TheadItem>
            <CustomTable.TheadItem>Nombres</CustomTable.TheadItem>
            <CustomTable.TheadItem>Clínica</CustomTable.TheadItem>
            <CustomTable.TheadItem>Email</CustomTable.TheadItem>
            <CustomTable.TheadItem>Verificado</CustomTable.TheadItem>
            <CustomTable.TheadItem className="text-right">Acciones</CustomTable.TheadItem>
          </CustomTable.TableRow>
        </CustomTable.Thead>
        <CustomTable.TBody>
          {owners.map((owner) => {
            const fullName = [owner.firstName, owner.lastName].filter(Boolean).join(' ')

            return (
              <CustomTable.TableRow key={owner.id}>
                <CustomTable.TBodyItem>{formatDate(owner.createdAt)}</CustomTable.TBodyItem>
                <CustomTable.TBodyItem className="flex items-center gap-3">
                  <Avatar className="size-9 border border-gray-200 dark:border-gray-700">
                    <AvatarImage src={getPictureSrc(owner.avatar)} alt={`Foto de ${fullName}`} />
                    <AvatarFallback className="bg-linear-to-br from-green-400 to-green-600 text-xs font-semibold text-white">
                      {getInitials(owner.firstName, owner.lastName) || 'D'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="flex min-w-0 flex-col text-left">
                    <span className="leading-5">{owner.firstName}</span>
                    <span className="leading-5 text-gray-600 dark:text-gray-300">{owner.lastName}</span>
                  </span>
                </CustomTable.TBodyItem>
                <CustomTable.TBodyItem>{owner.organization.name}</CustomTable.TBodyItem>
                <CustomTable.TBodyItem>{owner.user.email}</CustomTable.TBodyItem>
                <CustomTable.TBodyItem className="flex flex-col gap-2">
                  {
                    owner.user.emailConfirmed ? (
                      <Badge variant="outline" className="text-green-600 border-green-600 dark:text-white dark:border-green-600 dark:bg-green-600">
                        <BadgeCheckIcon />
                        Verificado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-red-600 border-red-600 dark:text-white dark:border-red-600 dark:bg-red-600">
                        <BadgeCheckIcon />
                        No Verificado
                      </Badge>
                    )
                  }
                  {
                    owner.user.disabled && (
                      <Badge variant="outline" className="text-red-600 border-red-600 dark:text-white dark:border-red-600 dark:bg-red-600">
                        <LockIcon />
                        Bloqueado
                      </Badge>
                    )
                  }
                </CustomTable.TBodyItem>
                <CustomTable.TBodyItem type="actions">
                  <Button asChild variant="outline" size="icon" className="cursor-pointer">
                    <Link to={`/owners/${owner.id}/edit`} aria-label={`Editar a ${fullName}`}>
                      <PencilIcon className="w-4 h-4 text-blue-500" />
                    </Link>
                  </Button>
                  <CustomTooltip content="Permisos">
                    <Button asChild variant="outline" size="icon" className="cursor-pointer">
                      <Link to={`/owners/${owner.id}/permissions`} aria-label={`Gestionar permisos de ${fullName}`}>
                        <KeyRoundIcon className="w-4 h-4 text-amber-500" />
                      </Link>
                    </Button>
                  </CustomTooltip>
                  <Button
                    variant="outline"
                    size="icon"
                    className="cursor-pointer"
                    onClick={() => openModal(OWNERS_DISABLE_MODAL, { owner: owner.id, disabled: String(!owner.user.disabled) })}
                    aria-label={owner.user.disabled ? `Habilitar la cuenta de ${fullName}` : `Bloquear la cuenta de ${fullName}`}
                  >
                    {
                      owner.user.disabled
                        ? <LockOpenIcon className="w-4 h-4 text-green-500" />
                        : <LockIcon className="w-4 h-4 text-red-500" />
                    }
                  </Button>
                </CustomTable.TBodyItem>
              </CustomTable.TableRow>
            )
          })}
        </CustomTable.TBody>
      </CustomTable>

      <OwnersDisableModal refetch={refetch} />
    </CustomPage>
  )
}
