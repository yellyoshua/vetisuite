import {beforeEach, describe, expect, it} from 'vitest';
import {resetAndLoad} from '@/tests/fixtures.js';
import responseBody from '@/tests/response-body.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OTHER_OWNER, OWNER, SUPERADMIN} from './helpers/profiles.js';
import '@/permissions/inventory/inventory.permissions.js';
import '@/permissions/inventory-count/inventory-count.permissions.js';
import inventoryGet from '@/api/inventory.get.js';
import inventoryCountGet from '@/api/inventory-count.get.js';

const FIXTURES = [
  ...ACCOUNT_FIXTURES,
  'api/__tests__/fixtures/products.js'
];

const OWN_PRODUCT_1 = 'ee2e8400-e29b-41d4-a716-446655440001';
const OWN_PRODUCT_2 = 'ee2e8400-e29b-41d4-a716-446655440002';
const FOREIGN_PRODUCT = 'ee2e8400-e29b-41d4-a716-446655440003';

describe('GET /api/inventory y /api/inventory-count', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('el dueño lista solo los productos vigentes de su organización', async () => {
    const {response, errors} = await inventoryGet(buildAuthedEvent({profile: OWNER}));

    expect(errors).toBeNull();
    expect(response.map((product) => product.id)).toEqual([OWN_PRODUCT_1, OWN_PRODUCT_2]);
    expect(response[0].organization).toBeUndefined();
    expect(response[0].name).toBe('Vacuna Antirrábica');
    expect(response[0].category).toBe('vaccines');
    expect(response[0].stock).toBe(10);
    expect(response[0].minStock).toBe(5);
    expect(response[0].price).toBe(12);
    expect(response[0].expiry).toBe('2027-03-12');
  });

  it('el empleado lista los de su organización y el dueño de otra organización los suyos', async () => {
    const employeeList = await inventoryGet(buildAuthedEvent({profile: EMPLOYEE}));
    const otherOwnerList = await inventoryGet(buildAuthedEvent({profile: OTHER_OWNER}));

    expect(employeeList.response).toHaveLength(2);
    expect(otherOwnerList.response.map((product) => product.id)).toEqual([FOREIGN_PRODUCT]);
  });

  it('filtra por categoría', async () => {
    const {response} = await inventoryGet(buildAuthedEvent({url: '/?category=vaccines', profile: OWNER}));

    expect(response.map((product) => product.id)).toEqual([OWN_PRODUCT_1]);
  });

  it('busca por nombre', async () => {
    const {response} = await inventoryGet(buildAuthedEvent({url: '/?search=vacuna', profile: OWNER}));

    expect(response.map((product) => product.id)).toEqual([OWN_PRODUCT_1]);
  });

  it('el superadmin no tiene el módulo: 400', async () => {
    const event = buildAuthedEvent({profile: SUPERADMIN});

    await inventoryGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('consultar un producto de otra organización devuelve lista vacía', async () => {
    const {response} = await inventoryGet(buildAuthedEvent({url: `/?id=${FOREIGN_PRODUCT}`, profile: OWNER}));

    expect(response).toEqual([]);
  });

  it('una clave no declarada en la query responde 400', async () => {
    const event = buildAuthedEvent({url: '/?organization=552e8400-e29b-41d4-a716-446655440002', profile: OWNER});

    await inventoryGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('un id malformado responde 400 con el campo', async () => {
    const event = buildAuthedEvent({url: '/?id=no-es-uuid', profile: OWNER});

    await inventoryGet(event);

    expect(event.node.res.statusCode).toBe(400);
    expect(responseBody(event).fields).toEqual(['id']);
  });

  it('cuenta los productos vigentes de la organización, con filtros', async () => {
    const all = await inventoryCountGet(buildAuthedEvent({profile: OWNER}));
    const byCategory = await inventoryCountGet(buildAuthedEvent({url: '/?category=vaccines', profile: OWNER}));
    const bySearch = await inventoryCountGet(buildAuthedEvent({url: '/?search=amoxicilina', profile: EMPLOYEE}));

    expect(all.response).toEqual({value: 2});
    expect(byCategory.response).toEqual({value: 1});
    expect(bySearch.response).toEqual({value: 1});
  });
});
