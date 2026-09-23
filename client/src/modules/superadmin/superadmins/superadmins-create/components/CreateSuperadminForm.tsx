import useForm from '@/hooks/use-form'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import Form, { FormInput } from '@/components/form/Form'
import superadminsService from '@/modules/superadmin/superadmins/superadmins.service'
import { createSuperadminSchema, type CreateSuperadminValues } from '@/modules/superadmin/superadmins/superadmins.schema'

const defaultValues: CreateSuperadminValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
}

export default function CreateSuperadminForm() {
  const form = useForm(defaultValues, {
    onSubmit: (body) => superadminsService.post(body),
    schema: createSuperadminSchema,
    successMessage: 'Super admin creado correctamente',
    redirectTo: '/superadmins',
  })

  return (
    <CustomPage title="Crear Super Admin" description="Ingresa los datos del nuevo super admin" goBackPath="/superadmins">
      <CustomPageContainer>
        <Form onSubmit={form.handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
            <FormInput
              control={form.control}
              name="email"
              label="Email"
              placeholder="Email"
              type="email"
            />
            <FormInput
              control={form.control}
              name="password"
              label="Contraseña"
              placeholder="Contraseña"
              type="password"
            />
          </div>

          <div className="flex gap-3 justify-end mt-6">
            <button type="submit" disabled={form.isSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors">
              {form.isSubmitting ? 'Creando...' : 'Guardar'}
            </button>
          </div>
        </Form>
      </CustomPageContainer>
    </CustomPage>
  )
}
