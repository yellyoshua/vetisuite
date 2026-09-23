import {beforeEach, describe, expect, it} from 'vitest';
import {resetAndLoad} from '@/tests/fixtures.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OTHER_OWNER, OWNER, SUPERADMIN} from './helpers/profiles.js';
import '@/permissions/dashboard-billing/dashboard-billing.permissions.js';
import dashboardBillingGet from '@/api/dashboard-billing.get.js';

const FIXTURES = [
  ...ACCOUNT_FIXTURES,
  'api/__tests__/fixtures/clients.js',
  'api/__tests__/fixtures/patients.js',
  'api/__tests__/fixtures/invoices.js',
  'api/__tests__/fixtures/invoices-item.js'
];

describe('GET /api/dashboard-billing', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('el dueño obtiene el resumen de facturación de su organización', async () => {
    const {response, errors} = await dashboardBillingGet(buildAuthedEvent({profile: OWNER}));

    expect(errors).toBeNull();
    expect(response).toHaveProperty('kpis');
    expect(response).toHaveProperty('panels');

    expect(response.kpis).toHaveProperty('todayRevenue');
    expect(response.kpis).toHaveProperty('openAccounts');
    expect(response.kpis).toHaveProperty('receivables');
    expect(response.kpis).toHaveProperty('averageTicket');

    expect(response.panels).toHaveProperty('accountsToClose');
    expect(response.panels).toHaveProperty('pendingCollections');
  });

  it('el empleado obtiene el resumen de facturación de su organización', async () => {
    const {response, errors} = await dashboardBillingGet(buildAuthedEvent({profile: EMPLOYEE}));

    expect(errors).toBeNull();
    expect(response.kpis).toBeDefined();
  });

  it('aislamiento por organización: otra organización solo ve sus datos', async () => {
    const ownerRes = await dashboardBillingGet(buildAuthedEvent({profile: OWNER}));
    const otherOwnerRes = await dashboardBillingGet(buildAuthedEvent({profile: OTHER_OWNER}));

    expect(ownerRes.errors).toBeNull();
    expect(otherOwnerRes.errors).toBeNull();
    expect(otherOwnerRes.response.panels.accountsToClose.items).toHaveLength(0);
  });

  it('el superadmin no tiene el módulo: 400', async () => {
    const event = buildAuthedEvent({profile: SUPERADMIN});

    await dashboardBillingGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('una clave no declarada en la query responde 400', async () => {
    const event = buildAuthedEvent({url: '/?invento=123', profile: OWNER});

    await dashboardBillingGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });
});
