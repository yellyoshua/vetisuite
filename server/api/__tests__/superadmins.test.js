import {beforeEach, describe, expect, it, vi} from 'vitest';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {permissionsTable, usersTable} from '@vetisuite/database/schemas/schemas.js';
import {resetAndLoad} from '@/tests/fixtures.js';
import responseBody from '@/tests/response-body.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, OTHER_SUPERADMIN_ID, OWNER, SUPERADMIN} from './helpers/profiles.js';
import superadminsGet from '@/api/superadmins.get.js';
import superadminsPost from '@/api/superadmins.post.js';
import superadminsPut from '@/api/superadmins.put.js';
import superadminsDisable from '@/api/superadmins-disable.put.js';
import permissionsGet from '@/api/superadmins-permissions.get.js';
import permissionsPut from '@/api/superadmins-permissions.put.js';

vi.mock('@/utils/storage.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {...actual, default: {...actual.default, move: vi.fn(async (_source, destination) => destination)}};
});

const OTHER_SUPERADMIN_USER = '662e8400-e29b-41d4-a716-446655440006';

describe('/api/superadmins', () => {
  beforeEach(async () => {
    await resetAndLoad(ACCOUNT_FIXTURES);
  });

  it('el superadmin lista superadmins con el usuario resuelto sin password', async () => {
    const {response} = await superadminsGet(buildAuthedEvent({url: '/?search=tomás', profile: SUPERADMIN}));
    const all = await superadminsGet(buildAuthedEvent({profile: SUPERADMIN}));

    expect(all.response).toHaveLength(2);
    expect(response.map((superadmin) => superadmin.id)).toEqual([OTHER_SUPERADMIN_ID]);
    expect(all.response[0].user.password).toBeUndefined();
    expect(all.response[0].user.email).toMatch(/superadmin/);
  });

  it('un dueño no tiene el módulo', async () => {
    const event = buildAuthedEvent({profile: OWNER});

    await superadminsGet(event);

    expect(event.node.res.statusCode).toBe(400);
  });

  it('crea un superadmin en la organización de la sesión con su foto temporal', async () => {
    const avatar = `temporal/${SUPERADMIN.user.id}/n.foto.png`;
    const {response} = await superadminsPost(buildAuthedEvent({method: 'POST', body: {firstName: 'Nora', lastName: 'Admin', email: 'nora@test.com', password: 'secreta123', avatar}, profile: SUPERADMIN}));
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, 'nora@test.com'));
    const [permissions] = await db.select().from(permissionsTable).where(eq(permissionsTable.user, user.id));

    expect(response.avatar).toBe(`images/${SUPERADMIN.user.id}/n.foto.png`);
    expect(response.organization).toBe(SUPERADMIN.organization);
    expect(user.role).toBe('superadmin');
    expect(permissions.permissions.every((permission) => permission.startsWith('superadmin::'))).toBe(true);
  });

  it('una foto temporal ajena al crear responde 403', async () => {
    const event = buildAuthedEvent({method: 'POST', body: {firstName: 'Nora', lastName: 'Admin', email: 'nora@test.com', password: 'secreta123', avatar: 'temporal/otro/n.foto.png'}, profile: SUPERADMIN});

    await superadminsPost(event);

    expect(event.node.res.statusCode).toBe(403);
  });

  it('edita otro superadmin conservando su foto y rechaza una temporal ajena', async () => {
    const kept = await superadminsPut(buildAuthedEvent({method: 'PUT', body: {id: OTHER_SUPERADMIN_ID, firstName: 'Tomás Editado', avatar: `images/${OTHER_SUPERADMIN_USER}/actual.foto.png`}, profile: SUPERADMIN}));
    const foreign = buildAuthedEvent({method: 'PUT', body: {id: OTHER_SUPERADMIN_ID, avatar: 'temporal/otro/x.foto.png'}, profile: SUPERADMIN});
    const missing = buildAuthedEvent({method: 'PUT', body: {id: '772e8400-e29b-41d4-a716-446655440099', firstName: 'Nadie'}, profile: SUPERADMIN});

    await superadminsPut(foreign);
    await superadminsPut(missing);

    expect(kept.response.firstName).toBe('Tomás Editado');
    expect(foreign.node.res.statusCode).toBe(403);
    expect(missing.node.res.statusCode).toBe(404);
  });

  it('deshabilita a otro superadmin pero no a sí mismo', async () => {
    const other = await superadminsDisable(buildAuthedEvent({method: 'PUT', body: {id: OTHER_SUPERADMIN_ID, disabled: true}, profile: SUPERADMIN}));
    const own = buildAuthedEvent({method: 'PUT', body: {id: SUPERADMIN.id, disabled: true}, profile: SUPERADMIN});

    await superadminsDisable(own);

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, OTHER_SUPERADMIN_USER));

    expect(other.response).toEqual({success: true});
    expect(user.disabled).toBe(true);
    expect(own.node.res.statusCode).toBe(403);
    expect(responseBody(own).errors).toEqual(['No puedes deshabilitar tu propia cuenta']);
  });
});

describe('/api/superadmins-permissions', () => {
  beforeEach(async () => {
    await resetAndLoad(ACCOUNT_FIXTURES);
  });

  it('lee los permisos de otra cuenta', async () => {
    const {response} = await permissionsGet(buildAuthedEvent({url: `/?id=${OTHER_SUPERADMIN_ID}`, profile: SUPERADMIN}));

    expect(response.user).toEqual({id: OTHER_SUPERADMIN_USER, email: 'api.superadmin.two@test.com', role: 'superadmin'});
    expect(response.permissions).toContain('superadmin::owners::general');
  });

  it('recorta los permisos de otra cuenta', async () => {
    const {response} = await permissionsPut(buildAuthedEvent({method: 'PUT', body: {id: OTHER_SUPERADMIN_ID, permissions: ['superadmin::profile::general']}, profile: SUPERADMIN}));
    const [row] = await db.select().from(permissionsTable).where(eq(permissionsTable.user, OTHER_SUPERADMIN_USER));

    expect(response.permissions).toEqual(['superadmin::profile::general']);
    expect(row.permissions).toEqual(['superadmin::profile::general']);
  });

  it('rechaza los propios, los de otro rol, los inexistentes y los duplicados', async () => {
    const own = buildAuthedEvent({method: 'PUT', body: {id: SUPERADMIN.id, permissions: []}, profile: SUPERADMIN});
    const otherRole = buildAuthedEvent({method: 'PUT', body: {id: OTHER_SUPERADMIN_ID, permissions: ['owner::profile::general']}, profile: SUPERADMIN});
    const unknown = buildAuthedEvent({method: 'PUT', body: {id: OTHER_SUPERADMIN_ID, permissions: ['superadmin::no-existe::general']}, profile: SUPERADMIN});
    const duplicated = buildAuthedEvent({method: 'PUT', body: {id: OTHER_SUPERADMIN_ID, permissions: ['superadmin::profile::general', 'superadmin::profile::general']}, profile: SUPERADMIN});

    await Promise.all([own, otherRole, unknown, duplicated].map((event) => permissionsPut(event)));

    expect(own.node.res.statusCode).toBe(403);
    expect(otherRole.node.res.statusCode).toBe(400);
    expect(responseBody(unknown).fields).toEqual(['permissions']);
    expect(responseBody(duplicated).fields).toEqual(['permissions']);
  });

  it('un id inexistente es 404', async () => {
    const event = buildAuthedEvent({url: '/?id=772e8400-e29b-41d4-a716-446655440099', profile: SUPERADMIN});

    await permissionsGet(event);

    expect(event.node.res.statusCode).toBe(404);
  });
});
