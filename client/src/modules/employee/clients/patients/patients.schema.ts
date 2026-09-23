import zod from 'zod'
import { PATIENT_SEX_VALUES, PATIENT_SPECIES_VALUES } from '@/constants/clients'

export const patientSchema = zod.object({
  name: zod.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  species: zod.enum(PATIENT_SPECIES_VALUES, 'Selecciona una especie'),
  breed: zod.string().max(100, 'La raza no debe superar los 100 caracteres').nullish(),
  sex: zod.enum(PATIENT_SEX_VALUES).nullish(),
  birthDate: zod.string().nullish(),
})

export type PatientValues = zod.infer<typeof patientSchema>

export type Patient = {
  id: string
  name: string
  species: PatientValues['species']
  breed: string | null
  sex: PatientValues['sex']
  birthDate: string | null
  createdAt: string
  client: {
    id: string
    name: string
    phone: string
  }
}
