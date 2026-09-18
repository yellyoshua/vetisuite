import { NotFoundError } from '@/lib/not-found-error'
import { parseInput } from '@/lib/parse-input'
import { patientSchema, type Patient, type PatientDraft, type PatientOwner } from '../patients.schema'
import { findPatientOwner, PATIENTS, syncOwnerPetNames } from '../patients-list/resolvers'

type PatientParams = {
  clientId: string
  patientId: string
}

type PatientUpdate = PatientParams & {
  draft: PatientDraft
}

type PatientEditData = {
  owner: PatientOwner
  patient: Patient
}

function findPatient({ clientId, patientId }: PatientParams): Patient {
  const patient = PATIENTS.find((candidate) => candidate.id === patientId && candidate.clientId === clientId)
  if (!patient) {
    throw new NotFoundError('No encontramos la mascota que buscas.')
  }

  return patient
}

export function resolvePatientEdit(params: PatientParams): Promise<PatientEditData> {
  return Promise.resolve().then(() => ({
    owner: findPatientOwner(params.clientId),
    patient: findPatient(params),
  }))
}

export function updatePatient({ draft, ...params }: PatientUpdate): Promise<Patient> {
  return Promise.resolve().then(() => {
    const patient = findPatient(params)
    const updatedPatient: Patient = { ...patient, ...parseInput(patientSchema, draft) }
    PATIENTS.splice(PATIENTS.indexOf(patient), 1, updatedPatient)
    syncOwnerPetNames(updatedPatient.clientId)

    return updatedPatient
  })
}
