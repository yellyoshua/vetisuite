import { defineRoute } from '@/core/base-route'
import type { PatientRow } from '@/modules/clients/clients.repository'
import { patientCreateSchema } from '@/modules/clients/clients.schema'

export default defineRoute(patientCreateSchema, (_context): Promise<PatientRow> => {
  throw new Error('Not implemented: POST /api/clients-patients')
})
