import {beforeEach, describe, expect, it} from 'vitest';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {appointmentsAvailabilityTable} from '@vetisuite/database/schemas/schemas.js';
import {resetAndLoad} from '@/tests/fixtures.js';
import responseBody from '@/tests/response-body.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OTHER_OWNER, OWNER, SUPERADMIN} from './helpers/profiles.js';
import '@/permissions/appointments-availability/appointments-availability.permissions.js';
import appointmentsAvailabilityGet from '@/api/appointments-availability.get.js';
import appointmentsAvailabilityPut from '@/api/appointments-availability.put.js';

const FIXTURES = [...ACCOUNT_FIXTURES, 'api/__tests__/fixtures/appointments-availability.js'];

const OWN_AVAILABILITY = '882e8400-e29b-41d4-a716-446655440001';
const FOREIGN_AVAILABILITY = '882e8400-e29b-41d4-a716-446655440002';
const ARCHIVED_AVAILABILITY = '882e8400-e29b-41d4-a716-446655440003';

async function findAvailability (id) {
  const [availability] = await db.select()
  .from(appointmentsAvailabilityTable)
  .where(eq(appointmentsAvailabilityTable.id, id));

  return availability;
}

describe('GET /api/appointments-availability', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('el dueño obtiene la disponibilidad vigente de su organización', async () => {
    const {response, errors} = await appointmentsAvailabilityGet(buildAuthedEvent({profile: OWNER}));

    expect(errors).toBeNull();
    expect(response).toHaveLength(1);
    expect(response[0].id).toBe(OWN_AVAILABILITY);
    expect(response[0].timezone).toBe('America/Guayaquil');
    expect(response[0].slotMinutes).toBe(30);
    expect(response[0].organization).toBeUndefined();
  });

  it('el empleado obtiene la de su organización y el dueño de otra organización la suya', async () => {
    const employeeResult = await appointmentsAvailabilityGet(buildAuthedEvent({profile: EMPLOYEE}));
    const otherOwnerResult = await appointmentsAvailabilityGet(buildAuthedEvent({profile: OTHER_OWNER}));

    expect(employeeResult.response).toHaveLength(1);
    expect(employeeResult.response[0].id).toBe(OWN_AVAILABILITY);
    expect(otherOwnerResult.response).toHaveLength(1);
    expect(otherOwnerResult.response[0].id).toBe(FOREIGN_AVAILABILITY);
    expect(otherOwnerResult.response[0].timezone).toBe('America/Bogota');
  });

  it('el superadmin no tiene el módulo: 400', async () => {
    const event = buildAuthedEvent({profile: SUPERADMIN});

    await appointmentsAvailabilityGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('una clave no declarada en la query responde 400', async () => {
    const event = buildAuthedEvent({url: '/?organization=552e8400-e29b-41d4-a716-446655440002', profile: OWNER});

    await appointmentsAvailabilityGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('un id malformado responde 400 con el campo', async () => {
    const event = buildAuthedEvent({url: '/?id=no-es-uuid', profile: OWNER});

    await appointmentsAvailabilityGet(event);

    expect(event.node.res.statusCode).toBe(400);
    expect(responseBody(event).fields).toEqual(['id']);
  });
});

describe('PUT /api/appointments-availability', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('el empleado actualiza la disponibilidad de su organización', async () => {
    const week = [
      {weekday: 'monday', enabled: true, ranges: [{start: '09:00', end: '17:00'}]}
    ];
    const {response, errors} = await appointmentsAvailabilityPut(buildAuthedEvent({
      method: 'PUT',
      body: {
        id: OWN_AVAILABILITY,
        timezone: 'America/Guayaquil',
        week,
        overrides: [],
        slotMinutes: 45,
        bufferBefore: 5,
        bufferAfter: 15,
        minNoticeHours: 4,
        maxAdvanceDays: 45,
        maxPerDay: 25,
        onlineBooking: false,
        autoConfirm: true
      },
      profile: EMPLOYEE
    }));

    expect(errors).toBeNull();
    expect(response.availability.slotMinutes).toBe(45);
    expect(response.availability.autoConfirm).toBe(true);

    const updated = await findAvailability(OWN_AVAILABILITY);
    expect(updated.slotMinutes).toBe(45);
    expect(updated.autoConfirm).toBe(true);
  });

  it('la organización no se acepta desde el body', async () => {
    const event = buildAuthedEvent({
      method: 'PUT',
      body: {
        id: OWN_AVAILABILITY,
        organization: OTHER_OWNER.organization,
        timezone: 'America/Guayaquil',
        week: [],
        overrides: [],
        slotMinutes: 30,
        bufferBefore: 0,
        bufferAfter: 10,
        minNoticeHours: 2,
        maxAdvanceDays: 30,
        maxPerDay: 20,
        onlineBooking: true,
        autoConfirm: false
      },
      profile: OWNER
    });

    await appointmentsAvailabilityPut(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('editar una disponibilidad de otra organización responde 404 y no toca la fila', async () => {
    const event = buildAuthedEvent({
      method: 'PUT',
      body: {
        id: FOREIGN_AVAILABILITY,
        timezone: 'America/Bogota',
        week: [],
        overrides: [],
        slotMinutes: 60,
        bufferBefore: 0,
        bufferAfter: 0,
        minNoticeHours: 0,
        maxAdvanceDays: 30,
        maxPerDay: 10,
        onlineBooking: true,
        autoConfirm: false
      },
      profile: EMPLOYEE
    });

    await appointmentsAvailabilityPut(event);

    expect(event.node.res.statusCode).toBe(404);
    expect(responseBody(event).errors).toEqual(['Disponibilidad no encontrada']);

    const foreign = await findAvailability(FOREIGN_AVAILABILITY);
    expect(foreign.slotMinutes).toBe(45);
  });

  it('una disponibilidad archivada no se edita', async () => {
    const event = buildAuthedEvent({
      method: 'PUT',
      body: {
        id: ARCHIVED_AVAILABILITY,
        timezone: 'America/Guayaquil',
        week: [],
        overrides: [],
        slotMinutes: 60,
        bufferBefore: 0,
        bufferAfter: 0,
        minNoticeHours: 0,
        maxAdvanceDays: 30,
        maxPerDay: 10,
        onlineBooking: true,
        autoConfirm: false
      },
      profile: OWNER
    });

    await appointmentsAvailabilityPut(event);

    expect(event.node.res.statusCode).toBe(404);
  });

  it('un campo no declarado en el body responde 400', async () => {
    const event = buildAuthedEvent({
      method: 'PUT',
      body: {
        id: OWN_AVAILABILITY,
        campoInvalido: 'valor',
        timezone: 'America/Guayaquil',
        week: [],
        overrides: [],
        slotMinutes: 30,
        bufferBefore: 0,
        bufferAfter: 10,
        minNoticeHours: 2,
        maxAdvanceDays: 30,
        maxPerDay: 20,
        onlineBooking: true,
        autoConfirm: false
      },
      profile: OWNER
    });

    await appointmentsAvailabilityPut(event);

    expect(event.node.res.statusCode).toBe(400);
  });
});
