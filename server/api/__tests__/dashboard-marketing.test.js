import {beforeEach, describe, expect, it} from 'vitest';
import {resetAndLoad} from '@/tests/fixtures.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OTHER_OWNER, OWNER, SUPERADMIN} from './helpers/profiles.js';
import '@/permissions/dashboard-marketing/dashboard-marketing.permissions.js';
import dashboardMarketingGet from '@/api/dashboard-marketing.get.js';

const FIXTURES = [
  ...ACCOUNT_FIXTURES,
  'api/__tests__/fixtures/clients.js',
  'api/__tests__/fixtures/patients.js',
  'api/__tests__/fixtures/appointments.js',
  'api/__tests__/fixtures/portals.js',
  'api/__tests__/fixtures/portals-submission.js'
];

describe('GET /api/dashboard-marketing', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('el dueño obtiene el resumen de marketing de su organización', async () => {
    const {response, errors} = await dashboardMarketingGet(buildAuthedEvent({profile: OWNER}));

    expect(errors).toBeNull();
    expect(response).toHaveProperty('kpis');
    expect(response).toHaveProperty('bookingOrigins');
    expect(response).toHaveProperty('portalPerformance');
    expect(response).toHaveProperty('funnel');

    expect(response.kpis).toHaveProperty('onlineBookings');
    expect(response.kpis).toHaveProperty('newClients');

    expect(response.bookingOrigins).toHaveProperty('total');
    expect(response.bookingOrigins).toHaveProperty('segments');

    expect(response.funnel).toHaveProperty('booked');
    expect(response.funnel).toHaveProperty('attended');
  });

  it('el empleado obtiene el resumen de marketing de su organización', async () => {
    const {response, errors} = await dashboardMarketingGet(buildAuthedEvent({profile: EMPLOYEE}));

    expect(errors).toBeNull();
    expect(response.kpis).toBeDefined();
  });

  it('aislamiento por organización: otra organización solo ve sus datos', async () => {
    const ownerRes = await dashboardMarketingGet(buildAuthedEvent({profile: OWNER}));
    const otherOwnerRes = await dashboardMarketingGet(buildAuthedEvent({profile: OTHER_OWNER}));

    expect(ownerRes.errors).toBeNull();
    expect(otherOwnerRes.errors).toBeNull();
    expect(otherOwnerRes.response.portalPerformance).toHaveLength(1);
    expect(otherOwnerRes.response.portalPerformance[0].name).toBe('Portal Sur');
    expect(ownerRes.response.portalPerformance.map((item) => item.name)).not.toContain('Portal Sur');
  });

  it('el superadmin no tiene el módulo: 400', async () => {
    const event = buildAuthedEvent({profile: SUPERADMIN});

    await dashboardMarketingGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('una clave no declarada en la query responde 400', async () => {
    const event = buildAuthedEvent({url: '/?invento=123', profile: OWNER});

    await dashboardMarketingGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });
});
