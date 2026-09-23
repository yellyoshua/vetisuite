import {beforeEach, describe, expect, it} from 'vitest';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {visitsServiceTable, visitsTable} from '@vetisuite/database/schemas/schemas.js';
import {resetAndLoad} from '@/tests/fixtures.js';
import responseBody from '@/tests/response-body.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OTHER_OWNER, OWNER, SUPERADMIN} from './helpers/profiles.js';
import '@/permissions/visits/visits.permissions.js';
import '@/permissions/visits-count/visits-count.permissions.js';
import '@/permissions/visits-status/visits-status.permissions.js';
import visitsGet from '@/api/visits.get.js';
import visitsCountGet from '@/api/visits-count.get.js';
import visitsStatusPut from '@/api/visits-status.put.js';

const FIXTURES = [
  ...ACCOUNT_FIXTURES,
  'api/__tests__/fixtures/clients.js',
  'api/__tests__/fixtures/patients.js',
  'api/__tests__/fixtures/visits.js',
  'api/__tests__/fixtures/visits-service.js'
];

const OWN_VISIT = 'bb2e8400-e29b-41d4-a716-446655440001';
const IN_PROGRESS_VISIT = 'bb2e8400-e29b-41d4-a716-446655440002';
const FOREIGN_VISIT = 'bb2e8400-e29b-41d4-a716-446655440003';
const ARCHIVED_VISIT = 'bb2e8400-e29b-41d4-a716-446655440004';

describe('GET /api/visits y /api/visits-count', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('el dueño lista solo las visitas vigentes de su organización', async () => {
    const {response, errors} = await visitsGet(buildAuthedEvent({profile: OWNER}));

    expect(errors).toBeNull();
    expect(response.map((visit) => visit.id)).toEqual([OWN_VISIT, IN_PROGRESS_VISIT]);
    expect(response[0]).toMatchObject({
      id: OWN_VISIT,
      type: 'ambulatory',
      patientName: 'Firulais',
      ownerName: 'Carla Méndez',
      service: 'Consulta general',
      status: 'pending'
    });
  });

  it('el empleado lista las visitas de su organización y el dueño de otra las suyas', async () => {
    const employeeList = await visitsGet(buildAuthedEvent({profile: EMPLOYEE}));
    const otherOwnerList = await visitsGet(buildAuthedEvent({profile: OTHER_OWNER}));

    expect(employeeList.response).toHaveLength(2);
    expect(otherOwnerList.response.map((visit) => visit.id)).toEqual([FOREIGN_VISIT]);
  });

  it('busca por nombre de paciente o dueño', async () => {
    const {response} = await visitsGet(buildAuthedEvent({url: '/?search=firulais', profile: OWNER}));

    expect(response.map((visit) => visit.id)).toEqual([OWN_VISIT]);
  });

  it('filtra por tipo de visita', async () => {
    const {response} = await visitsGet(buildAuthedEvent({url: '/?type=grooming', profile: OWNER}));

    expect(response.map((visit) => visit.id)).toEqual([IN_PROGRESS_VISIT]);
  });

  it('filtra por estado de visita', async () => {
    const {response} = await visitsGet(buildAuthedEvent({url: '/?status=in-progress', profile: OWNER}));

    expect(response.map((visit) => visit.id)).toEqual([IN_PROGRESS_VISIT]);
  });

  it('el superadmin no tiene el módulo: 400', async () => {
    const event = buildAuthedEvent({profile: SUPERADMIN});

    await visitsGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('una clave no declarada en la query responde 400', async () => {
    const event = buildAuthedEvent({url: '/?invento=123', profile: OWNER});

    await visitsGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('un id malformado responde 400 con el campo', async () => {
    const event = buildAuthedEvent({url: '/?id=no-es-uuid', profile: OWNER});

    await visitsGet(event);

    expect(event.node.res.statusCode).toBe(400);
    expect(responseBody(event).fields).toEqual(['id']);
  });

  it('cuenta las visitas vigentes de la organización, con búsqueda', async () => {
    const all = await visitsCountGet(buildAuthedEvent({profile: OWNER}));
    const searched = await visitsCountGet(buildAuthedEvent({url: '/?search=michi', profile: EMPLOYEE}));

    expect(all.response).toEqual({value: 2});
    expect(searched.response).toEqual({value: 1});
  });
});

describe('PUT /api/visits-status', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('el empleado avanza una visita de pending a in-progress', async () => {
    const {response, errors} = await visitsStatusPut(buildAuthedEvent({
      method: 'PUT',
      body: {id: OWN_VISIT},
      profile: EMPLOYEE
    }));

    expect(errors).toBeNull();
    expect(response.success).toBe(true);

    const [visit] = await db.select().from(visitsTable).where(eq(visitsTable.id, OWN_VISIT));
    expect(visit.started).toBe(true);

    const [service] = await db.select().from(visitsServiceTable).where(eq(visitsServiceTable.visit, OWN_VISIT));
    expect(service.status).toBe('in_progress');
  });

  it('el dueño avanza una visita de in-progress a done', async () => {
    const {response, errors} = await visitsStatusPut(buildAuthedEvent({
      method: 'PUT',
      body: {id: IN_PROGRESS_VISIT},
      profile: OWNER
    }));

    expect(errors).toBeNull();
    expect(response.success).toBe(true);

    const [service] = await db.select().from(visitsServiceTable).where(eq(visitsServiceTable.visit, IN_PROGRESS_VISIT));
    expect(service.status).toBe('done');
  });

  it('avanzar una visita de otra organización responde 404', async () => {
    const event = buildAuthedEvent({method: 'PUT', body: {id: FOREIGN_VISIT}, profile: OWNER});

    await visitsStatusPut(event);

    expect(event.node.res.statusCode).toBe(404);
  });

  it('avanzar una visita archivada responde 404', async () => {
    const event = buildAuthedEvent({method: 'PUT', body: {id: ARCHIVED_VISIT}, profile: OWNER});

    await visitsStatusPut(event);

    expect(event.node.res.statusCode).toBe(404);
  });

  it('el superadmin no tiene permisos para avanzar estado: 400', async () => {
    const event = buildAuthedEvent({method: 'PUT', body: {id: OWN_VISIT}, profile: SUPERADMIN});

    await visitsStatusPut(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('una clave no declarada en el body responde 400', async () => {
    const event = buildAuthedEvent({method: 'PUT', body: {id: OWN_VISIT, invento: 'campo'}, profile: OWNER});

    await visitsStatusPut(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('avanzar una visita ya finalizada responde 400', async () => {
    await visitsStatusPut(buildAuthedEvent({
      method: 'PUT',
      body: {id: IN_PROGRESS_VISIT},
      profile: OWNER
    }));

    const event = buildAuthedEvent({
      method: 'PUT',
      body: {id: IN_PROGRESS_VISIT},
      profile: OWNER
    });

    await visitsStatusPut(event);

    expect(event.node.res.statusCode).toBe(400);
  });
});
