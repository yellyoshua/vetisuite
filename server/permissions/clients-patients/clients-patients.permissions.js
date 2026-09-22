import {pkit} from '../pkit.config.js';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {clientsTable, patientsTable} from '@vetisuite/database/schemas/schemas.js';

const patientColumns = ['id', 'client', 'name', 'species', 'breed', 'sex', 'birthDate', 'createdAt', 'updatedAt'];
const writableFields = ['name', 'species', 'breed', 'sex', 'birthDate'];

async function assertOrganizationClient (data, context) {
  const [client] = await db.select({organization: clientsTable.organization, archivedAt: clientsTable.archivedAt})
  .from(clientsTable)
  .where(eq(clientsTable.id, data.client))
  .limit(1);

  if (!client || client.archivedAt || client.organization !== context.profile.organization) {
    throw {error: 'Cliente no encontrado', status: 404};
  }
}

async function assertOrganizationPatient (data, context) {
  const [patient] = await db.select({organization: patientsTable.organization, archivedAt: patientsTable.archivedAt})
  .from(patientsTable)
  .where(eq(patientsTable.id, data.id))
  .limit(1);

  if (!patient || patient.archivedAt || patient.organization !== context.profile.organization) {
    throw {error: 'Paciente no encontrado', status: 404};
  }
}

const clientsPatients = pkit.module('clients-patients').name('general');

clientsPatients.role('owner').registerActions({
  find: {enabled: true, properties: [...patientColumns, 'search']},
  create: {enabled: true, properties: ['client', ...writableFields]},
  update: {enabled: true, properties: ['id', ...writableFields]},
  remove: {enabled: true, properties: ['id']}
})
.hook('create', assertOrganizationClient)
.hook('update', assertOrganizationPatient)
.hook('remove', assertOrganizationPatient);

clientsPatients.role('employee').registerActions({
  find: {enabled: true, properties: [...patientColumns, 'search']},
  create: {enabled: true, properties: ['client', ...writableFields]},
  update: {enabled: true, properties: ['id', ...writableFields]}
})
.hook('create', assertOrganizationClient)
.hook('update', assertOrganizationPatient);
