import {beforeEach, describe, expect, it} from 'vitest';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {clientsTable, expensesTable, invoicesItemTable} from '@vetisuite/database/schemas/schemas.js';
import {resetAndLoad} from '@/tests/fixtures.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OTHER_OWNER, OWNER, SUPERADMIN} from './helpers/profiles.js';
import '@/permissions/finance/finance.permissions.js';
import financeGet from '@/api/finance.get.js';

const NORTH = '552e8400-e29b-41d4-a716-446655440001';
const SOUTH = '552e8400-e29b-41d4-a716-446655440002';
const PATIENT_1 = 'aa2e8400-e29b-41d4-a716-446655440001';
const PATIENT_2 = 'aa2e8400-e29b-41d4-a716-446655440002';
const PATIENT_SOUTH = 'aa2e8400-e29b-41d4-a716-446655440003';
const CLIENT_1 = '992e8400-e29b-41d4-a716-446655440001';

const INV_1 = 'aa1e8400-e29b-41d4-a716-446655440001';
const INV_2 = 'aa1e8400-e29b-41d4-a716-446655440002';
const INV_3 = 'aa1e8400-e29b-41d4-a716-446655440003';
const INV_4 = 'aa1e8400-e29b-41d4-a716-446655440004';
const INV_5 = 'aa1e8400-e29b-41d4-a716-446655440005';

const FIXTURES = [
  ...ACCOUNT_FIXTURES,
  'api/__tests__/fixtures/clients.js',
  'api/__tests__/fixtures/patients.js',
  'api/__tests__/fixtures/finance.js'
];

