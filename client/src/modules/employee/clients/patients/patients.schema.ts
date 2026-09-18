import { z } from 'zod'
import { PATIENT_SPECIES_VALUES } from '@/constants/clients'
import type { ListPage, ListQuery } from '@/hooks/use-list-query'

export const patientSchema = z.object({
  name: z.string().trim().min(1, 'El nombre es obligatorio'),
  species: z.enum(PATIENT_SPECIES_VALUES, { message: 'La especie es obligatoria' }),
  breed: z.string().trim().optional(),
  age: z.string().trim().optional(),
  allergies: z.array(z.string().trim()).optional(),
  isAggressive: z.boolean().default(false),
})

export type PatientInput = z.infer<typeof patientSchema>

export type Patient = PatientInput & {
  id: string
  clientId: string
}

export type PatientDraft = {
  name: string
  species: string
  breed: string
  age: string
  allergies: string[]
  isAggressive: boolean
}

export type PatientOwner = {
  id: string
  name: string
}

export type PatientsListQuery = ListQuery & {
  clientId: string
}

export type PatientsListPage = {
  owner: PatientOwner
  patients: ListPage<Patient>
}
