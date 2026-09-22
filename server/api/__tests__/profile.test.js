import {beforeEach, describe, expect, it, vi} from 'vitest';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {employeesTable, ownersTable, sessionsTable, usersTable} from '@vetisuite/database/schemas/schemas.js';
import events from '@/utils/events.js';
import storage from '@/utils/storage.js';
import {isPasswordValid} from '@/utils/hashing.js';
import {resetAndLoad} from '@/tests/fixtures.js';
import responseBody from '@/tests/response-body.js';
import {TEST_PASSWORD_PLAIN} from '@/tests/constants.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import {ACCOUNT_FIXTURES, EMPLOYEE, OWNER, SUPERADMIN} from './helpers/profiles.js';
import profileGet from '@/api/profile.get.js';
import profilePut from '@/api/profile.put.js';
import profilePassword from '@/api/profile-password.put.js';
import emailVerification from '@/api/profile-email-verification.post.js';
import sessionsGet from '@/api/profile-sessions.get.js';
import sessionsDelete from '@/api/profile-sessions.delete.js';

vi.mock('@/utils/storage.js', async (importOriginal) => {
  const actual = await importOriginal();

  return {...actual, default: {...actual.default, move: vi.fn(async (_source, destination) => destination)}};
});

const FIXTURES = [...ACCOUNT_FIXTURES, 'api/__tests__/fixtures/sessions.js'];

async function findOwner () {
  const [owner] = await db.select().from(ownersTable).where(eq(ownersTable.id, OWNER.id));

  return owner;
}

describe('GET y PUT /api/profile', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetAndLoad(FIXTURES);
  });

  it('cada rol lee su perfil con su proyección', async () => {
    const owner = await profileGet(buildAuthedEvent({profile: OWNER}));
    const employee = await profileGet(buildAuthedEvent({profile: EMPLOYEE}));
    const superadmin = await profileGet(buildAuthedEvent({profile: SUPERADMIN}));

    expect(owner.response.firstName).toBe('Ana');
    expect(owner.response.organization).toEqual({id: OWNER.organization, name: 'Clínica Norte', slug: 'clinica-norte'});
    expect(owner.response.user).toEqual({email: 'api.owner@test.com', emailConfirmed: true});
    expect(employee.response.position).toBe('veterinarian');
    expect(superadmin.response.user.lastSignInAt).toBeNull();
    expect(superadmin.response.organization).toBeUndefined();
  });

  it('el perfil sale de la sesión: un id ajeno en la query no cambia nada', async () => {
    const {response} = await profileGet(buildAuthedEvent({url: '/?id=772e8400-e29b-41d4-a716-446655440002', profile: OWNER}));

    expect(response.firstName).toBe('Ana');
  });

  it('el dueño edita su perfil y la foto temporal se mueve a images/', async () => {
    const avatar = `temporal/${OWNER.user.id}/abc.foto.png`;
    const {response} = await profilePut(buildAuthedEvent({
      method: 'PUT',
      body: {avatar, firstName: 'Ana María', lastName: 'Pérez', email: 'api.owner@test.com', phone: '5550099'},
      profile: OWNER
    }));
    const owner = await findOwner();

    expect(response).toEqual({success: true, avatar: `images/${OWNER.user.id}/abc.foto.png`});
    expect(owner.avatar).toBe(`images/${OWNER.user.id}/abc.foto.png`);
    expect(owner.firstName).toBe('Ana María');
    expect(storage.move).toHaveBeenCalledWith(avatar, `images/${OWNER.user.id}/abc.foto.png`);
  });

  it('una foto temporal de otra cuenta responde 403 y no toca el perfil', async () => {
    const event = buildAuthedEvent({
      method: 'PUT',
      body: {avatar: 'temporal/662e8400-e29b-41d4-a716-446655440002/x.foto.png', firstName: 'Ana', lastName: 'Pérez', email: 'api.owner@test.com'},
      profile: OWNER
    });

    await profilePut(event);

    expect(event.node.res.statusCode).toBe(403);
    expect((await findOwner()).avatar).toBeNull();
  });

  it('cambiar el correo lo marca sin confirmar y publica email_changed', async () => {
    await profilePut(buildAuthedEvent({method: 'PUT', body: {firstName: 'Marta', lastName: 'Díaz', email: 'marta.nueva@test.com'}, profile: EMPLOYEE}));

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, EMPLOYEE.user.id));

    expect(user.email).toBe('marta.nueva@test.com');
    expect(user.emailConfirmed).toBe(false);
    expect(events.emailAccountManager.publish).toHaveBeenCalledWith(expect.objectContaining({action: 'email_changed', newEmail: 'marta.nueva@test.com'}), expect.any(Object));
  });

  it('el empleado no puede editar su puesto: clave no declarada 400', async () => {
    const event = buildAuthedEvent({method: 'PUT', body: {firstName: 'Marta', lastName: 'Díaz', email: 'api.employee@test.com', position: 'groomer'}, profile: EMPLOYEE});

    await profilePut(event);

    const [employee] = await db.select().from(employeesTable).where(eq(employeesTable.id, EMPLOYEE.id));

    expect(event.node.res.statusCode).toBe(400);
    expect(employee.position).toBe('veterinarian');
  });

  it('un correo de otra cuenta responde 409', async () => {
    const event = buildAuthedEvent({method: 'PUT', body: {firstName: 'Sara', lastName: 'Admin', email: 'api.owner@test.com'}, profile: SUPERADMIN});

    await profilePut(event);

    expect(event.node.res.statusCode).toBe(409);
  });
});

