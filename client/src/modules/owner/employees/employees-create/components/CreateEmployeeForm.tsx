import useForm from '@/hooks/use-form'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import Form, { FormInput, FormInputSelect } from '@/components/form/Form'
import { employeePositionOptions } from '@/constants/employees'
import employeesService from '@/modules/owner/employees/employees.service'
import { createEmployeeSchema, type CreateEmployeeValues } from '@/modules/owner/employees/employees.schema'

const defaultValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: null,
  color: '',
} as CreateEmployeeValues

const positionOptions = employeePositionOptions.map((option) => ({ value: option.value, label: option.label }))

export default function CreateEmployeeForm() {
  const form = useForm(defaultValues, {
    onSubmit: (body) => employeesService.post({ ...body, color: body.color || null }),
    schema: createEmployeeSchema,
    successMessage: 'Empleado creado correctamente',
    redirectTo: '/employees',
  })

  return (
    <CustomPage title="Crear Empleado" description="Ingresa los datos del nuevo empleado" goBackPath="/employees">
      <CustomPageContainer className="p-6">
        <Form onSubmit={form.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput
              control={form.control}
              name="firstName"
              label="Nombre del empleado"
              placeholder="Nombre"
            />
            <FormInput
              control={form.control}
              name="lastName"
              label="Apellido del empleado"
              placeholder="Apellido"
            />
            <FormInput
              control={form.control}
              name="email"
              label="Email del empleado"
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
              label="Teléfono del empleado"
              placeholder="Teléfono"
            />
            <FormInputSelect
              control={form.control}
              name="position"
              label="Cargo"
              placeholder="Selecciona un cargo"
              options={positionOptions}
            />
            <FormInput
              control={form.control}
              name="color"
              label="Color en la agenda"
              placeholder="#RRGGBB"
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
