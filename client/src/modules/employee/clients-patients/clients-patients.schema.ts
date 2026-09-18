import { z } from 'zod'
import { PATIENT_SPECIES_VALUES } from '@/constants/clients'

export const patientSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  species: z.enum(PATIENT_SPECIES_VALUES, { message: 'La especie es obligatoria' }),
  breed: z.string().trim().optional(),
  age: z.string().trim().optional(),
  allergies: z.array(z.string().trim()).optional(),
  isAggressive: z.boolean().default(false),
})

export type PatientInput = z.infer<typeof patientSchema>

export type PatientSpecies = PatientInput['species']

export type Patient = PatientInput & {
  id: string
  clientId: string
}
