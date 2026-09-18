import { z } from 'zod'
import { CLIENTS_LIST_LIMIT_DEFAULT, CLIENTS_LIST_LIMIT_MAX, PATIENT_SPECIES } from '@/constants/clients'

export const clientCreateSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(1),
  email: z.email().optional(),
})

export const clientListQuerySchema = z.object({
  search: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(CLIENTS_LIST_LIMIT_MAX).default(CLIENTS_LIST_LIMIT_DEFAULT),
  offset: z.coerce.number().int().min(0).default(0),
})

export const patientCreateSchema = z.object({
  clientId: z.uuid(),
  name: z.string().trim().min(1),
  species: z.enum(PATIENT_SPECIES),
  breed: z.string().trim().min(1).optional(),
  age: z.string().trim().min(1).optional(),
  allergies: z.array(z.string().trim().min(1)).optional(),
  isAggressive: z.boolean().default(false),
})

export type ClientCreateInput = z.infer<typeof clientCreateSchema>

export type ClientListQuery = z.infer<typeof clientListQuerySchema>

export type PatientCreateInput = z.infer<typeof patientCreateSchema>
