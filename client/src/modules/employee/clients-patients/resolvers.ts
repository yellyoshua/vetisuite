import type { Client } from '../clients/clients.schema'
import type { Patient } from './clients-patients.schema'

export type NewPatientPageData = {
  client: Client
  patients: Patient[]
}

export default function resolveNewPatientPage(_clientId: string): Promise<NewPatientPageData> {
  throw new Error('Not implemented: resolveNewPatientPage')
}
