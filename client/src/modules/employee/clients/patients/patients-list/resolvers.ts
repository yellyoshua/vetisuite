import { NotFoundError } from '@/lib/not-found-error'
import { paginateRows } from '@/lib/paginate-rows'
import { CLIENTS } from '../../clients-list/resolvers'
import type { Patient, PatientOwner, PatientsListPage, PatientsListQuery } from '../patients.schema'

export const PATIENTS: Patient[] = [
  { id: 'pat-1', clientId: 'cli-1', name: 'Max', species: 'dog', breed: 'Labrador', age: '4 años', allergies: ['Penicilina'], isAggressive: false },
  { id: 'pat-2', clientId: 'cli-1', name: 'Luna', species: 'cat', breed: 'Siamés', age: '2 años', allergies: [], isAggressive: false },
  { id: 'pat-3', clientId: 'cli-2', name: 'Rocky', species: 'dog', breed: 'Bulldog francés', age: '6 años', allergies: [], isAggressive: true },
  { id: 'pat-4', clientId: 'cli-3', name: 'Nala', species: 'dog', breed: 'Golden retriever', age: '11 años', allergies: [], isAggressive: false },
  { id: 'pat-5', clientId: 'cli-4', name: 'Kiwi', species: 'bird', breed: 'Perico', age: '1 año', allergies: ['Semillas de girasol'], isAggressive: false },
  { id: 'pat-6', clientId: 'cli-5', name: 'Simba', species: 'cat', breed: 'Mestizo', age: '5 años', allergies: [], isAggressive: false },
  { id: 'pat-7', clientId: 'cli-5', name: 'Coco', species: 'dog', breed: 'Poodle', age: '3 años', allergies: ['Pollo'], isAggressive: false },
  { id: 'pat-8', clientId: 'cli-6', name: 'Toby', species: 'dog', breed: 'Beagle', age: '7 años', allergies: [], isAggressive: false },
  { id: 'pat-9', clientId: 'cli-7', name: 'Bruno', species: 'dog', breed: 'Pastor alemán', age: '2 años', allergies: [], isAggressive: true },
  { id: 'pat-10', clientId: 'cli-8', name: 'Mía', species: 'cat', breed: 'Persa', age: '9 años', allergies: [], isAggressive: false },
  { id: 'pat-11', clientId: 'cli-9', name: 'Pelusa', species: 'cat', breed: 'Angora', age: '4 años', allergies: [], isAggressive: false },
  { id: 'pat-12', clientId: 'cli-9', name: 'Canela', species: 'dog', breed: 'Cocker spaniel', age: '8 años', allergies: ['Amoxicilina'], isAggressive: false },
  { id: 'pat-13', clientId: 'cli-10', name: 'Thor', species: 'dog', breed: 'Rottweiler', age: '3 años', allergies: [], isAggressive: true },
  { id: 'pat-14', clientId: 'cli-11', name: 'Chispa', species: 'other', breed: 'Hámster', age: '1 año', allergies: [], isAggressive: false },
  { id: 'pat-15', clientId: 'cli-12', name: 'Rex', species: 'dog', breed: 'Mestizo', age: '10 años', allergies: [], isAggressive: false },
]

export function findPatientOwner(clientId: string): PatientOwner {
  const client = CLIENTS.find((candidate) => candidate.id === clientId)
  if (!client) {
    throw new NotFoundError('No encontramos el cliente de estas mascotas.')
  }

  return { id: client.id, name: client.name }
}

export function syncOwnerPetNames(clientId: string): void {
  const clientIndex = CLIENTS.findIndex((client) => client.id === clientId)
  const petNames = PATIENTS.filter((patient) => patient.clientId === clientId).map((patient) => patient.name)
  CLIENTS.splice(clientIndex, 1, { ...CLIENTS[clientIndex], petNames })
}

export function resolvePatientsList(query: PatientsListQuery): Promise<PatientsListPage> {
  return Promise.resolve().then(() => ({
    owner: findPatientOwner(query.clientId),
    patients: paginateRows(
      PATIENTS.filter((patient) => patient.clientId === query.clientId),
      query,
    ),
  }))
}
