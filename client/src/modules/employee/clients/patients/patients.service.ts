import type { ListPage, ListQuery } from '@/hooks/use-list-query'
import type { Patient, PatientInput } from './patients.schema'

const patientsService = {
  listByClient(_clientId: string, _query: ListQuery): Promise<ListPage<Patient>> {
    throw new Error('Not implemented: patientsService.listByClient')
  },
  get(_patientId: string): Promise<Patient> {
    throw new Error('Not implemented: patientsService.get')
  },
  create(_clientId: string, _input: PatientInput): Promise<Patient> {
    throw new Error('Not implemented: patientsService.create')
  },
  update(_patientId: string, _input: PatientInput): Promise<Patient> {
    throw new Error('Not implemented: patientsService.update')
  },
}

export default patientsService
