import useForm from '@/hooks/use-form'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import Form, { FormInput } from '@/components/form/Form'
import passwordService from '@/modules/owner/profile/password/password.service'
import { changePasswordSchema, type ChangePasswordValues } from '@/modules/owner/profile/password/password.schema'

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
      description="Actualiza tu contraseña para mantener segura tu cuenta"
      goBackPath="/profile"
    >
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <CustomPageContainer className="xl:col-span-2 p-6 lg:p-8">
          <div className="space-y-8">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="space-y-2">
                <span className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-medium text-primary">
                  Seguridad de la cuenta
                </span>
                <h2 className="text-2xl font-semibold text-foreground">
                  Actualiza tus credenciales de acceso
                </h2>
                <p className="max-w-2xl text-sm text-muted-foreground">
                  Confirma tu contraseña actual y define una nueva clave para proteger tu cuenta.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
                <div className="rounded-xl border border-border bg-muted p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Longitud mínima
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">6</p>
                </div>
                <div className="rounded-xl border border-primary/30 bg-primary-soft p-4">
                  <p className="text-xs uppercase tracking-wide text-primary">
                    Verificación
                  </p>
                  <p className="mt-2 text-sm font-medium text-primary">
                    Contraseña actual obligatoria
                  </p>
                </div>
              </div>
            </div>

            <Form onSubmit={form.handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2 rounded-xl border border-border p-5">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-foreground">
                      Validación de identidad
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Necesitamos tu contraseña actual para confirmar que eres tú quien realiza el cambio.
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
                      Usa una clave distinta a la actual y fácil de recordar para ti.
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
                      Confirmación
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Repite exactamente la nueva contraseña para evitar errores.
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
                  Al guardar, tu nueva contraseña quedará activa de inmediato.
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
                description="La nueva contraseña debe cumplir la política actual del sistema."
              />
              <SecurityItem
                title="Sin reutilizar la clave"
                description="No puedes guardar una contraseña idéntica a la que usas hoy."
              />
              <SecurityItem
                title="Confirmación obligatoria"
                description="Debes repetir la nueva contraseña para completar el cambio."
              />
            </div>
          </CustomPageContainer>

          <CustomPageContainer className="p-6">
            <h3 className="text-lg font-semibold text-foreground">
              Recomendaciones
            </h3>
            <div className="mt-4 space-y-3 text-sm text-muted-foreground">
              <p>
                Evita usar datos personales evidentes como tu nombre o fecha de nacimiento.
              </p>
              <p>
                Si compartes dispositivos, cierra sesión cuando termines.
              </p>
              <p>
                Mantén una contraseña única para Veti Suite y no la reutilices en otros servicios.
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
