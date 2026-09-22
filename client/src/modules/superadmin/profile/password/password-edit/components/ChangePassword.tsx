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
                <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
                  Seguridad administrativa
                </span>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Protege el acceso al panel de administración
                </h2>
                <p className="max-w-2xl text-sm text-gray-600 dark:text-gray-400">
                  Cambia tu contraseña desde aquí para asegurar el acceso a la gestión de cuentas y configuración general.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Política activa
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">6+</p>
                </div>
                <div className="rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-950/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-blue-700 dark:text-blue-300">
                    Validación
                  </p>
                  <p className="mt-2 text-sm font-medium text-blue-800 dark:text-blue-200">
                    Requiere contraseña actual
                  </p>
                </div>
              </div>
            </div>

            <Form onSubmit={form.handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Confirmación de identidad
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
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

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Nueva contraseña
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
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

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Confirmación final
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
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
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
                  role="alert"
                >
                  <p className="text-sm text-red-600 dark:text-red-400">{form.error.message}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  El cambio se aplica de inmediato y protege tus próximos accesos al panel.
                </p>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={form.isSubmitting}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors cursor-pointer font-medium"
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Buenas prácticas
            </h3>
            <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
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
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <p className="font-medium text-gray-900 dark:text-white">{title}</p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}
