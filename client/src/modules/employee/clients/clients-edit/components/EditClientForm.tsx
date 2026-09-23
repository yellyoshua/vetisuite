import useForm from '@/hooks/use-form'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import Form, { FormInput } from '@/components/form/Form'
import { Button } from '@/components/ui/button'
import clientsService from '@/modules/employee/clients/clients.service'
import { clientSchema, type Client, type ClientValues } from '@/modules/employee/clients/clients.schema'

type EditClientFormProps = {
  client: Client
}

export default function EditClientForm({ client }: EditClientFormProps) {
  const form = useForm<ClientValues>({ name: client.name, phone: client.phone, email: client.email ?? '' }, {
    onSubmit: (body) => clientsService.put({ ...body, email: body.email || null, id: client.id }),
    schema: clientSchema,
    successMessage: 'Cliente actualizado correctamente',
    redirectTo: '/clients',
  })

  return (
    <CustomPage title="Editar cliente" description="Actualiza los datos de contacto del dueño." goBackPath="/clients">
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
