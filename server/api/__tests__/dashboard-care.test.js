import {beforeEach, describe, expect, it} from 'vitest';
import {resetAndLoad} from '@/tests/fixtures.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OTHER_OWNER, OWNER, SUPERADMIN} from './helpers/profiles.js';
import '@/permissions/dashboard-care/dashboard-care.permissions.js';
import dashboardCareGet from '@/api/dashboard-care.get.js';

const FIXTURES = [
  ...ACCOUNT_FIXTURES,
  'api/__tests__/fixtures/clients.js',
  'api/__tests__/fixtures/patients.js',
  'api/__tests__/fixtures/visits.js',
  'api/__tests__/fixtures/visits-service.js'
];

describe('GET /api/dashboard-care', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('el dueño obtiene el resumen de atención de su organización', async () => {
    const {response, errors} = await dashboardCareGet(buildAuthedEvent({profile: OWNER}));

    expect(errors).toBeNull();
    expect(response).toHaveProperty('kpis');
    expect(response).toHaveProperty('panels');

    expect(response.kpis).toHaveProperty('waiting');
    expect(response.kpis).toHaveProperty('inConsultation');
    expect(response.kpis).toHaveProperty('dischargedToday');

    expect(response.panels).toHaveProperty('ongoingConsultations');
    expect(response.panels).toHaveProperty('referrals');
  });

  it('el empleado obtiene el resumen de su organización', async () => {
    const {response, errors} = await dashboardCareGet(buildAuthedEvent({profile: EMPLOYEE}));

    expect(errors).toBeNull();
    expect(response.kpis).toBeDefined();
  });

  it('aislamiento por organización: otra organización solo ve sus datos', async () => {
    const ownerRes = await dashboardCareGet(buildAuthedEvent({profile: OWNER}));
    const otherOwnerRes = await dashboardCareGet(buildAuthedEvent({profile: OTHER_OWNER}));

    expect(ownerRes.errors).toBeNull();
    expect(otherOwnerRes.errors).toBeNull();
    expect(otherOwnerRes.response.panels.ongoingConsultations.items).toHaveLength(0);
  });

  it('el superadmin no tiene el módulo: 400', async () => {
    const event = buildAuthedEvent({profile: SUPERADMIN});

    await dashboardCareGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('una clave no declarada en la query responde 400', async () => {
    const event = buildAuthedEvent({url: '/?invento=123', profile: OWNER});

    await dashboardCareGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });
});
