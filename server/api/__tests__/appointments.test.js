import {beforeEach, describe, expect, it} from 'vitest';
import {resetAndLoad} from '@/tests/fixtures.js';
import responseBody from '@/tests/response-body.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OTHER_OWNER, OWNER, SUPERADMIN} from './helpers/profiles.js';
import '@/permissions/appointments/appointments.permissions.js';
import '@/permissions/appointments-count/appointments-count.permissions.js';
import appointmentsGet from '@/api/appointments.get.js';
import appointmentsCountGet from '@/api/appointments-count.get.js';

const FIXTURES = [
  ...ACCOUNT_FIXTURES,
  'api/__tests__/fixtures/clients.js',
  'api/__tests__/fixtures/patients.js',
  'api/__tests__/fixtures/appointments.js'
];

const OWN_APPOINTMENT_1 = 'bb2e8400-e29b-41d4-a716-446655440001';
const OWN_APPOINTMENT_2 = 'bb2e8400-e29b-41d4-a716-446655440002';
const FOREIGN_APPOINTMENT = 'bb2e8400-e29b-41d4-a716-446655440003';
const FUTURE_APPOINTMENT = 'bb2e8400-e29b-41d4-a716-446655440005';

describe('GET /api/appointments y /api/appointments-count', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('el dueño lista las citas vigentes de su organización', async () => {
    const {response, errors} = await appointmentsGet(buildAuthedEvent({profile: OWNER}));

    expect(errors).toBeNull();
    expect(response.map((appointment) => appointment.id)).toEqual([OWN_APPOINTMENT_1, OWN_APPOINTMENT_2, FUTURE_APPOINTMENT]);
    expect(response[0].organization).toBeUndefined();
    expect(response[0].patient.name).toBe('Firulais');
    expect(response[0].vet.firstName).toBe('Marta');
  });

  it('el empleado lista las de su organización y el dueño de otra organización las suyas', async () => {
    const employeeList = await appointmentsGet(buildAuthedEvent({profile: EMPLOYEE}));
    const otherOwnerList = await appointmentsGet(buildAuthedEvent({profile: OTHER_OWNER}));

    expect(employeeList.response).toHaveLength(3);
    expect(otherOwnerList.response.map((appointment) => appointment.id)).toEqual([FOREIGN_APPOINTMENT]);
  });

  it('filtra por fecha de agenda', async () => {
    const {response} = await appointmentsGet(buildAuthedEvent({url: '/?date=2026-09-22', profile: OWNER}));

    expect(response.map((appointment) => appointment.id)).toEqual([OWN_APPOINTMENT_1, OWN_APPOINTMENT_2]);
  });

  it('filtra por estado', async () => {
    const {response} = await appointmentsGet(buildAuthedEvent({url: '/?status=pending', profile: OWNER}));

    expect(response.map((appointment) => appointment.id)).toEqual([OWN_APPOINTMENT_2]);
  });

  it('filtra por médico', async () => {
    const {response} = await appointmentsGet(buildAuthedEvent({url: '/?vet=772e8400-e29b-41d4-a716-446655440003', profile: OWNER}));

    expect(response.map((appointment) => appointment.id)).toEqual([OWN_APPOINTMENT_1, OWN_APPOINTMENT_2, FUTURE_APPOINTMENT]);
  });

  it('busca por motivo', async () => {
    const {response} = await appointmentsGet(buildAuthedEvent({url: '/?search=anual', profile: OWNER}));

    expect(response.map((appointment) => appointment.id)).toEqual([OWN_APPOINTMENT_1]);
  });

  it('el superadmin no tiene el módulo: 400', async () => {
    const event = buildAuthedEvent({profile: SUPERADMIN});

    await appointmentsGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('una clave no declarada en la query responde 400', async () => {
    const event = buildAuthedEvent({url: '/?organization=552e8400-e29b-41d4-a716-446655440002', profile: OWNER});

    await appointmentsGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('un id malformado responde 400 con el campo', async () => {
    const event = buildAuthedEvent({url: '/?id=no-es-uuid', profile: OWNER});

    await appointmentsGet(event);

    expect(event.node.res.statusCode).toBe(400);
    expect(responseBody(event).fields).toEqual(['id']);
  });

  it('cuenta las citas vigentes de la organización, con filtros', async () => {
    const all = await appointmentsCountGet(buildAuthedEvent({profile: OWNER}));
    const byDate = await appointmentsCountGet(buildAuthedEvent({url: '/?date=2026-09-22', profile: OWNER}));
    const byStatus = await appointmentsCountGet(buildAuthedEvent({url: '/?status=pending', profile: EMPLOYEE}));

    expect(all.response).toEqual({value: 3});
    expect(byDate.response).toEqual({value: 2});
    expect(byStatus.response).toEqual({value: 1});
  });
});
