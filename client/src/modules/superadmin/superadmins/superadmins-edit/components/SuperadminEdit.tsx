import { CheckCircleIcon, LockIcon, LockOpenIcon, XCircleIcon } from 'lucide-react'
import useForm from '@/hooks/use-form'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import Form, { FormInput } from '@/components/form/Form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate } from '@/lib/date'
import { getInitials, getPictureSrc } from '@/lib/utils'
import superadminsService from '@/modules/superadmin/superadmins/superadmins.service'
import { updateSuperadminSchema, type Superadmin, type UpdateSuperadminValues } from '@/modules/superadmin/superadmins/superadmins.schema'

type SuperadminEditProps = {
  superadmin: Superadmin
}

type InfoItemProps = {
  label: string
  value: string
}

const DATE_OPTIONS: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }

function formatLastSignIn(lastSignInAt: string | null): string {
  if (!lastSignInAt) {
    return 'Nunca'
  }

  return formatDate(lastSignInAt, { ...DATE_OPTIONS, hour: '2-digit', minute: '2-digit' })
}

export default function SuperadminEdit({ superadmin }: SuperadminEditProps) {
  const fullName = [superadmin.firstName, superadmin.lastName].filter(Boolean).join(' ')
  const form = useForm<UpdateSuperadminValues>({
    firstName: superadmin.firstName,
    lastName: superadmin.lastName,
  }, {
    onSubmit: (body) => superadminsService.put({ ...body, id: superadmin.id }),
    schema: updateSuperadminSchema,
    successMessage: 'Super admin actualizado correctamente',
    redirectTo: '/superadmins',
  })

  return (
    <CustomPage title="Editar Super Admin" description="Consulta y modifica los datos del super admin" goBackPath="/superadmins">
      <div className="space-y-6">
        <CustomPageContainer>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Información Básica
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InfoItem label="Nombre" value={fullName} />
            <InfoItem label="Email" value={superadmin.user.email} />
            <InfoItem label="Fecha de Registro" value={formatDate(superadmin.user.createdAt, DATE_OPTIONS)} />
            <InfoItem label="Último Ingreso" value={formatLastSignIn(superadmin.user.lastSignInAt)} />
          </div>
        </CustomPageContainer>

        <CustomPageContainer>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Estado de la Cuenta
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              {superadmin.user.disabled
                ? <LockIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
                : <LockOpenIcon className="w-6 h-6 text-green-600 dark:text-green-400" />}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Estado</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{superadmin.user.disabled ? 'Bloqueado' : 'Activo'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
              {superadmin.user.emailConfirmed
                ? <CheckCircleIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
                : <XCircleIcon className="w-6 h-6 text-gray-400" />}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Email Verificado</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{superadmin.user.emailConfirmed ? 'Verificado' : 'No verificado'}</p>
              </div>
            </div>
          </div>
        </CustomPageContainer>

        <CustomPageContainer className="p-6">
          <Avatar className="size-16 mb-6">
            <AvatarImage src={getPictureSrc(superadmin.avatar)} alt={`Foto de ${fullName}`} />
            <AvatarFallback className="bg-linear-to-br from-blue-400 to-blue-600 text-lg font-semibold text-white">
              {getInitials(superadmin.firstName, superadmin.lastName)}
            </AvatarFallback>
          </Avatar>
          <Form onSubmit={form.handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                control={form.control}
                name="firstName"
                label="Nombre"
                placeholder="Nombre"
              />
              <FormInput
                control={form.control}
                name="lastName"
                label="Apellido"
                placeholder="Apellido"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button type="submit" disabled={form.isSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors cursor-pointer">
                {form.isSubmitting ? 'Actualizando...' : 'Guardar'}
              </button>
            </div>
          </Form>
        </CustomPageContainer>
      </div>
    </CustomPage>
  )
}

function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-base font-medium text-gray-900 dark:text-white mt-1">{value}</p>
    </div>
  )
}
