import type { Patient, PatientInput } from './clients-patients.schema'

const clientsPatientsService = {
  listByClient(_clientId: string): Promise<Patient[]> {
    throw new Error('Not implemented: clientsPatientsService.listByClient')
  },
  get(_patientId: string): Promise<Patient> {
    throw new Error('Not implemented: clientsPatientsService.get')
  },
  create(_clientId: string, _input: PatientInput): Promise<Patient> {
    throw new Error('Not implemented: clientsPatientsService.create')
  },
  update(_patientId: string, _input: PatientInput): Promise<Patient> {
    throw new Error('Not implemented: clientsPatientsService.update')
  },
}

export default clientsPatientsService
