import type { AuthContext } from '@/core/auth-core'
import type { PatientRow } from './clients.repository'
import type { PatientCreateInput } from './clients.schema'

export default function registerPatient(_auth: AuthContext, _input: PatientCreateInput): Promise<PatientRow> {
  throw new Error('Not implemented: registerPatient')
}
