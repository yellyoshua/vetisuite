import type { FormEvent } from 'react'
import Button from '@/components/legacy-ui/Button'
import ButtonLink from '@/components/legacy-ui/ButtonLink'
import Card from '@/components/legacy-ui/Card'
import Field from '@/components/legacy-ui/Field'
import Icon from '@/components/legacy-ui/Icon'
import Input from '@/components/legacy-ui/Input'
import type { ClientInput } from '../clients.schema'

type ClientFormProps = {
  client?: ClientInput
  isSubmitting: boolean
  submitError: Error | null
  onSubmit: (values: ClientInput) => void
}

function readClientForm(form: HTMLFormElement): ClientInput {
  const formData = new FormData(form)

  return {
    name: String(formData.get('name')),
    nationalId: String(formData.get('nationalId')),
    phone: String(formData.get('phone')),
    email: String(formData.get('email')),
  }
}

export default function ClientForm({ client, isSubmitting, submitError, onSubmit }: ClientFormProps) {
  function submitClient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(readClientForm(event.currentTarget))
  }

  return (
    <Card className="p-5">
      <form onSubmit={submitClient} className="flex flex-col gap-[18px]">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-3">
          <Field label="Nombre completo">
            <Input name="name" required autoComplete="name" defaultValue={client?.name} />
          </Field>
          <Field label="Cédula">
            <Input name="nationalId" required autoComplete="off" inputMode="numeric" defaultValue={client?.nationalId} />
          </Field>
          <Field label="Teléfono">
            <Input name="phone" type="tel" required autoComplete="tel" defaultValue={client?.phone} />
          </Field>
          <Field label="Correo (opcional)">
            <Input name="email" type="email" autoComplete="email" defaultValue={client?.email} />
          </Field>
        </div>
        {submitError && (
          <p role="alert" className="text-[12.5px] text-red">
            {submitError.message}
          </p>
        )}
        <div className="flex flex-wrap justify-end gap-2 border-t border-line-soft pt-4">
          <ButtonLink to="/clients" variant="ghost">
            Cancelar
          </ButtonLink>
          <Button type="submit" isDisabled={isSubmitting}>
            <Icon name="check" size={14} /> Guardar cliente
          </Button>
        </div>
      </form>
    </Card>
  )
}
