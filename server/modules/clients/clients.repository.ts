import type { clientsTable, patientsTable } from '@vetisuite/database/schemas'
import type { ListQuery, ListResult } from '@/core/repository'
import type { ClientCreateInput, PatientCreateInput } from './clients.schema'

export type ClientRow = typeof clientsTable.$inferSelect

export type PatientRow = typeof patientsTable.$inferSelect

type ClientsRepository = {
  findMany(clinicId: string, query: ListQuery): Promise<ListResult<ClientRow>>
  findById(clinicId: string, clientId: string): Promise<ClientRow | null>
  insertClient(clinicId: string, input: ClientCreateInput): Promise<ClientRow>
  insertPatient(clinicId: string, input: PatientCreateInput): Promise<PatientRow>
}

const clientsRepository: ClientsRepository = {
  findMany() {
    throw new Error('Not implemented: clientsRepository.findMany')
  },

  findById() {
    throw new Error('Not implemented: clientsRepository.findById')
  },

  insertClient() {
    throw new Error('Not implemented: clientsRepository.insertClient')
  },

  insertPatient() {
    throw new Error('Not implemented: clientsRepository.insertPatient')
  },
}

export default clientsRepository
