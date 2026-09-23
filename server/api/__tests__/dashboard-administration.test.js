import {beforeEach, describe, expect, it} from 'vitest';
import {resetAndLoad} from '@/tests/fixtures.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OTHER_OWNER, OWNER, SUPERADMIN} from './helpers/profiles.js';
import '@/permissions/dashboard-administration/dashboard-administration.permissions.js';
import dashboardAdministrationGet from '@/api/dashboard-administration.get.js';

const FIXTURES = [
  ...ACCOUNT_FIXTURES,
  'api/__tests__/fixtures/sessions.js'
];

describe('GET /api/dashboard-administration', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('el dueño obtiene el resumen de administración de su organización', async () => {
    const {response, errors} = await dashboardAdministrationGet(buildAuthedEvent({profile: OWNER}));

    expect(errors).toBeNull();
    expect(response).toHaveProperty('kpis');
    expect(response).toHaveProperty('panels');

    expect(response.kpis).toHaveProperty('activeUsers');
    expect(response.kpis).toHaveProperty('roles');
    expect(response.kpis).toHaveProperty('todayLogins');
    expect(response.kpis).toHaveProperty('enabledModules');

    expect(response.panels).toHaveProperty('rolePermissions');
    expect(response.panels).toHaveProperty('recentLogins');
  });

  it('el empleado no tiene acceso al módulo: 400', async () => {
    const event = buildAuthedEvent({profile: EMPLOYEE});

    await dashboardAdministrationGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('aislamiento por organización: otra organización solo ve sus datos', async () => {
    const ownerRes = await dashboardAdministrationGet(buildAuthedEvent({profile: OWNER}));
    const otherOwnerRes = await dashboardAdministrationGet(buildAuthedEvent({profile: OTHER_OWNER}));

    expect(ownerRes.errors).toBeNull();
    expect(otherOwnerRes.errors).toBeNull();
    expect(ownerRes.response.kpis.activeUsers.detail).toBe('de 3 cuentas creadas');
    expect(otherOwnerRes.response.kpis.activeUsers.detail).toBe('de 2 cuentas creadas');
  });

  it('el superadmin no tiene el módulo: 400', async () => {
    const event = buildAuthedEvent({profile: SUPERADMIN});

    await dashboardAdministrationGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('una clave no declarada en la query responde 400', async () => {
    const event = buildAuthedEvent({url: '/?invento=123', profile: OWNER});

    await dashboardAdministrationGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });
});
