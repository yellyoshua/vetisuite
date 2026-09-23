import {beforeEach, describe, expect, it} from 'vitest';
import {resetAndLoad} from '@/tests/fixtures.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OTHER_OWNER, OWNER, SUPERADMIN} from './helpers/profiles.js';
import '@/permissions/dashboard-inventory/dashboard-inventory.permissions.js';
import dashboardInventoryGet from '@/api/dashboard-inventory.get.js';

const FIXTURES = [
  ...ACCOUNT_FIXTURES,
  'api/__tests__/fixtures/clients.js',
  'api/__tests__/fixtures/patients.js',
  'api/__tests__/fixtures/products.js',
  'api/__tests__/fixtures/invoices.js',
  'api/__tests__/fixtures/invoices-item.js'
];

describe('GET /api/dashboard-inventory', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('el dueño obtiene el resumen de inventario de su organización', async () => {
    const {response, errors} = await dashboardInventoryGet(buildAuthedEvent({profile: OWNER}));

    expect(errors).toBeNull();
    expect(response).toHaveProperty('kpis');
    expect(response).toHaveProperty('panels');

    expect(response.kpis).toHaveProperty('stockAlerts');
    expect(response.kpis).toHaveProperty('inventoryValue');

    expect(response.panels).toHaveProperty('stockAlerts');
    expect(response.panels).toHaveProperty('consumptionByArea');
  });

  it('el empleado obtiene el resumen de su organización', async () => {
    const {response, errors} = await dashboardInventoryGet(buildAuthedEvent({profile: EMPLOYEE}));

    expect(errors).toBeNull();
    expect(response.kpis).toBeDefined();
  });

  it('aislamiento por organización: otra organización solo ve sus datos', async () => {
    const ownerRes = await dashboardInventoryGet(buildAuthedEvent({profile: OWNER}));
    const otherOwnerRes = await dashboardInventoryGet(buildAuthedEvent({profile: OTHER_OWNER}));

    expect(ownerRes.errors).toBeNull();
    expect(otherOwnerRes.errors).toBeNull();
    expect(otherOwnerRes.response.panels.stockAlerts.items).toHaveLength(0);
  });

  it('el superadmin no tiene el módulo: 400', async () => {
    const event = buildAuthedEvent({profile: SUPERADMIN});

    await dashboardInventoryGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('una clave no declarada en la query responde 400', async () => {
    const event = buildAuthedEvent({url: '/?invento=123', profile: OWNER});

    await dashboardInventoryGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });
});
