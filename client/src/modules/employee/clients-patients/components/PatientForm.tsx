import type { FormEvent } from 'react'
import Button from '@/components/ui/Button'

type SpeciesOption = {
  value: string
  label: string
}

type PatientFormProps = {
  clientName: string
  speciesOptions: readonly SpeciesOption[]
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export default function PatientForm({ clientName, speciesOptions, onSubmit }: PatientFormProps) {
  return (
    <form method="post" onSubmit={onSubmit} className="flex flex-col gap-6 rounded-xl border border-line bg-surface p-6">
      <p className="text-sm text-sub">
        Dueño: <strong className="font-semibold text-ink">{clientName}</strong>
      </p>

      <div className="flex flex-col gap-2">
        <label htmlFor="patient-name" className="font-medium text-ink">
          Nombre de la mascota (obligatorio)
        </label>
        <input
          id="patient-name"
          name="name"
          type="text"
          required
          autoComplete="off"
          className="min-h-12 rounded-lg border border-line bg-surface px-3 text-base text-ink"
        />
      </div>

      <fieldset className="flex flex-col gap-2 border-0 p-0">
        <legend className="mb-2 font-medium text-ink">Especie (obligatorio)</legend>
        <div className="flex flex-wrap gap-4">
          {speciesOptions.map((option) => (
            <span key={option.value} className="flex items-center gap-2">
              <input
                id={`patient-species-${option.value}`}
                name="species"
                type="radio"
                value={option.value}
                required
                className="size-5 accent-brand"
              />
              <label htmlFor={`patient-species-${option.value}`} className="text-ink">
                {option.label}
              </label>
            </span>
          ))}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="patient-breed" className="font-medium text-ink">
          Raza (opcional)
        </label>
        <input
          id="patient-breed"
          name="breed"
          type="text"
          autoComplete="off"
          className="min-h-12 rounded-lg border border-line bg-surface px-3 text-base text-ink"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="patient-age" className="font-medium text-ink">
          Edad (opcional)
        </label>
        <input
          id="patient-age"
          name="age"
          type="text"
          autoComplete="off"
          aria-describedby="patient-age-hint"
          className="min-h-12 rounded-lg border border-line bg-surface px-3 text-base text-ink"
        />
        <p id="patient-age-hint" className="text-sm text-sub">
          Por ejemplo: 4 años, 8 meses.
        </p>
      </div>

      <fieldset className="flex flex-col gap-4 border-0 p-0">
        <legend className="mb-2 font-medium text-ink">Alertas clínicas</legend>

        <div className="flex flex-col gap-2">
          <label htmlFor="patient-allergies" className="text-ink">
            Alergias (opcional)
          </label>
          <textarea
            id="patient-allergies"
            name="allergies"
            rows={3}
            aria-describedby="patient-allergies-hint"
            className="rounded-lg border border-line bg-surface p-3 text-base text-ink"
          />
          <p id="patient-allergies-hint" className="text-sm text-sub">
            Escribe un compuesto por línea.
          </p>
        </div>

        <span className="flex items-center gap-2">
          <input id="patient-is-aggressive" name="isAggressive" type="checkbox" className="size-5 accent-alert" />
          <label htmlFor="patient-is-aggressive" className="text-ink">
            Paciente agresivo
          </label>
        </span>
      </fieldset>

      <div className="flex flex-wrap gap-3">
        <Button type="submit">Guardar mascota</Button>
      </div>
    </form>
  )
}
