import { Link } from 'react-router'
import { KeyRoundIcon, LockIcon, LockOpenIcon, PencilIcon, PlusIcon, SearchIcon } from 'lucide-react'
import useQueryParams from '@/hooks/use-query-params'
import { useOpenModal } from '@/components/modalWrapper'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import CustomTable from '@/components/CustomTable/CustomTable'
import CustomTooltip from '@/components/CustomTooltip/CustomTooltip'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SUPERADMINS_DISABLE_MODAL } from '@/constants/modals'
import { getInitials, getPictureSrc } from '@/lib/utils'
import type { Superadmin } from '@/modules/superadmin/superadmins/superadmins.schema'
import SuperadminsDisableModal from '../../components/SuperadminsDisableModal'

type SuperadminsProps = {
  superadmins: Superadmin[]
  refetch: () => void
}

export default function Superadmins({ superadmins, refetch }: SuperadminsProps) {
  const { nextPage, prevPage, search, query } = useQueryParams()
  const openModal = useOpenModal()
  const currentPage = Number(query.page) || 1

  return (
    <CustomPage
      title="Super Admins"
      description="Gestiona los super administradores de la plataforma"
      actions={
        <Link to="/superadmins/create" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
          <PlusIcon className="w-5 h-5" />
          Crear Super Admin
        </Link>
      }
    >
      <CustomPageContainer>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

          <input
            type="text"
            aria-label="Buscar super admins"
            placeholder="Buscar por nombre..."
            defaultValue={query.search || ''}
            onChange={({ target }) => search(target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
          />
        </div>
      </CustomPageContainer>

      <CustomTable dataSize={superadmins.length} currentPage={currentPage} nextPage={nextPage} prevPage={prevPage}>
        <CustomTable.Thead>
          <CustomTable.TableRow header={true}>
            <CustomTable.TheadItem>Nombre</CustomTable.TheadItem>
            <CustomTable.TheadItem>Email</CustomTable.TheadItem>
            <CustomTable.TheadItem className="text-center">Estado</CustomTable.TheadItem>
            <CustomTable.TheadItem className="text-right">Acciones</CustomTable.TheadItem>
          </CustomTable.TableRow>
        </CustomTable.Thead>
        <CustomTable.TBody>
          {superadmins.map((superadmin) => {
            const fullName = [superadmin.firstName, superadmin.lastName].filter(Boolean).join(' ')

            return (
              <CustomTable.TableRow key={superadmin.id}>
                <CustomTable.TBodyItem className="flex items-center gap-3">
                  <Avatar className="size-9 border border-gray-200 dark:border-gray-700">
                    <AvatarImage src={getPictureSrc(superadmin.avatar)} alt={`Foto de ${fullName}`} />
                    <AvatarFallback className="bg-linear-to-br from-blue-400 to-blue-600 text-xs font-semibold text-white">
                      {getInitials(superadmin.firstName, superadmin.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{fullName}</span>
                </CustomTable.TBodyItem>
                <CustomTable.TBodyItem>{superadmin.user.email}</CustomTable.TBodyItem>
                <CustomTable.TBodyItem className="flex justify-center">
                  {superadmin.user.disabled ? (
                    <Badge variant="outline" className="text-red-600 border-red-600 dark:text-white dark:border-red-600 dark:bg-red-600">
                      <LockIcon />
                      Bloqueado
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-green-600 border-green-600 dark:text-white dark:border-green-600 dark:bg-green-600">
                      <LockOpenIcon />
                      Activo
                    </Badge>
                  )}
                </CustomTable.TBodyItem>
                <CustomTable.TBodyItem type="actions">
                  <CustomTooltip content="Editar super admin">
                    <Button asChild variant="outline" size="icon" className="cursor-pointer">
                      <Link to={`/superadmins/${superadmin.id}/edit`} aria-label={`Editar a ${fullName}`}>
                        <PencilIcon className="w-4 h-4 text-blue-500" />
                      </Link>
                    </Button>
                  </CustomTooltip>
                  <CustomTooltip content="Permisos">
                    <Button asChild variant="outline" size="icon" className="cursor-pointer">
                      <Link to={`/superadmins/${superadmin.id}/permissions`} aria-label={`Gestionar permisos de ${fullName}`}>
                        <KeyRoundIcon className="w-4 h-4 text-amber-500" />
                      </Link>
                    </Button>
                  </CustomTooltip>
                  <CustomTooltip content={superadmin.user.disabled ? 'Habilitar cuenta' : 'Bloquear cuenta'}>
                    <Button
                      variant="outline"
                      size="icon"
                      className="cursor-pointer"
                      onClick={() => openModal(SUPERADMINS_DISABLE_MODAL, { superadmin: superadmin.id, disabled: String(!superadmin.user.disabled) })}
                      aria-label={superadmin.user.disabled ? `Habilitar la cuenta de ${fullName}` : `Bloquear la cuenta de ${fullName}`}
                    >
                      {
                        superadmin.user.disabled
                          ? <LockOpenIcon className="w-4 h-4 text-green-500" />
                          : <LockIcon className="w-4 h-4 text-red-500" />
                      }
                    </Button>
                  </CustomTooltip>
                </CustomTable.TBodyItem>
              </CustomTable.TableRow>
            )
          })}
        </CustomTable.TBody>
      </CustomTable>

      <SuperadminsDisableModal refetch={refetch} />
    </CustomPage>
  )
}
