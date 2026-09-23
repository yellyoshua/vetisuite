import useForm from '@/hooks/use-form'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import Form, { FormInput } from '@/components/form/Form'
import { Button } from '@/components/ui/button'
import clientsService from '@/modules/employee/clients/clients.service'
import { clientSchema, type ClientValues } from '@/modules/employee/clients/clients.schema'

const defaultValues: ClientValues = { name: '', phone: '', email: '' }

export default function CreateClientForm() {
  const form = useForm(defaultValues, {
    onSubmit: (body) => clientsService.post({ ...body, email: body.email || null }),
    schema: clientSchema,
    successMessage: 'Cliente creado correctamente',
    redirectTo: '/clients',
  })

  return (
    <CustomPage title="Nuevo cliente" description="Registra al dueño; después podrás añadir sus mascotas desde su ficha." goBackPath="/clients">
      <CustomPageContainer className="p-6">
        <Form onSubmit={form.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput control={form.control} name="name" label="Nombre completo" placeholder="Nombre completo" />
            <FormInput control={form.control} name="phone" label="Teléfono" placeholder="Teléfono" type="tel" />
            <FormInput control={form.control} name="email" label="Correo (opcional)" placeholder="correo@ejemplo.com" type="email" />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="submit" disabled={form.isSubmitting}>
              {form.isSubmitting ? 'Guardando...' : 'Guardar cliente'}
            </Button>
          </div>
        </Form>
      </CustomPageContainer>
    </CustomPage>
  )
}
