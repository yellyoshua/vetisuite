import {beforeEach, describe, expect, it} from 'vitest';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {clientsTable} from '@vetisuite/database/schemas/schemas.js';
import {resetAndLoad} from '@/tests/fixtures.js';
import responseBody from '@/tests/response-body.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OTHER_OWNER, OWNER, SUPERADMIN} from './helpers/profiles.js';
import clientsGet from '@/api/clients.get.js';
import clientsCountGet from '@/api/clients-count.get.js';
import clientsPost from '@/api/clients.post.js';
import clientsPut from '@/api/clients.put.js';
import clientsDelete from '@/api/clients.delete.js';

const FIXTURES = [...ACCOUNT_FIXTURES, 'api/__tests__/fixtures/clients.js'];

const OWN_CLIENT = '992e8400-e29b-41d4-a716-446655440001';
const SECOND_CLIENT = '992e8400-e29b-41d4-a716-446655440002';
const FOREIGN_CLIENT = '992e8400-e29b-41d4-a716-446655440003';
const ARCHIVED_CLIENT = '992e8400-e29b-41d4-a716-446655440004';

async function findClient (id) {
  const [client] = await db.select().from(clientsTable).where(eq(clientsTable.id, id));

  return client;
}

describe('GET /api/clients y /api/clients-count', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('el dueño lista solo los clientes vigentes de su organización', async () => {
    const {response, errors} = await clientsGet(buildAuthedEvent({profile: OWNER}));

    expect(errors).toBeNull();
    expect(response.map((client) => client.id)).toEqual([OWN_CLIENT, SECOND_CLIENT]);
    expect(response[0].organization).toBeUndefined();
  });

  it('el empleado lista los de su organización y el dueño de otra organización los suyos', async () => {
    const employeeList = await clientsGet(buildAuthedEvent({profile: EMPLOYEE}));
    const otherOwnerList = await clientsGet(buildAuthedEvent({profile: OTHER_OWNER}));

    expect(employeeList.response).toHaveLength(2);
    expect(otherOwnerList.response.map((client) => client.id)).toEqual([FOREIGN_CLIENT]);
  });

  it('busca por nombre, teléfono o correo', async () => {
    const {response} = await clientsGet(buildAuthedEvent({url: '/?search=carla', profile: OWNER}));

    expect(response.map((client) => client.id)).toEqual([OWN_CLIENT]);
  });

  it('el superadmin no tiene el módulo: 400', async () => {
    const event = buildAuthedEvent({profile: SUPERADMIN});

    await clientsGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('una clave no declarada en la query responde 400', async () => {
    const event = buildAuthedEvent({url: '/?organization=552e8400-e29b-41d4-a716-446655440002', profile: OWNER});

    await clientsGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('un id malformado responde 400 con el campo', async () => {
    const event = buildAuthedEvent({url: '/?id=no-es-uuid', profile: OWNER});

    await clientsGet(event);

    expect(event.node.res.statusCode).toBe(400);
    expect(responseBody(event).fields).toEqual(['id']);
  });

  it('cuenta los clientes vigentes de la organización, con búsqueda', async () => {
    const all = await clientsCountGet(buildAuthedEvent({profile: OWNER}));
    const searched = await clientsCountGet(buildAuthedEvent({url: '/?search=5551002', profile: EMPLOYEE}));

    expect(all.response).toEqual({value: 2});
    expect(searched.response).toEqual({value: 1});
  });
});

describe('POST, PUT y DELETE /api/clients', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('el empleado crea un cliente en la organización de su sesión', async () => {
    const {response} = await clientsPost(buildAuthedEvent({method: 'POST', body: {name: 'Nueva Clienta', phone: '5559999', email: ''}, profile: EMPLOYEE}));

    expect(response.client.organization).toBe(EMPLOYEE.organization);
    expect(response.client.email).toBeNull();
  });

  it('la organización no se acepta desde el body', async () => {
    const event = buildAuthedEvent({method: 'POST', body: {name: 'Intrusa', phone: '5559999', organization: OTHER_OWNER.organization}, profile: OWNER});

    await clientsPost(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('el dueño edita un cliente de su organización', async () => {
    const {response} = await clientsPut(buildAuthedEvent({method: 'PUT', body: {id: OWN_CLIENT, name: 'Carla Renombrada'}, profile: OWNER}));

    expect(response.client.name).toBe('Carla Renombrada');
    expect(response.client.phone).toBe('5551001');
  });

  it('editar un cliente de otra organización responde 404 y no toca la fila', async () => {
    const event = buildAuthedEvent({method: 'PUT', body: {id: FOREIGN_CLIENT, name: 'Robado'}, profile: EMPLOYEE});

    await clientsPut(event);

    expect(event.node.res.statusCode).toBe(404);
    expect(responseBody(event).errors).toEqual(['Cliente no encontrado']);
    expect((await findClient(FOREIGN_CLIENT)).name).toBe('Ajena Sur');
  });

  it('un cliente archivado no se edita', async () => {
    const event = buildAuthedEvent({method: 'PUT', body: {id: ARCHIVED_CLIENT, name: 'Revivido'}, profile: OWNER});

    await clientsPut(event);

    expect(event.node.res.statusCode).toBe(404);
  });

  it('el dueño archiva un cliente y deja de listarse', async () => {
    const {response} = await clientsDelete(buildAuthedEvent({method: 'DELETE', url: `/?id=${SECOND_CLIENT}`, profile: OWNER}));
    const list = await clientsGet(buildAuthedEvent({profile: OWNER}));

    expect(response.client.id).toBe(SECOND_CLIENT);
    expect((await findClient(SECOND_CLIENT)).archivedAt).toBeInstanceOf(Date);
    expect(list.response.map((client) => client.id)).toEqual([OWN_CLIENT]);
  });

  it('el empleado no archiva y nadie archiva un cliente ajeno', async () => {
    const byEmployee = buildAuthedEvent({method: 'DELETE', url: `/?id=${OWN_CLIENT}`, profile: EMPLOYEE});
    const foreign = buildAuthedEvent({method: 'DELETE', url: `/?id=${FOREIGN_CLIENT}`, profile: OWNER});

    await clientsDelete(byEmployee);
    await clientsDelete(foreign);

    expect(byEmployee.node.res.statusCode).toBe(400);
    expect(foreign.node.res.statusCode).toBe(404);
    expect((await findClient(OWN_CLIENT)).archivedAt).toBeNull();
  });
});
