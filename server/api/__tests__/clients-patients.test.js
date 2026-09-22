import {beforeEach, describe, expect, it} from 'vitest';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {patientsTable} from '@vetisuite/database/schemas/schemas.js';
import {resetAndLoad} from '@/tests/fixtures.js';
import responseBody from '@/tests/response-body.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OTHER_OWNER, OWNER} from './helpers/profiles.js';
import patientsGet from '@/api/clients-patients.get.js';
import patientsPost from '@/api/clients-patients.post.js';
import patientsPut from '@/api/clients-patients.put.js';
import patientsDelete from '@/api/clients-patients.delete.js';

const FIXTURES = [...ACCOUNT_FIXTURES, 'api/__tests__/fixtures/clients.js', 'api/__tests__/fixtures/patients.js'];

const OWN_CLIENT = '992e8400-e29b-41d4-a716-446655440001';
const FOREIGN_CLIENT = '992e8400-e29b-41d4-a716-446655440003';
const ARCHIVED_CLIENT = '992e8400-e29b-41d4-a716-446655440004';
const OWN_PATIENT = 'aa2e8400-e29b-41d4-a716-446655440001';
const SECOND_PATIENT = 'aa2e8400-e29b-41d4-a716-446655440002';
const FOREIGN_PATIENT = 'aa2e8400-e29b-41d4-a716-446655440003';

async function findPatient (id) {
  const [patient] = await db.select().from(patientsTable).where(eq(patientsTable.id, id));

  return patient;
}

describe('GET /api/clients-patients', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('lista los pacientes de la organización con el cliente resuelto', async () => {
    const {response, errors} = await patientsGet(buildAuthedEvent({profile: EMPLOYEE}));

    expect(errors).toBeNull();
    expect(response.map((patient) => patient.id).sort()).toEqual([OWN_PATIENT, SECOND_PATIENT]);
    expect(Object.keys(response[0].client).sort()).toEqual(['id', 'name', 'phone']);
  });

  it('filtra por cliente y un cliente ajeno no devuelve nada', async () => {
    const own = await patientsGet(buildAuthedEvent({url: `/?client=${OWN_CLIENT}`, profile: OWNER}));
    const foreign = await patientsGet(buildAuthedEvent({url: `/?client=${FOREIGN_CLIENT}`, profile: OWNER}));

    expect(own.response.map((patient) => patient.name)).toEqual(['Firulais']);
    expect(foreign.response).toEqual([]);
  });

  it('una clave no declarada o un cliente malformado responde 400', async () => {
    const undeclared = buildAuthedEvent({url: '/?organization=x', profile: OWNER});
    const malformed = buildAuthedEvent({url: '/?client=no-es-uuid', profile: OWNER});

    await patientsGet(undeclared);
    await patientsGet(malformed);

    expect(undeclared.node.res.statusCode).toBe(400);
    expect(malformed.node.res.statusCode).toBe(400);
    expect(responseBody(malformed).fields).toEqual(['client']);
  });
});

describe('POST, PUT y DELETE /api/clients-patients', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('registra un paciente de un cliente de la organización', async () => {
    const {response} = await patientsPost(buildAuthedEvent({
      method: 'POST',
      body: {client: OWN_CLIENT, name: 'Luna', species: 'dog', sex: '', birthDate: '2024-02-10'},
      profile: EMPLOYEE
    }));

    expect(response.patient.organization).toBe(EMPLOYEE.organization);
    expect(response.patient.sex).toBeNull();
    expect(response.patient.birthDate).toBe('2024-02-10');
  });

  it('no registra pacientes de un cliente ajeno ni de uno archivado', async () => {
    const foreign = buildAuthedEvent({method: 'POST', body: {client: FOREIGN_CLIENT, name: 'Intruso', species: 'cat'}, profile: OWNER});
    const archived = buildAuthedEvent({method: 'POST', body: {client: ARCHIVED_CLIENT, name: 'Fantasma', species: 'cat'}, profile: OWNER});

    await patientsPost(foreign);
    await patientsPost(archived);

    expect(foreign.node.res.statusCode).toBe(404);
    expect(responseBody(foreign).errors).toEqual(['Cliente no encontrado']);
    expect(archived.node.res.statusCode).toBe(404);
  });

  it('una especie fuera del catálogo responde 400 con el campo', async () => {
    const event = buildAuthedEvent({method: 'POST', body: {client: OWN_CLIENT, name: 'Nemo', species: 'fish'}, profile: OWNER});

    await patientsPost(event);

    expect(event.node.res.statusCode).toBe(400);
    expect(responseBody(event).fields).toEqual(['species']);
  });

  it('edita un paciente propio y no uno ajeno', async () => {
    const own = await patientsPut(buildAuthedEvent({method: 'PUT', body: {id: OWN_PATIENT, breed: 'Labrador'}, profile: EMPLOYEE}));
    const foreign = buildAuthedEvent({method: 'PUT', body: {id: FOREIGN_PATIENT, name: 'Robado'}, profile: OWNER});

    await patientsPut(foreign);

    expect(own.response.patient.breed).toBe('Labrador');
    expect(foreign.node.res.statusCode).toBe(404);
    expect((await findPatient(FOREIGN_PATIENT)).name).toBe('Ajeno');
  });

  it('el dueño archiva; el empleado y el dueño de otra organización no', async () => {
    const byEmployee = buildAuthedEvent({method: 'DELETE', url: `/?id=${SECOND_PATIENT}`, profile: EMPLOYEE});
    const byOtherOwner = buildAuthedEvent({method: 'DELETE', url: `/?id=${SECOND_PATIENT}`, profile: OTHER_OWNER});

    await patientsDelete(byEmployee);
    await patientsDelete(byOtherOwner);

    expect(byEmployee.node.res.statusCode).toBe(400);
    expect(byOtherOwner.node.res.statusCode).toBe(404);
    expect((await findPatient(SECOND_PATIENT)).archivedAt).toBeNull();

    const {response} = await patientsDelete(buildAuthedEvent({method: 'DELETE', url: `/?id=${SECOND_PATIENT}`, profile: OWNER}));

    expect(response.patient.id).toBe(SECOND_PATIENT);
    expect((await findPatient(SECOND_PATIENT)).archivedAt).toBeInstanceOf(Date);
  });
});
