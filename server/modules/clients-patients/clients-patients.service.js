import {and, eq, isNull} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {patientsTable} from '@vetisuite/database/schemas/schemas.js';

export async function createPatient (organization, {client, name, species, breed, sex, birthDate}) {
  const [patient] = await db.insert(patientsTable)
  .values({organization, client, name, species, breed, sex, birthDate})
  .returning();

  return {patient};
}

export async function updatePatient (id, {name, species, breed, sex, birthDate}) {
  const [patient] = await db.update(patientsTable)
  .set({name, species, breed, sex, birthDate, updatedAt: new Date()})
  .where(and(eq(patientsTable.id, id), isNull(patientsTable.archivedAt)))
  .returning();

  if (!patient) {
    throw {error: 'Paciente no encontrado', status: 404};
  }

  return {patient};
}

export async function archivePatient (id) {
  const [patient] = await db.update(patientsTable)
  .set({archivedAt: new Date(), updatedAt: new Date()})
  .where(and(eq(patientsTable.id, id), isNull(patientsTable.archivedAt)))
  .returning({id: patientsTable.id});

  if (!patient) {
    throw {error: 'Paciente no encontrado', status: 404};
  }

  return {patient};
}
