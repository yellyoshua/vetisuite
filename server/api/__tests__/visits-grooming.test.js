import {beforeEach, describe, expect, it} from 'vitest';
import {resetAndLoad} from '@/tests/fixtures.js';
import responseBody from '@/tests/response-body.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OTHER_OWNER, OWNER, SUPERADMIN} from './helpers/profiles.js';
import '@/permissions/visits-grooming/visits-grooming.permissions.js';
import '@/permissions/visits-grooming-count/visits-grooming-count.permissions.js';
import visitsGroomingGet from '@/api/visits-grooming.get.js';
import visitsGroomingCountGet from '@/api/visits-grooming-count.get.js';

const FIXTURES = [
  ...ACCOUNT_FIXTURES,
  'api/__tests__/fixtures/clients.js',
  'api/__tests__/fixtures/patients.js',
  'api/__tests__/fixtures/visits.js',
  'api/__tests__/fixtures/visits-service.js',
  'api/__tests__/fixtures/visits-grooming.js'
];

const OWN_GROOMING_FIRST = 'dd2e8400-e29b-41d4-a716-446655440002';
const OWN_GROOMING_SECOND = 'dd2e8400-e29b-41d4-a716-446655440001';
const FOREIGN_GROOMING = 'dd2e8400-e29b-41d4-a716-446655440003';

describe('GET /api/visits-grooming y /api/visits-grooming-count', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('el dueño lista los servicios de peluquería vigentes de su organización', async () => {
    const {response, errors} = await visitsGroomingGet(buildAuthedEvent({profile: OWNER}));

    expect(errors).toBeNull();
    expect(response.map((item) => item.id)).toEqual([OWN_GROOMING_FIRST, OWN_GROOMING_SECOND]);
    expect(response[0]).toEqual({
      id: OWN_GROOMING_FIRST,
      patientName: 'Firulais',
      ownerName: 'Carla Méndez',
      serviceName: 'Consulta general',
      stylistName: '',
      checkInTime: '2026-01-03T10:00:00.000Z',
      status: 'pending'
    });
    expect(response[1]).toEqual({
      id: OWN_GROOMING_SECOND,
      patientName: 'Michi',
      ownerName: 'Jorge Lara',
      serviceName: 'Baño completo',
      stylistName: 'Marta Díaz',
      checkInTime: '2026-01-02T10:00:00.000Z',
      status: 'in-progress'
    });
  });

  it('el empleado lista los servicios de su organización y el dueño de otra los suyos', async () => {
    const employeeList = await visitsGroomingGet(buildAuthedEvent({profile: EMPLOYEE}));
    const otherOwnerList = await visitsGroomingGet(buildAuthedEvent({profile: OTHER_OWNER}));

    expect(employeeList.response).toHaveLength(2);
    expect(otherOwnerList.response.map((item) => item.id)).toEqual([FOREIGN_GROOMING]);
    expect(otherOwnerList.response[0]).toEqual({
      id: FOREIGN_GROOMING,
      patientName: 'Ajeno',
      ownerName: 'Ajena Sur',
      serviceName: 'Hemograma completo',
      stylistName: 'Pedro Ruiz',
      checkInTime: '2026-01-01T09:00:00.000Z',
      status: 'pending'
    });
  });

  it('busca por nombre de paciente o dueño', async () => {
    const byPatient = await visitsGroomingGet(buildAuthedEvent({url: '/?search=michi', profile: OWNER}));
    const byOwner = await visitsGroomingGet(buildAuthedEvent({url: '/?search=carla', profile: OWNER}));

    expect(byPatient.response.map((item) => item.id)).toEqual([OWN_GROOMING_SECOND]);
    expect(byOwner.response.map((item) => item.id)).toEqual([OWN_GROOMING_FIRST]);
  });

  it('filtra por estado', async () => {
    const inProgress = await visitsGroomingGet(buildAuthedEvent({url: '/?status=in-progress', profile: OWNER}));
    const pending = await visitsGroomingGet(buildAuthedEvent({url: '/?status=pending', profile: OWNER}));

    expect(inProgress.response.map((item) => item.id)).toEqual([OWN_GROOMING_SECOND]);
    expect(pending.response.map((item) => item.id)).toEqual([OWN_GROOMING_FIRST]);
  });

  it('filtra por preset', async () => {
    const undelivered = await visitsGroomingGet(buildAuthedEvent({url: '/?preset=undelivered', profile: OWNER}));
    const delivered = await visitsGroomingGet(buildAuthedEvent({url: '/?preset=delivered', profile: OWNER}));

    expect(undelivered.response).toHaveLength(2);
    expect(delivered.response).toEqual([]);
  });

  it('el superadmin no tiene el módulo: 400', async () => {
    const event = buildAuthedEvent({profile: SUPERADMIN});

    await visitsGroomingGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('una clave no declarada en la query responde 400', async () => {
    const event = buildAuthedEvent({url: '/?invento=123', profile: OWNER});

    await visitsGroomingGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('un id malformado responde 400 con el campo', async () => {
    const event = buildAuthedEvent({url: '/?id=no-es-uuid', profile: OWNER});

    await visitsGroomingGet(event);

    expect(event.node.res.statusCode).toBe(400);
    expect(responseBody(event).fields).toEqual(['id']);
  });

  it('cuenta los servicios de peluquería de la organización, con búsqueda y filtros', async () => {
    const all = await visitsGroomingCountGet(buildAuthedEvent({profile: OWNER}));
    const searched = await visitsGroomingCountGet(buildAuthedEvent({url: '/?search=michi', profile: EMPLOYEE}));
    const filtered = await visitsGroomingCountGet(buildAuthedEvent({url: '/?status=in-progress', profile: OWNER}));
    const delivered = await visitsGroomingCountGet(buildAuthedEvent({url: '/?preset=delivered', profile: OWNER}));

    expect(all.response).toEqual({value: 2});
    expect(searched.response).toEqual({value: 1});
    expect(filtered.response).toEqual({value: 1});
    expect(delivered.response).toEqual({value: 0});
  });
});
