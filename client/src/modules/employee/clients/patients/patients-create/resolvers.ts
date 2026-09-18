import { parseInput } from '@/lib/parse-input'
import { patientSchema, type Patient, type PatientDraft, type PatientOwner } from '../patients.schema'
import { findPatientOwner, PATIENTS, syncOwnerPetNames } from '../patients-list/resolvers'

type PatientOwnerParams = {
  clientId: string
}

type PatientCreation = PatientOwnerParams & {
  draft: PatientDraft
}

export function resolvePatientOwner({ clientId }: PatientOwnerParams): Promise<PatientOwner> {
  return Promise.resolve().then(() => findPatientOwner(clientId))
}

export function createPatient({ clientId, draft }: PatientCreation): Promise<Patient> {
  return Promise.resolve().then(() => {
    const patient: Patient = {
      ...parseInput(patientSchema, draft),
      id: crypto.randomUUID(),
      clientId: findPatientOwner(clientId).id,
    }
    PATIENTS.push(patient)
    syncOwnerPetNames(patient.clientId)

    return patient
  })
}
