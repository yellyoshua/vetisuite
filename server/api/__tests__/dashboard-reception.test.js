import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {resetAndLoad} from '@/tests/fixtures.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OTHER_OWNER, OWNER, SUPERADMIN} from './helpers/profiles.js';
import '@/permissions/dashboard-reception/dashboard-reception.permissions.js';
import dashboardReceptionGet from '@/api/dashboard-reception.get.js';

const FIXTURES = [
  ...ACCOUNT_FIXTURES,
  'api/__tests__/fixtures/clients.js',
  'api/__tests__/fixtures/patients.js',
  'api/__tests__/fixtures/appointments.js'
];

describe('GET /api/dashboard-reception', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
    vi.useFakeTimers({toFake: ['Date']});
    vi.setSystemTime(new Date('2026-09-22T15:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('el dueño obtiene el resumen de recepción de su organización', async () => {
    const {response, errors} = await dashboardReceptionGet(buildAuthedEvent({profile: OWNER}));

    expect(errors).toBeNull();
    expect(response).toHaveProperty('kpis');
    expect(response).toHaveProperty('dailyAppointments');
    expect(response).toHaveProperty('todayStatuses');
    expect(response).toHaveProperty('demandHours');
    expect(response).toHaveProperty('agenda');

    expect(response.kpis).toHaveProperty('todayAppointments');
    expect(response.kpis).toHaveProperty('confirmed');
    expect(response.kpis).toHaveProperty('pending');
    expect(response.kpis).toHaveProperty('attendance');
  });

  it('el empleado obtiene el resumen de su organización', async () => {
    const {response, errors} = await dashboardReceptionGet(buildAuthedEvent({profile: EMPLOYEE}));

    expect(errors).toBeNull();
    expect(response.kpis).toBeDefined();
  });

  it('aislamiento por organización: otra organización solo ve sus datos', async () => {
    const ownerRes = await dashboardReceptionGet(buildAuthedEvent({profile: OWNER}));
    const otherOwnerRes = await dashboardReceptionGet(buildAuthedEvent({profile: OTHER_OWNER}));

    expect(ownerRes.errors).toBeNull();
    expect(otherOwnerRes.errors).toBeNull();
    expect(ownerRes.response.agenda).toHaveLength(2);
    expect(otherOwnerRes.response.agenda).toHaveLength(1);
    expect(otherOwnerRes.response.agenda[0].detail).toContain('Chequeo general');
  });

  it('la agenda muestra la hora de pared sin convertir', async () => {
    const {response} = await dashboardReceptionGet(buildAuthedEvent({profile: OWNER}));

    expect(response.agenda.map((entry) => entry.time)).toEqual(['09:00', '10:00']);
  });

  it('a las 22:00 de Guayaquil la agenda de hoy sigue siendo la del día en la clínica', async () => {
    vi.setSystemTime(new Date('2026-09-23T03:00:00.000Z'));

    const {response} = await dashboardReceptionGet(buildAuthedEvent({profile: OWNER}));

    expect(response.agenda).toHaveLength(2);
    expect(response.kpis.todayAppointments.value).toBe('2');
  });

  it('el superadmin no tiene el módulo: 400', async () => {
    const event = buildAuthedEvent({profile: SUPERADMIN});

    await dashboardReceptionGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('una clave no declarada en la query responde 400', async () => {
    const event = buildAuthedEvent({url: '/?invento=123', profile: OWNER});

    await dashboardReceptionGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });
});