describe('GET /api/finance', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);

    await db.update(clientsTable)
      .set({debt: 57.5})
      .where(eq(clientsTable.id, CLIENT_1));

    await db.insert(invoicesItemTable).values([
      {
        id: 'bb1e8400-e29b-41d4-a716-446655440001',
        organization: NORTH,
        invoice: INV_1,
        description: 'Consulta general',
        amount: 700,
        area: 'clinic',
        patient: PATIENT_1,
        createdAt: new Date('2026-09-10T10:05:00.000Z')
      },
      {
        id: 'bb1e8400-e29b-41d4-a716-446655440002',
        organization: NORTH,
        invoice: INV_1,
        description: 'Corte y baño',
        amount: 300,
        area: 'grooming',
        patient: PATIENT_1,
        createdAt: new Date('2026-09-10T10:10:00.000Z')
      },
      {
        id: 'bb1e8400-e29b-41d4-a716-446655440003',
        organization: NORTH,
        invoice: INV_2,
        description: 'Cirugía menor',
        amount: 1500,
        area: 'clinic',
        patient: PATIENT_2,
        createdAt: new Date('2026-09-12T11:05:00.000Z')
      },
      {
        id: 'bb1e8400-e29b-41d4-a716-446655440004',
        organization: NORTH,
        invoice: INV_2,
        description: 'Hemograma completo',
        amount: 500,
        area: 'laboratory',
        patient: PATIENT_2,
        createdAt: new Date('2026-09-12T11:10:00.000Z')
      },
      {
        id: 'bb1e8400-e29b-41d4-a716-446655440005',
        organization: NORTH,
        invoice: INV_3,
        description: 'Baño medicado',
        amount: 1200,
        area: 'grooming',
        patient: PATIENT_1,
        createdAt: new Date('2026-09-14T12:05:00.000Z')
      },
      {
        id: 'bb1e8400-e29b-41d4-a716-446655440006',
        organization: NORTH,
        invoice: INV_4,
        description: 'Consulta anterior',
        amount: 2000,
        area: 'clinic',
        patient: PATIENT_1,
        createdAt: new Date('2026-08-10T10:05:00.000Z')
      },
      {
        id: 'bb1e8400-e29b-41d4-a716-446655440007',
        organization: NORTH,
        invoice: INV_4,
        description: 'Peluquería anterior',
        amount: 1000,
        area: 'grooming',
        patient: PATIENT_1,
        createdAt: new Date('2026-08-10T10:10:00.000Z')
      },
      {
        id: 'bb1e8400-e29b-41d4-a716-446655440008',
        organization: SOUTH,
        invoice: INV_5,
        description: 'Consulta externa sur',
        amount: 500,
        area: 'clinic',
        patient: PATIENT_SOUTH,
        createdAt: new Date('2026-09-10T15:05:00.000Z')
      }
    ]);

    await db.insert(expensesTable).values([
      {
        id: 'cc1e8400-e29b-41d4-a716-446655440001',
        organization: NORTH,
        category: 'supplies',
        description: 'Insumos médicos',
        amount: 1500,
        createdAt: new Date('2026-09-05T08:00:00.000Z')
      },
      {
        id: 'cc1e8400-e29b-41d4-a716-446655440002',
        organization: NORTH,
        category: 'rent',
        description: 'Alquiler local',
        amount: 1000,
        createdAt: new Date('2026-08-05T08:00:00.000Z')
      },
      {
        id: 'cc1e8400-e29b-41d4-a716-446655440003',
        organization: SOUTH,
        category: 'supplies',
        description: 'Insumos sur',
        amount: 300,
        createdAt: new Date('2026-09-05T08:00:00.000Z')
      }
    ]);
  });

  it('el dueño obtiene el reporte financiero de su organización', async () => {
    const {response, errors} = await financeGet(buildAuthedEvent({
      url: '/?from=2026-09-01&to=2026-09-30&period=custom&comparison=previous-month',
      profile: OWNER
    }));

    expect(errors).toBeNull();
    expect(response.periodLabel).toBe('personalizado');

    expect(response.kpis.income).toEqual({value: 4830, count: 3});
    expect(response.kpis.profit).toEqual({value: 3330, margin: 69});
    expect(response.kpis.vat).toEqual({value: 630, rate: 15});
    expect(response.kpis.receivable).toEqual({value: 57.5, count: 1});

    expect(response.areas).toHaveLength(3);
    expect(response.areas[0]).toMatchObject({
      name: 'Consulta',
      invoiceCount: 2,
      amount: 2200,
      share: 52,
      barPercent: 100,
      delta: 10,
      trend: 'up'
    });
    expect(response.areas[1]).toMatchObject({
      name: 'Estética',
      invoiceCount: 2,
      amount: 1500,
      share: 36,
      barPercent: 68,
      delta: 50,
      trend: 'up'
    });
    expect(response.areas[2]).toMatchObject({
      name: 'Laboratorio',
      invoiceCount: 1,
      amount: 500,
      share: 12,
      barPercent: 23,
      delta: 100,
      trend: 'up'
    });

    expect(response.areaTotals).toMatchObject({
      invoiceCount: 3,
      amount: 4200,
      share: 100,
      delta: 40,
      trend: 'up'
    });

    expect(response.collectedTotal).toBe(4830);
    expect(response.paymentShares).toEqual([
      {method: 'cash', percent: 24},
      {method: 'card', percent: 48},
      {method: 'transfer', percent: 29}
    ]);
  });

  it('el empleado obtiene el reporte financiero de su organización', async () => {
    const {response, errors} = await financeGet(buildAuthedEvent({
      url: '/?from=2026-09-01&to=2026-09-30&period=custom',
      profile: EMPLOYEE
    }));

    expect(errors).toBeNull();
    expect(response.kpis.income.value).toBe(4830);
    expect(response.collectedTotal).toBe(4830);
  });

  it('aislamiento por organización: otra organización solo ve sus datos', async () => {
    const otherResponse = await financeGet(buildAuthedEvent({
      url: '/?from=2026-09-01&to=2026-09-30&period=custom&comparison=none',
      profile: OTHER_OWNER
    }));

    expect(otherResponse.errors).toBeNull();
    expect(otherResponse.response.kpis.income).toEqual({value: 575, count: 1});
    expect(otherResponse.response.kpis.profit).toEqual({value: 275, margin: 48});
    expect(otherResponse.response.kpis.vat).toEqual({value: 75, rate: 15});
    expect(otherResponse.response.kpis.receivable).toEqual({value: 0, count: 0});
    expect(otherResponse.response.areas).toHaveLength(1);
    expect(otherResponse.response.areas[0]).toMatchObject({
      name: 'Consulta',
      invoiceCount: 1,
      amount: 500,
      share: 100,
      barPercent: 100,
      delta: 0,
      trend: 'up'
    });
    expect(otherResponse.response.collectedTotal).toBe(575);
    expect(otherResponse.response.paymentShares).toEqual([
      {method: 'cash', percent: 0},
      {method: 'card', percent: 100},
      {method: 'transfer', percent: 0}
    ]);
  });

  it('el superadmin no tiene el módulo: 400', async () => {
    const event = buildAuthedEvent({profile: SUPERADMIN});

    await financeGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('una clave no declarada en la query responde 400', async () => {
    const event = buildAuthedEvent({url: '/?organization=552e8400-e29b-41d4-a716-446655440002', profile: OWNER});

    await financeGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('un formato de fecha inválido responde 400', async () => {
    const event = buildAuthedEvent({url: '/?from=no-es-fecha', profile: OWNER});

    await financeGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('soporta periodos predefinidos y sin comparación', async () => {
    const {response, errors} = await financeGet(buildAuthedEvent({
      url: '/?period=month&comparison=none',
      profile: OWNER
    }));

    expect(errors).toBeNull();
    expect(response.periodLabel).toBe('mes en curso');
    expect(response.areas[0].delta).toBe(0);
  });
});