describe('contraseña y verificación de correo', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetAndLoad(FIXTURES);
  });

  it('cambia la contraseña con la actual correcta', async () => {
    const {response} = await profilePassword(buildAuthedEvent({method: 'PUT', body: {currentPassword: TEST_PASSWORD_PLAIN, password: 'otra-clave', confirmPassword: 'otra-clave'}, profile: EMPLOYEE}));
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, EMPLOYEE.user.id));

    expect(response).toBe('Contraseña actualizada exitosamente');
    expect(await isPasswordValid('otra-clave', user.password)).toBe(true);
  });

  it('rechaza la actual incorrecta o una nueva igual a la actual', async () => {
    const wrong = buildAuthedEvent({method: 'PUT', body: {currentPassword: 'mala', password: 'otra-clave', confirmPassword: 'otra-clave'}, profile: OWNER});
    const same = buildAuthedEvent({method: 'PUT', body: {currentPassword: TEST_PASSWORD_PLAIN, password: TEST_PASSWORD_PLAIN, confirmPassword: TEST_PASSWORD_PLAIN}, profile: OWNER});

    await profilePassword(wrong);
    await profilePassword(same);

    expect(responseBody(wrong).errors).toEqual(['La contraseña actual es incorrecta']);
    expect(responseBody(same).errors).toEqual(['La nueva contraseña debe ser distinta de la actual']);
  });

  it('reenvía la verificación solo si el correo no está confirmado', async () => {
    const pending = await emailVerification(buildAuthedEvent({method: 'POST', profile: EMPLOYEE}));
    const confirmed = buildAuthedEvent({method: 'POST', profile: OWNER});

    await emailVerification(confirmed);

    expect(pending.response).toBe('Correo de verificación enviado');
    expect(events.emailAccountManager.publish).toHaveBeenCalledWith({action: 'email_verification', userId: EMPLOYEE.user.id, email: EMPLOYEE.user.email}, expect.any(Object));
    expect(confirmed.node.res.statusCode).toBe(400);
  });
});

describe('/api/profile-sessions', () => {
  const CURRENT = {id: '882e8400-e29b-41d4-a716-446655440001'};

  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('lista solo las sesiones vigentes propias, la actual primero', async () => {
    const event = buildAuthedEvent({profile: OWNER, session: CURRENT});
    const {response} = await sessionsGet(event);

    expect(response.map((session) => session.id)).toEqual(['882e8400-e29b-41d4-a716-446655440001', '882e8400-e29b-41d4-a716-446655440004']);
    expect(response[0].isCurrent).toBe(true);
    expect(event.node.res.getHeader('cache-control')).toBe('no-store');
  });

  it('revoca una sesión propia y no una ajena', async () => {
    const own = await sessionsDelete(buildAuthedEvent({method: 'DELETE', url: '/?id=882e8400-e29b-41d4-a716-446655440004', profile: OWNER, session: CURRENT}));
    const foreign = buildAuthedEvent({method: 'DELETE', url: '/?id=882e8400-e29b-41d4-a716-446655440005', profile: OWNER, session: CURRENT});

    await sessionsDelete(foreign);

    const remaining = await db.select().from(sessionsTable).where(eq(sessionsTable.id, '882e8400-e29b-41d4-a716-446655440005'));

    expect(own.response).toEqual({success: true, isCurrent: false});
    expect(foreign.node.res.statusCode).toBe(404);
    expect(remaining).toHaveLength(1);
  });

  it('revocar la sesión actual vence la cookie', async () => {
    const event = buildAuthedEvent({method: 'DELETE', url: `/?id=${CURRENT.id}`, profile: OWNER, session: CURRENT});

    const {response} = await sessionsDelete(event);

    expect(response.isCurrent).toBe(true);
    expect(String(event.node.res.getHeader('set-cookie'))).toContain('vetisuite_session=; Max-Age=0');
  });
});
