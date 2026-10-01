import { Building2Icon, CalendarIcon, CheckCircleIcon, MailIcon, PhoneIcon, XCircleIcon } from 'lucide-react'
import useForm from '@/hooks/use-form'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import Form, { FormInput, FormTextarea } from '@/components/form/Form'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDate } from '@/lib/date'
import { getInitials, getPictureSrc } from '@/lib/utils'
import ownersService from '@/modules/superadmin/owners/owners.service'
import { updateOwnerSchema, type Owner, type UpdateOwnerValues } from '@/modules/superadmin/owners/owners.schema'

type OwnerEditProps = {
  owner: Owner
}

const REGISTERED_AT_FORMAT: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }

export default function OwnerEdit({ owner }: OwnerEditProps) {
  const fullName = [owner.firstName, owner.lastName].filter(Boolean).join(' ')
  const form = useForm<UpdateOwnerValues>({
    firstName: owner.firstName,
    lastName: owner.lastName,
    phone: owner.phone,
    position: owner.position,
    occupation: owner.occupation,
    description: owner.description,
  }, {
    onSubmit: (body) => ownersService.put({ ...body, id: owner.id }),
    schema: updateOwnerSchema,
    successMessage: 'Dueño actualizado correctamente',
    redirectTo: '/owners',
  })

  return (
    <CustomPage title="Editar Dueño" description="Consulta y modifica los datos del dueño" goBackPath="/owners">
      <div className="space-y-6">
        <CustomPageContainer className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Información Básica
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <Avatar className="size-14 border border-border">
                <AvatarImage src={getPictureSrc(owner.avatar)} alt={`Foto de ${fullName}`} />
                <AvatarFallback className="bg-linear-to-br from-primary to-primary-strong text-base font-semibold text-primary-strong-foreground">
                  {getInitials(owner.firstName, owner.lastName) || 'D'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Nombre Completo</p>
                <p className="text-base font-medium text-foreground mt-1">{fullName}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MailIcon className="w-5 h-5 text-neutral-faint mt-1" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="text-base font-medium text-foreground mt-1">{owner.user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building2Icon className="w-5 h-5 text-neutral-faint mt-1" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Clínica</p>
                <p className="text-base font-medium text-foreground mt-1">{owner.organization.name}</p>
              </div>
            </div>

            {owner.phone && (
              <div className="flex items-start gap-3">
                <PhoneIcon className="w-5 h-5 text-neutral-faint mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Teléfono</p>
                  <p className="text-base font-medium text-foreground mt-1">{owner.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <CalendarIcon className="w-5 h-5 text-neutral-faint mt-1" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Fecha de Registro</p>
                <p className="text-base font-medium text-foreground mt-1">
                  {formatDate(owner.createdAt, REGISTERED_AT_FORMAT)}
                </p>
              </div>
            </div>
          </div>
        </CustomPageContainer>

        <CustomPageContainer className="p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Estado de la Cuenta
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-3">
                {owner.user.emailConfirmed ? (
                  <CheckCircleIcon className="w-6 h-6 text-primary" />
                ) : (
                  <XCircleIcon className="w-6 h-6 text-neutral-faint" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">Email Verificado</p>
                  <p className="text-xs text-muted-foreground">
                    {owner.user.emailConfirmed ? 'Verificado' : 'No verificado'}
                  </p>
                </div>
              </div>
            </div>

            {owner.user.disabled && (
              <div className="md:col-span-2 flex items-center justify-between p-4 rounded-lg bg-danger-soft border border-danger/30">
                <div className="flex items-center gap-3">
                  <XCircleIcon className="w-6 h-6 text-danger" />
                  <div>
                    <p className="text-sm font-medium text-danger">Cuenta Deshabilitada</p>
                    <p className="text-xs text-danger">
                      Esta cuenta ha sido deshabilitada por un administrador
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CustomPageContainer>

        <CustomPageContainer className="p-6">
          <Form onSubmit={form.handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormInput
                control={form.control}
                name="firstName"
                label="Nombre del dueño"
                placeholder="Nombre"
              />
              <FormInput
                control={form.control}
                name="lastName"
                label="Apellido del dueño"
                placeholder="Apellido"
              />
              <FormInput
                control={form.control}
                name="phone"
                label="Teléfono del dueño"
                placeholder="Teléfono"
              />
              <FormInput
                control={form.control}
                name="position"
                label="Cargo"
                placeholder="Cargo"
              />
              <FormInput
                control={form.control}
                name="occupation"
                label="Ocupación"
                placeholder="Ocupación"
              />
              <div className="md:col-span-2">
                <FormTextarea
                  control={form.control}
                  name="description"
                  label="Descripción"
                  placeholder="Descripción"
                />
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button type="submit" disabled={form.isSubmitting} className="px-6 py-2 bg-primary hover:bg-primary/90 disabled:bg-neutral-faint text-primary-foreground rounded-lg transition-colors cursor-pointer">
                {form.isSubmitting ? 'Actualizando...' : 'Guardar'}
              </button>
            </div>
          </Form>
        </CustomPageContainer>
      </div>
    </CustomPage>
  )
}
