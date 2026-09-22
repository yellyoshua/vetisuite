import useForm from '@/hooks/use-form'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import Form, { FormInput } from '@/components/form/Form'
import passwordService from '@/modules/employee/profile/password/password.service'
import { changePasswordSchema, type ChangePasswordValues } from '@/modules/employee/profile/password/password.schema'

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
                <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-3 py-1 text-xs font-medium text-green-700 dark:text-green-300">
                  Seguridad de la cuenta
                </span>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  Actualiza tus credenciales de acceso
                </h2>
                <p className="max-w-2xl text-sm text-gray-600 dark:text-gray-400">
                  Confirma tu contraseña actual y define una nueva clave para proteger tu cuenta.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40 p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Longitud mínima
                  </p>
                  <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">6</p>
                </div>
                <div className="rounded-xl border border-green-200 dark:border-green-900/40 bg-green-50 dark:bg-green-950/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-green-700 dark:text-green-300">
                    Verificación
                  </p>
                  <p className="mt-2 text-sm font-medium text-green-800 dark:text-green-200">
                    Contraseña actual obligatoria
                  </p>
                </div>
              </div>
            </div>

            <Form onSubmit={form.handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Validación de identidad
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
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

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Nueva contraseña
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
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

                <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className="mb-5">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Confirmación
                    </h3>
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
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
                  className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4"
                  role="alert"
                >
                  <p className="text-sm text-red-600 dark:text-red-400">{form.error.message}</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Al guardar, tu nueva contraseña quedará activa de inmediato.
                </p>
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={form.isSubmitting}
                    className="px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors cursor-pointer font-medium"
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Recomendaciones
            </h3>
            <div className="mt-4 space-y-3 text-sm text-gray-600 dark:text-gray-400">
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
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <p className="font-medium text-gray-900 dark:text-white">{title}</p>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  )
}
