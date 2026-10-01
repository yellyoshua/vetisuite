import useForm from '@/hooks/use-form'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import Form, { FormInput } from '@/components/form/Form'
import { changePasswordSchema, type ChangePasswordValues } from '@/modules/superadmin/profile/profile.schema'
import passwordService from '../../password.service'

type SecurityItemProps = {
  title: string
  description: string
}

const defaultValues: ChangePasswordValues = {
  currentPassword: '',
  password: '',
  confirmPassword: '',
}

export default function ChangePassword() {
  const form = useForm(defaultValues, {
    onSubmit: (body) => passwordService.put(body),
    schema: changePasswordSchema,
    successMessage: 'Contraseña actualizada correctamente',
    redirectTo: '/profile',
  })

  return (
    <CustomPage
      title="Cambiar contraseña"
      description="Actualiza tu contraseña para mantener segura tu cuenta de administración"
      goBackPath="/profile"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <CustomPageContainer className="xl:col-span-2 p-6 lg:p-8">
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="space-y-2">
                <span className="inline-flex items-center rounded-full bg-info-soft px-3 py-1 text-xs font-medium text-info">
                  Seguridad administrativa
                </span>
                <h2 className="text-2xl font-semibold text-foreground">
                  Protege el acceso al panel de administración
                </h2>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Cambia tu contraseña desde aquí para asegurar el acceso a la gestión de cuentas y configuración general.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
                <div className="rounded-xl border border-border bg-muted p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Política activa
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">6+</p>
                </div>
                <div className="rounded-xl border border-info/30 bg-info-soft p-4">
                  <p className="text-xs uppercase tracking-wide text-info">
                    Validación
                  </p>
                  <p className="mt-2 text-sm font-medium text-info">
                    Requiere contraseña actual
                  </p>
                </div>
              </div>
            </div>

            <Form onSubmit={form.handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2 rounded-xl border border-border p-5">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-foreground">
                      Confirmación de identidad
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Antes de guardar el cambio, valida tu identidad con la contraseña actual de tu cuenta superadmin.
                    </p>
                  </div>

                  <FormInput
                    control={form.control}
                    name="currentPassword"
                    label="Contraseña actual"
                    placeholder="Ingresa tu contraseña actual"
                    type="password"
                    disabled={form.isSubmitting}
                  />
                </div>

                <div className="rounded-xl border border-border p-5">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-foreground">
                      Nueva contraseña
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Define una nueva clave para tu acceso diario al entorno administrativo.
                    </p>
                  </div>

                  <FormInput
                    control={form.control}
                    name="password"
                    label="Nueva contraseña"
                    placeholder="Escribe tu nueva contraseña"
                    type="password"
                    disabled={form.isSubmitting}
                  />
                </div>

                <div className="rounded-xl border border-border p-5">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-foreground">
                      Confirmación final
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Repite la nueva contraseña para asegurarte de que el cambio se guarde correctamente.
                    </p>
                  </div>

                  <FormInput
                    control={form.control}
                    name="confirmPassword"
                    label="Confirmar nueva contraseña"
                    placeholder="Repite tu nueva contraseña"
                    type="password"
                    disabled={form.isSubmitting}
                  />
                </div>
              </div>

              {form.error?.message && (
                <div
                  className="bg-danger-soft border border-danger/30 rounded-xl p-4"
                  role="alert"
                >
                  <p className="text-sm text-danger">{form.error.message}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-border pt-6">
                <p className="text-sm text-muted-foreground">
                  El cambio se aplica de inmediato y protege tus próximos accesos al panel.
                </p>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={form.isSubmitting}
                    className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-neutral-faint text-primary-foreground rounded-lg transition-colors cursor-pointer font-medium"
                  >
                    {form.isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
                  </button>
                </div>
              </div>
            </Form>
          </div>
        </CustomPageContainer>

        <div className="space-y-6">
          <CustomPageContainer className="p-6">
            <h3 className="text-lg font-semibold text-foreground">
              Reglas del cambio
            </h3>
            <div className="mt-4 space-y-4">
              <SecurityItem
                title="Mínimo 6 caracteres"
                description="La nueva contraseña debe respetar la política vigente del sistema."
              />
              <SecurityItem
                title="Sin repetir la actual"
                description="No puedes volver a guardar la misma contraseña que ya está activa."
              />
              <SecurityItem
                title="Confirmación obligatoria"
                description="Debes validar la contraseña actual antes de aplicar el cambio."
              />
            </div>
          </CustomPageContainer>

          <CustomPageContainer className="p-6">
            <h3 className="text-lg font-semibold text-foreground">
              Buenas prácticas
            </h3>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p>
                Usa una contraseña exclusiva para tu acceso administrativo y no la reutilices en otros servicios.
              </p>
              <p>
                Evita guardar credenciales en equipos compartidos o navegadores que no controles.
              </p>
              <p>
                Si administras desde varios dispositivos, revisa periódicamente quién tiene acceso a tus sesiones.
              </p>
            </div>
          </CustomPageContainer>
        </div>
      </div>
    </CustomPage>
  )
}

function SecurityItem({ title, description }: SecurityItemProps) {
  return (
    <div className="rounded-xl border border-border p-4">
      <p className="font-medium text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
