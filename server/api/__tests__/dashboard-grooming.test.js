import {beforeEach, describe, expect, it} from 'vitest';
import {resetAndLoad} from '@/tests/fixtures.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OTHER_OWNER, OWNER, SUPERADMIN} from './helpers/profiles.js';
import '@/permissions/dashboard-grooming/dashboard-grooming.permissions.js';
import dashboardGroomingGet from '@/api/dashboard-grooming.get.js';

const FIXTURES = [
  ...ACCOUNT_FIXTURES,
  'api/__tests__/fixtures/clients.js',
  'api/__tests__/fixtures/patients.js',
  'api/__tests__/fixtures/visits.js',
  'api/__tests__/fixtures/visits-service.js',
  'api/__tests__/fixtures/visits-grooming.js'
];

describe('GET /api/dashboard-grooming', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('el dueño obtiene el resumen de estética de su organización', async () => {
    const {response, errors} = await dashboardGroomingGet(buildAuthedEvent({profile: OWNER}));

    expect(errors).toBeNull();
    expect(response).toHaveProperty('kpis');
    expect(response).toHaveProperty('panels');

    expect(response.kpis).toHaveProperty('todayServices');
    expect(response.kpis).toHaveProperty('inProgress');
    expect(response.kpis).toHaveProperty('finished');
    expect(response.kpis).toHaveProperty('averageTicket');

    expect(response.panels).toHaveProperty('groomingRoom');
    expect(response.panels).toHaveProperty('topServices');
  });

  it('el empleado obtiene el resumen de su organización', async () => {
    const {response, errors} = await dashboardGroomingGet(buildAuthedEvent({profile: EMPLOYEE}));

    expect(errors).toBeNull();
    expect(response.kpis).toBeDefined();
  });

  it('aislamiento por organización: otra organización solo ve sus datos', async () => {
    const ownerRes = await dashboardGroomingGet(buildAuthedEvent({profile: OWNER}));
    const otherOwnerRes = await dashboardGroomingGet(buildAuthedEvent({profile: OTHER_OWNER}));

    expect(ownerRes.errors).toBeNull();
    expect(otherOwnerRes.errors).toBeNull();
    expect(otherOwnerRes.response.panels.groomingRoom.items).toHaveLength(0);
  });

  it('el superadmin no tiene el módulo: 400', async () => {
    const event = buildAuthedEvent({profile: SUPERADMIN});

    await dashboardGroomingGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('una clave no declarada en la query responde 400', async () => {
    const event = buildAuthedEvent({url: '/?invento=123', profile: OWNER});

    await dashboardGroomingGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });
});
