import {beforeEach, describe, expect, it} from 'vitest';
import {resetAndLoad} from '@/tests/fixtures.js';
import responseBody from '@/tests/response-body.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OTHER_OWNER, OWNER, SUPERADMIN} from './helpers/profiles.js';
import '@/permissions/billing/billing.permissions.js';
import '@/permissions/billing-count/billing-count.permissions.js';
import billingGet from '@/api/billing.get.js';
import billingCountGet from '@/api/billing-count.get.js';

const FIXTURES = [
  ...ACCOUNT_FIXTURES,
  'api/__tests__/fixtures/clients.js',
  'api/__tests__/fixtures/patients.js',
  'api/__tests__/fixtures/invoices.js',
  'api/__tests__/fixtures/invoices-item.js'
];

describe('GET /api/billing y /api/billing-count', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('el dueño lista las facturas de su organización', async () => {
    const {response, errors} = await billingGet(buildAuthedEvent({profile: OWNER}));

    expect(errors).toBeNull();
    expect(response).toHaveLength(3);
    expect(response[0]).toMatchObject({
      id: expect.any(String),
      clientName: expect.any(String),
      number: expect.any(Number),
      chargeCount: expect.any(Number),
      total: expect.any(Number),
      createdAt: expect.any(String),
      status: expect.stringMatching(/open|receivable|paid/)
    });
    expect(response[0].organization).toBeUndefined();
  });

  it('el empleado lista las de su organización y el dueño de otra las suyas', async () => {
    const employeeList = await billingGet(buildAuthedEvent({profile: EMPLOYEE}));
    const otherOwnerList = await billingGet(buildAuthedEvent({profile: OTHER_OWNER}));

    expect(employeeList.response).toHaveLength(3);
    expect(otherOwnerList.response).toHaveLength(1);
    expect(otherOwnerList.response[0].number).toBe(2001);
    expect(otherOwnerList.response[0].clientName).toBe('Ajena Sur');
  });

  it('calcula chargeCount correctamente según los items de cada factura', async () => {
    const {response} = await billingGet(buildAuthedEvent({profile: OWNER}));
    const invoice1040 = response.find((inv) => inv.number === 1040);
    const invoice1041 = response.find((inv) => inv.number === 1041);
    const invoice1042 = response.find((inv) => inv.number === 1042);

    expect(invoice1040.chargeCount).toBe(2);
    expect(invoice1041.chargeCount).toBe(0);
    expect(invoice1042.chargeCount).toBe(1);
  });

  it('deriva status, paidAt y dueDate', async () => {
    const {response} = await billingGet(buildAuthedEvent({profile: OWNER}));
    const invoice1040 = response.find((inv) => inv.number === 1040);
    const invoice1041 = response.find((inv) => inv.number === 1041);
    const invoice1042 = response.find((inv) => inv.number === 1042);

    expect(invoice1040.status).toBe('paid');
    expect(invoice1040.paidAt).toBeTruthy();
    expect(invoice1040.dueDate).toBeNull();

    expect(invoice1041.status).toBe('open');
    expect(invoice1041.paidAt).toBeNull();
    expect(invoice1041.dueDate).toBeNull();

    expect(invoice1042.status).toBe('receivable');
    expect(invoice1042.paidAt).toBeNull();
    expect(invoice1042.dueDate).toBeTruthy();
  });

  it('filtra por status (open, receivable, paid)', async () => {
    const paidOnly = await billingGet(buildAuthedEvent({url: '/?status=paid', profile: OWNER}));
    const openOnly = await billingGet(buildAuthedEvent({url: '/?status=open', profile: OWNER}));
    const receivableOnly = await billingGet(buildAuthedEvent({url: '/?status=receivable', profile: OWNER}));

    expect(paidOnly.response).toHaveLength(1);
    expect(paidOnly.response[0].number).toBe(1040);

    expect(openOnly.response).toHaveLength(1);
    expect(openOnly.response[0].number).toBe(1041);

    expect(receivableOnly.response).toHaveLength(1);
    expect(receivableOnly.response[0].number).toBe(1042);
  });

  it('filtra por preset (open-account, overdue)', async () => {
    const openAccount = await billingGet(buildAuthedEvent({url: '/?preset=open-account', profile: OWNER}));
    const overdue = await billingGet(buildAuthedEvent({url: '/?preset=overdue', profile: OWNER}));

    expect(openAccount.response).toHaveLength(1);
    expect(openAccount.response[0].number).toBe(1041);

    expect(overdue.response).toHaveLength(1);
    expect(overdue.response[0].number).toBe(1042);
  });

  it('busca por cliente o número de factura', async () => {
    const searchClient = await billingGet(buildAuthedEvent({url: '/?search=carla', profile: OWNER}));
    const searchNumber = await billingGet(buildAuthedEvent({url: '/?search=1041', profile: OWNER}));

    expect(searchClient.response).toHaveLength(2);
    expect(searchClient.response.every((inv) => inv.clientName === 'Carla Méndez')).toBe(true);

    expect(searchNumber.response).toHaveLength(1);
    expect(searchNumber.response[0].number).toBe(1041);
  });

  it('el superadmin no tiene el módulo: 400', async () => {
    const event = buildAuthedEvent({profile: SUPERADMIN});

    await billingGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('una clave no declarada en la query responde 400', async () => {
    const event = buildAuthedEvent({url: '/?invento=123', profile: OWNER});

    await billingGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('un id malformado responde 400 con el campo', async () => {
    const event = buildAuthedEvent({url: '/?id=no-es-uuid', profile: OWNER});

    await billingGet(event);

    expect(event.node.res.statusCode).toBe(400);
    expect(responseBody(event).fields).toEqual(['id']);
  });

  it('cuenta las facturas con billing-count y filtros', async () => {
    const allCount = await billingCountGet(buildAuthedEvent({profile: OWNER}));
    const paidCount = await billingCountGet(buildAuthedEvent({url: '/?status=paid', profile: OWNER}));
    const searchCount = await billingCountGet(buildAuthedEvent({url: '/?search=carla', profile: OWNER}));

    expect(allCount.response).toEqual({value: 3});
    expect(paidCount.response).toEqual({value: 1});
    expect(searchCount.response).toEqual({value: 2});
  });
});
