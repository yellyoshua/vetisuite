import {beforeEach, describe, expect, it} from 'vitest';
import {resetAndLoad} from '@/tests/fixtures.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OTHER_OWNER, OWNER, SUPERADMIN} from './helpers/profiles.js';
import '@/permissions/dashboard-laboratory/dashboard-laboratory.permissions.js';
import dashboardLaboratoryGet from '@/api/dashboard-laboratory.get.js';

const FIXTURES = [
  ...ACCOUNT_FIXTURES,
  'api/__tests__/fixtures/clients.js',
  'api/__tests__/fixtures/patients.js',
  'api/__tests__/fixtures/visits.js',
  'api/__tests__/fixtures/visits-service.js'
];

describe('GET /api/dashboard-laboratory', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('el dueño obtiene el resumen de laboratorio de su organización', async () => {
    const {response, errors} = await dashboardLaboratoryGet(buildAuthedEvent({profile: OWNER}));

    expect(errors).toBeNull();
    expect(response).toHaveProperty('kpis');
    expect(response).toHaveProperty('panels');

    expect(response.kpis).toHaveProperty('openOrders');
    expect(response.kpis).toHaveProperty('inAnalysis');
    expect(response.kpis).toHaveProperty('todayResults');

    expect(response.panels).toHaveProperty('pendingOrders');
    expect(response.panels).toHaveProperty('topExams');
  });

  it('el empleado obtiene el resumen de su organización', async () => {
    const {response, errors} = await dashboardLaboratoryGet(buildAuthedEvent({profile: EMPLOYEE}));

    expect(errors).toBeNull();
    expect(response.kpis).toBeDefined();
  });

  it('aislamiento por organización: otra organización solo ve sus datos', async () => {
    const ownerRes = await dashboardLaboratoryGet(buildAuthedEvent({profile: OWNER}));
    const otherOwnerRes = await dashboardLaboratoryGet(buildAuthedEvent({profile: OTHER_OWNER}));

    expect(ownerRes.errors).toBeNull();
    expect(otherOwnerRes.errors).toBeNull();
    expect(otherOwnerRes.response.panels.pendingOrders.items).toHaveLength(0);
  });

  it('el superadmin no tiene el módulo: 400', async () => {
    const event = buildAuthedEvent({profile: SUPERADMIN});

    await dashboardLaboratoryGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('una clave no declarada en la query responde 400', async () => {
    const event = buildAuthedEvent({url: '/?invento=123', profile: OWNER});

    await dashboardLaboratoryGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });
});
