import type { FormEvent } from 'react'
import Button from '@/components/ui/Button'
import ButtonLink from '@/components/ui/ButtonLink'
import Card from '@/components/ui/Card'
import { CONTROL_CLASS_NAME } from '@/components/ui/control-class-name'
import Field from '@/components/ui/Field'
import Icon from '@/components/ui/Icon'
import Input from '@/components/ui/Input'
import Toggle from '@/components/ui/Toggle'
import { PATIENT_SPECIES } from '@/constants/clients'
import type { PatientDraft, PatientInput, PatientOwner } from '../patients.schema'

type PatientFormProps = {
  owner: PatientOwner
  patient?: PatientInput
  isSubmitting: boolean
  submitError: Error | null
  onSubmit: (draft: PatientDraft) => void
}

function readPatientForm(form: HTMLFormElement): PatientDraft {
  const formData = new FormData(form)
  const allergies = String(formData.get('allergies'))
    .split('\n')
    .map((allergy) => allergy.trim())
    .filter(Boolean)

  return {
    name: String(formData.get('name')),
    species: String(formData.get('species')),
    breed: String(formData.get('breed')),
    age: String(formData.get('age')),
    allergies,
    isAggressive: formData.get('isAggressive') === 'on',
  }
}

export default function PatientForm({ owner, patient, isSubmitting, submitError, onSubmit }: PatientFormProps) {
  function submitPatient(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(readPatientForm(event.currentTarget))
  }

  return (
    <Card className="p-5">
      <form method="post" onSubmit={submitPatient} className="flex flex-col gap-[18px]">
        <p className="text-[13px] text-sub">
          Dueño: <strong className="font-semibold text-ink">{owner.name}</strong>
        </p>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(220px,100%),1fr))] gap-3">
          <Field label="Nombre de la mascota">
            <Input name="name" required autoComplete="off" defaultValue={patient?.name} />
          </Field>
          <Field label="Raza (opcional)">
            <Input name="breed" autoComplete="off" defaultValue={patient?.breed} />
          </Field>
          <Field label="Edad (opcional)">
            <Input name="age" autoComplete="off" placeholder="Por ejemplo: 4 años, 8 meses" defaultValue={patient?.age} />
          </Field>
        </div>

        <fieldset className="border-0 p-0">
          <legend className="mb-2 text-[11.5px] font-semibold tracking-[0.3px] text-sub uppercase">Especie</legend>
          <div className="flex flex-wrap gap-4">
            {PATIENT_SPECIES.map((option) => (
              <label key={option.value} className="flex cursor-pointer items-center gap-2 text-[13.5px] text-ink">
                <input
                  name="species"
                  type="radio"
                  value={option.value}
                  required
                  defaultChecked={patient?.species === option.value}
                  className="size-4 accent-green"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3.5 border-0 border-t border-line-soft p-0 pt-4">
          <legend className="sr-only">Alertas clínicas</legend>
          <Field label="Alergias (opcional)">
            <textarea
              name="allergies"
              rows={3}
              aria-describedby="patient-allergies-hint"
              defaultValue={patient?.allergies?.join('\n')}
              className={CONTROL_CLASS_NAME}
            />
          </Field>
          <p id="patient-allergies-hint" className="-mt-2 text-xs text-sub">
            Escribe un compuesto por línea.
          </p>
          <Toggle
            name="isAggressive"
            defaultChecked={patient?.isAggressive}
            label="Paciente agresivo"
            hint="Se muestra como alerta antes de cada atención."
          />
        </fieldset>

        {submitError && (
          <p role="alert" className="text-[12.5px] text-red">
            {submitError.message}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-2 border-t border-line-soft pt-4">
          <ButtonLink to={`/clients/${owner.id}/patients`} variant="ghost">
            Cancelar
          </ButtonLink>
          <Button type="submit" isDisabled={isSubmitting}>
            <Icon name="check" size={14} /> Guardar mascota
          </Button>
        </div>
      </form>
    </Card>
  )
}
