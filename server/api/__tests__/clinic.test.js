import {beforeEach, describe, expect, it} from 'vitest';
import {db} from '@vetisuite/database/db.js';
import {
  consultationsPrescriptionTable,
  visitsServiceLabTable,
  visitsServiceTable
} from '@vetisuite/database/schemas/schemas.js';
import {resetAndLoad} from '@/tests/fixtures.js';
import responseBody from '@/tests/response-body.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OTHER_OWNER, OWNER, SUPERADMIN} from './helpers/profiles.js';
import '@/permissions/clinic/clinic.permissions.js';
import '@/permissions/clinic-count/clinic-count.permissions.js';
import clinicGet from '@/api/clinic.get.js';
import clinicCountGet from '@/api/clinic-count.get.js';

const FIXTURES = [
  ...ACCOUNT_FIXTURES,
  'api/__tests__/fixtures/clients.js',
  'api/__tests__/fixtures/patients.js',
  'api/__tests__/fixtures/clinic.js',
  'api/__tests__/fixtures/visits.js',
  'api/__tests__/fixtures/visits-service.js'
];

describe('GET /api/clinic y /api/clinic-count', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);

    await db.insert(consultationsPrescriptionTable).values([
      {
        id: 'dd2e8400-e29b-41d4-a716-446655440001',
        organization: '552e8400-e29b-41d4-a716-446655440001',
        consultation: 'ee2e8400-e29b-41d4-a716-446655440001',
        medication: 'Amoxicilina 250mg',
        dosage: '1 pastilla cada 12h',
        createdAt: new Date('2026-09-22T08:30:00Z')
      }
    ]);

    await db.insert(visitsServiceTable).values([
      {
        id: 'cc2e8400-e29b-41d4-a716-446655440004',
        organization: '552e8400-e29b-41d4-a716-446655440001',
        visit: 'bb2e8400-e29b-41d4-a716-446655440001',
        patient: 'aa2e8400-e29b-41d4-a716-446655440001',
        type: 'laboratory',
        label: 'Hemograma completo',
        price: 35,
        status: 'requested',
        started: false,
        createdAt: new Date('2026-09-22T09:30:00Z')
      }
    ]);

    await db.insert(visitsServiceLabTable).values([
      {
        id: 'ff2e8400-e29b-41d4-a716-446655440001',
        organization: '552e8400-e29b-41d4-a716-446655440002',
        visitService: 'cc2e8400-e29b-41d4-a716-446655440003',
        result: 'Leucocitos normales',
        createdAt: new Date('2026-09-22T11:00:00Z')
      }
    ]);
  });

  it('el dueño lista los registros clínicos de su organización', async () => {
    const {response, errors} = await clinicGet(buildAuthedEvent({profile: OWNER}));

    expect(errors).toBeNull();
    expect(response).toHaveLength(4);
    expect(response[0]).toMatchObject({
      patientName: expect.any(String),
      ownerName: expect.any(String),
      kind: expect.stringMatching(/consultation|lab-order|prescription/),
      title: expect.any(String),
      createdAt: expect.any(String),
      status: expect.stringMatching(/in-progress|requested|result/)
    });
  });

  it('el empleado lista los registros clínicos de su organización y el dueño de otra los suyos', async () => {
    const employeeList = await clinicGet(buildAuthedEvent({profile: EMPLOYEE}));
    const otherOwnerList = await clinicGet(buildAuthedEvent({profile: OTHER_OWNER}));

    expect(employeeList.response).toHaveLength(4);
    expect(otherOwnerList.response).toHaveLength(2);
    expect(otherOwnerList.response.every((rec) => rec.patientName === 'Ajeno')).toBe(true);
  });

  it('filtra por kind (consultation, prescription, lab-order)', async () => {
    const consultations = await clinicGet(buildAuthedEvent({url: '/?kind=consultation', profile: OWNER}));
    const prescriptions = await clinicGet(buildAuthedEvent({url: '/?kind=prescription', profile: OWNER}));
    const labOrders = await clinicGet(buildAuthedEvent({url: '/?kind=lab-order', profile: OWNER}));

    expect(consultations.response).toHaveLength(2);
    expect(consultations.response.every((rec) => rec.kind === 'consultation')).toBe(true);

    expect(prescriptions.response).toHaveLength(1);
    expect(prescriptions.response[0].kind).toBe('prescription');

    expect(labOrders.response).toHaveLength(1);
    expect(labOrders.response[0].kind).toBe('lab-order');
  });

  it('filtra por status y preset', async () => {
    const requested = await clinicGet(buildAuthedEvent({url: '/?status=requested', profile: OWNER}));
    const pendingPreset = await clinicGet(buildAuthedEvent({url: '/?preset=pending-result', profile: OWNER}));
    const resolvedPreset = await clinicGet(buildAuthedEvent({url: '/?preset=resolved-today', profile: OWNER}));

    expect(requested.response).toHaveLength(1);
    expect(requested.response[0].status).toBe('requested');

    expect(pendingPreset.response).toHaveLength(1);
    expect(pendingPreset.response[0].status).toBe('requested');

    expect(resolvedPreset.response).toHaveLength(3);
    expect(resolvedPreset.response.every((rec) => rec.status === 'result')).toBe(true);
  });

  it('busca por nombre de paciente o título', async () => {
    const searchMichi = await clinicGet(buildAuthedEvent({url: '/?search=michi', profile: OWNER}));
    const searchAmoxi = await clinicGet(buildAuthedEvent({url: '/?search=amoxicilina', profile: OWNER}));

    expect(searchMichi.response).toHaveLength(1);
    expect(searchMichi.response[0].patientName).toBe('Michi');

    expect(searchAmoxi.response).toHaveLength(1);
    expect(searchAmoxi.response[0].kind).toBe('prescription');
  });

  it('el superadmin no tiene el módulo: 400', async () => {
    const event = buildAuthedEvent({profile: SUPERADMIN});

    await clinicGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('una clave no declarada en la query responde 400', async () => {
    const event = buildAuthedEvent({url: '/?invento=123', profile: OWNER});

    await clinicGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('un id malformado responde 400 con el campo', async () => {
    const event = buildAuthedEvent({url: '/?id=no-es-uuid', profile: OWNER});

    await clinicGet(event);

    expect(event.node.res.statusCode).toBe(400);
    expect(responseBody(event).fields).toEqual(['id']);
  });

  it('cuenta los registros clínicos con clinic-count', async () => {
    const allCount = await clinicCountGet(buildAuthedEvent({profile: OWNER}));
    const consultationCount = await clinicCountGet(buildAuthedEvent({url: '/?kind=consultation', profile: OWNER}));
    const searchCount = await clinicCountGet(buildAuthedEvent({url: '/?search=michi', profile: OWNER}));

    expect(allCount.response).toEqual({value: 4});
    expect(consultationCount.response).toEqual({value: 2});
    expect(searchCount.response).toEqual({value: 1});
  });
});
