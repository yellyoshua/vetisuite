import type {
  clientsTable,
  organizationsTable,
  patientsTable,
  patientsVaccinationTable,
} from '@vetisuite/database/schemas'

type ClientRow = typeof clientsTable.$inferSelect

type OrganizationRow = typeof organizationsTable.$inferSelect

type PatientRow = typeof patientsTable.$inferSelect

type PatientVaccinationRow = typeof patientsVaccinationTable.$inferSelect

export type DuePatient = {
  patientId: PatientRow['id']
  patientName: PatientRow['name']
  species: PatientRow['species']
  ownerName: ClientRow['name']
  ownerEmail: NonNullable<ClientRow['email']>
  vaccineName: PatientVaccinationRow['vaccine']
  dueDate: NonNullable<PatientVaccinationRow['nextDueAt']>
}

function findDuePatients(
  _clinicId: OrganizationRow['id'],
  _timezone: OrganizationRow['timezone'],
  _dueBefore: NonNullable<PatientVaccinationRow['nextDueAt']>,
): Promise<DuePatient[]> {
  throw new Error('Not implemented: findDuePatients')
}

export default findDuePatients
