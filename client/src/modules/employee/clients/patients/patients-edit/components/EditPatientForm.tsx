import useForm from '@/hooks/use-form'
import CustomPage, { CustomPageContainer } from '@/components/CustomPage/CustomPage'
import Form, { FormInput, FormInputDatePicker, FormInputSelect } from '@/components/form/Form'
import { Button } from '@/components/ui/button'
import { PATIENT_SEX, PATIENT_SPECIES } from '@/constants/clients'
import clientsPatientsService from '@/modules/employee/clients/patients/clients-patients.service'
import { patientSchema, type Patient, type PatientValues } from '@/modules/employee/clients/patients/patients.schema'

type EditPatientFormProps = {
  patient: Patient
}

export default function EditPatientForm({ patient }: EditPatientFormProps) {
  const patientsPath = `/clients/${patient.client.id}/patients`
  const form = useForm<PatientValues>({
    name: patient.name,
    species: patient.species,
    breed: patient.breed ?? '',
    sex: patient.sex,
    birthDate: patient.birthDate,
  }, {
    onSubmit: (body) => clientsPatientsService.put({ ...body, id: patient.id }),
    schema: patientSchema,
    successMessage: 'Mascota actualizada correctamente',
    redirectTo: patientsPath,
  })

  return (
    <CustomPage title="Editar mascota" description={`Actualiza los datos de ${patient.name}.`} goBackPath={patientsPath}>
      <CustomPageContainer className="p-6">
        <Form onSubmit={form.handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput control={form.control} name="name" label="Nombre" placeholder="Nombre" />
            <FormInputSelect control={form.control} name="species" label="Especie" placeholder="Selecciona una especie" options={PATIENT_SPECIES} />
            <FormInput control={form.control} name="breed" label="Raza (opcional)" placeholder="Raza" />
            <FormInputSelect control={form.control} name="sex" label="Sexo (opcional)" placeholder="Selecciona el sexo" options={PATIENT_SEX} />
            <FormInputDatePicker control={form.control} name="birthDate" label="Fecha de nacimiento (opcional)" valueFormat="date" />
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="submit" disabled={form.isSubmitting}>
              {form.isSubmitting ? 'Guardando...' : 'Guardar mascota'}
            </Button>
          </div>
        </Form>
      </CustomPageContainer>
    </CustomPage>
  )
}
