import type { clientsTable, patientsTable } from '@vetisuite/database/schemas'

type ClientRow = typeof clientsTable.$inferSelect

type PatientRow = typeof patientsTable.$inferSelect

export type DuePatient = {
  patientId: PatientRow['id']
  patientName: PatientRow['name']
  species: PatientRow['species']
  ownerName: ClientRow['name']
  ownerEmail: NonNullable<ClientRow['email']>
  vaccineName: string
  dueDate: Date
}

function findDuePatients(_clinicId: ClientRow['organization'], _dueBefore: Date): Promise<DuePatient[]> {
  throw new Error('Not implemented: findDuePatients')
}

export default findDuePatients
