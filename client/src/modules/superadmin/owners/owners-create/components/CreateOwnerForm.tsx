import useForm from '@/hooks/use-form'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import Form, { FormInput } from '@/components/form/Form'
import ownersService from '@/modules/superadmin/owners/owners.service'
import { createOwnerSchema, type CreateOwnerValues } from '@/modules/superadmin/owners/owners.schema'

const defaultValues: CreateOwnerValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: null,
}

export default function CreateOwnerForm() {
  const form = useForm(defaultValues, {
    onSubmit: (body) => ownersService.post(body),
    schema: createOwnerSchema,
    successMessage: 'Dueño creado correctamente',
    redirectTo: '/owners',
  })

  return (
    <CustomPage title="Crear Dueño" description="Ingresa los datos del nuevo dueño" goBackPath="/owners">
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
              name="email"
              label="Email del dueño"
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
            <FormInput
              control={form.control}
              name="phone"
              label="Teléfono del dueño"
              placeholder="Teléfono"
            />
          </div>

          <div className="flex gap-3 justify-end">
            <button type="submit" disabled={form.isSubmitting} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors">
              {form.isSubmitting ? 'Creando...' : 'Guardar'}
            </button>
          </div>
        </Form>
      </CustomPageContainer>
    </CustomPage>
  )
}
