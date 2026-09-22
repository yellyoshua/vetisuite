import {beforeEach, describe, expect, it, vi} from 'vitest';
import {getResponseHeader} from 'h3';
import {eq} from '@vetisuite/database/orm.js';
import {db} from '@vetisuite/database/db.js';
import {accountTokensTable, oauthCodesTable, organizationsTable, sessionsTable, usersTable} from '@vetisuite/database/schemas/schemas.js';
import events from '@/utils/events.js';
import {resetAndLoad} from '@/tests/fixtures.js';
import responseBody from '@/tests/response-body.js';
import {TEST_PASSWORD_PLAIN} from '@/tests/constants.js';
import {isPasswordValid} from '@/utils/hashing.js';
import {ACCOUNT_FIXTURES, OWNER} from './helpers/profiles.js';
import buildAuthedEvent from './helpers/build-authed-event.js';
import signin from '@/api/public/auth/signin.post.js';
import signup from '@/api/public/auth/signup.post.js';
import forgotPassword from '@/api/public/auth/forgot-password.post.js';
import recoveryPassword from '@/api/public/auth/recovery-password.post.js';
import emailVerification from '@/api/public/auth/email-verification.post.js';
import authorize from '@/api/oauth/vetisuite/authorize.get.js';
import token from '@/api/oauth/vetisuite/token.post.js';
import logout from '@/api/auth-logout.post.js';

const BROWSER = {ip: '203.0.113.5', userAgent: 'navegador-a'};

function publicEvent ({url = '/', method = 'POST', body, identity = BROWSER}) {
  const event = buildAuthedEvent({url, method, body});

  Object.assign(event.context, {isPublic: true, ...identity, auth: null});

  return event;
}

function codeFrom (authorizeUrl) {
  return new URL(authorizeUrl).searchParams.get('code');
}

async function signinCode () {
  const {response} = await signin(publicEvent({body: {email: 'API.OWNER@test.com', password: TEST_PASSWORD_PLAIN}}));

  return codeFrom(response.authorize_url);
}

describe('signin, authorize y token', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetAndLoad(ACCOUNT_FIXTURES);
  });

  it('signin devuelve la authorize_url del API con un code', async () => {
    const {response} = await signin(publicEvent({body: {email: 'api.owner@test.com', password: TEST_PASSWORD_PLAIN, state: 'abc'}}));
    const url = new URL(response.authorize_url);

    expect(url.origin + url.pathname).toBe('http://localhost:4000/api/oauth/vetisuite/authorize');
    expect(url.searchParams.get('state')).toBe('abc');
  });

  it('credenciales malas responden 401 con un solo mensaje', async () => {
    const wrongPassword = publicEvent({body: {email: 'api.owner@test.com', password: 'mala'}});
    const unknownEmail = publicEvent({body: {email: 'nadie@test.com', password: TEST_PASSWORD_PLAIN}});

    await signin(wrongPassword);
    await signin(unknownEmail);

    expect(wrongPassword.node.res.statusCode).toBe(401);
    expect(responseBody(wrongPassword).errors).toEqual(['Correo o contraseña incorrectos']);
    expect(responseBody(unknownEmail).errors).toEqual(['Correo o contraseña incorrectos']);
  });

  it('un redirect_uri distinto al de la app es 400', async () => {
    const event = publicEvent({body: {email: 'api.owner@test.com', password: TEST_PASSWORD_PLAIN, redirect_uri: 'http://localhost:5173@evil.test/x'}});

    await signin(event);

    expect(event.node.res.statusCode).toBe(400);
    expect(responseBody(event).fields).toEqual(['redirect_uri']);
  });

  it('authorize hace 302 a la app con el code y el state sin consumirlo', async () => {
    const code = await signinCode();
    const event = publicEvent({url: `/?code=${code}&state=xyz`, method: 'GET'});

    await authorize(event);

    const location = new URL(event.node.res.getHeader('location'));
    const [row] = await db.select().from(oauthCodesTable).where(eq(oauthCodesTable.code, code));

    expect(event.node.res.statusCode).toBe(302);
    expect(location.origin + location.pathname).toBe('http://localhost:5173/oauth/vetisuite');
    expect(location.searchParams.get('code')).toBe(code);
    expect(location.searchParams.get('state')).toBe('xyz');
    expect(row).toBeDefined();
  });

  it('authorize desde otro navegador es invalid_grant', async () => {
    const code = await signinCode();
    const event = publicEvent({url: `/?code=${code}`, method: 'GET', identity: {ip: '198.51.100.1', userAgent: 'navegador-b'}});

    await authorize(event);

    expect(event.node.res.statusCode).toBe(400);
    expect(responseBody(event).errors).toEqual(['El código de autorización no es válido o expiró']);
  });

  it('el canje crea la sesión, pone la cookie httpOnly y el code es de un solo uso', async () => {
    const code = await signinCode();
    const first = publicEvent({body: {grant_type: 'authorization_code', code}});
    const replay = publicEvent({body: {grant_type: 'authorization_code', code}});

    const {response} = await token(first);
    await token(replay);

    const cookie = getResponseHeader(first, 'set-cookie');
    const sessions = await db.select().from(sessionsTable).where(eq(sessionsTable.user, OWNER.user.id));
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, OWNER.user.id));

    expect(String(cookie)).toMatch(/^vetisuite_session=.+; Max-Age=172800; Path=\/; HttpOnly; SameSite=Lax$/);
    expect(response.token).toBeUndefined();
    expect(response.expires_in).toBe(172800);
    expect(response.profile.firstName).toBe('Ana');
    expect(sessions).toHaveLength(1);
    expect(sessions[0].userAgent).toBe(BROWSER.userAgent);
    expect(user.lastSignInAt).toBeInstanceOf(Date);
    expect(replay.node.res.statusCode).toBe(400);
  });

  it('el canje desde otro navegador no quema el code', async () => {
    const code = await signinCode();
    const stranger = publicEvent({body: {grant_type: 'authorization_code', code}, identity: {ip: '198.51.100.1', userAgent: 'navegador-b'}});

    await token(stranger);
    const {errors} = await token(publicEvent({body: {grant_type: 'authorization_code', code}}));

    expect(stranger.node.res.statusCode).toBe(400);
    expect(errors).toBeNull();
  });

  it('una cuenta deshabilitada no obtiene sesión', async () => {
    const {response} = await signin(publicEvent({body: {email: 'api.employee.disabled@test.com', password: TEST_PASSWORD_PLAIN}}));
    const event = publicEvent({body: {grant_type: 'authorization_code', code: codeFrom(response.authorize_url)}});

    await token(event);

    expect(event.node.res.statusCode).toBe(403);
    expect(responseBody(event).errors).toEqual(['Cuenta desactivada']);
  });

  it('logout borra la sesión y vence la cookie', async () => {
    const [session] = await db.insert(sessionsTable).values({user: OWNER.user.id, ip: 'x', userAgent: 'y', expiresAt: new Date('2099-01-01')}).returning();
    const event = buildAuthedEvent({method: 'POST', profile: OWNER, session});

    const {response} = await logout(event);
    const rows = await db.select().from(sessionsTable).where(eq(sessionsTable.id, session.id));

    expect(response).toEqual({success: true});
    expect(rows).toEqual([]);
    expect(String(getResponseHeader(event, 'set-cookie'))).toContain('vetisuite_session=; Max-Age=0');
  });
});

describe('signup', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetAndLoad(ACCOUNT_FIXTURES);
  });

  it('crea organización, dueña con permisos del rol y publica account_created', async () => {
    const {response} = await signup(publicEvent({body: {organizationName: 'Clínica Nueva', firstName: 'Rosa', lastName: 'Vega', email: 'Rosa@Nueva.test', password: 'secreta123'}}));
    const [organization] = await db.select().from(organizationsTable).where(eq(organizationsTable.slug, 'clinica-nueva'));
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, 'rosa@nueva.test'));

    expect(codeFrom(response.authorize_url)).toBeTruthy();
    expect(organization.name).toBe('Clínica Nueva');
    expect(user.role).toBe('owner');
    expect(user.organization).toBe(organization.id);
    expect(events.emailAccountManager.publish).toHaveBeenCalledWith({action: 'account_created', userId: user.id, email: 'rosa@nueva.test'}, expect.any(Object));
  });

  it('un correo repetido responde 409 y no deja la organización huérfana', async () => {
    const event = publicEvent({body: {organizationName: 'Clínica Huérfana', firstName: 'Ana', lastName: 'Otra', email: 'api.owner@test.com', password: 'secreta123'}});

    await signup(event);

    const orphans = await db.select().from(organizationsTable).where(eq(organizationsTable.slug, 'clinica-huerfana'));

    expect(event.node.res.statusCode).toBe(409);
    expect(responseBody(event).errors).toEqual(['El correo electrónico ya está registrado']);
    expect(orphans).toEqual([]);
  });

  it('un nombre de clínica ya registrado responde 409', async () => {
    const event = publicEvent({body: {organizationName: 'Clínica Norte', firstName: 'Ana', lastName: 'Otra', email: 'nueva@test.com', password: 'secreta123'}});

    await signup(event);

    expect(event.node.res.statusCode).toBe(409);
    expect(responseBody(event).errors).toEqual(['Ya existe una clínica registrada con ese nombre']);
  });

  it('valida el formulario', async () => {
    const event = publicEvent({body: {organizationName: 'X', email: 'no-es-correo', password: '1'}});

    await signup(event);

    expect(event.node.res.statusCode).toBe(400);
    expect(responseBody(event).fields.sort()).toEqual(['email', 'firstName', 'lastName', 'organizationName', 'password']);
  });
});

describe('recuperación y verificación', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await resetAndLoad(ACCOUNT_FIXTURES);
  });

  it('forgot-password responde igual exista o no y solo publica para roles recuperables', async () => {
    const owner = await forgotPassword(publicEvent({body: {email: 'api.owner@test.com'}}));
    const superadmin = await forgotPassword(publicEvent({body: {email: 'api.superadmin@test.com'}}));
    const unknown = await forgotPassword(publicEvent({body: {email: 'nadie@test.com'}}));

    expect(owner.response).toEqual({success: true});
    expect(superadmin.response).toEqual({success: true});
    expect(unknown.response).toEqual({success: true});
    expect(events.emailAccountManager.publish).toHaveBeenCalledTimes(1);
    expect(events.emailAccountManager.publish.mock.calls[0][0].action).toBe('password_reset');
  });

  it('recovery-password cambia la contraseña con un token vigente y lo revoca', async () => {
    await db.insert(accountTokensTable).values({user: OWNER.user.id, type: 'password_reset', token: 'reset-1', expiresAt: new Date('2099-01-01')});

    const {response} = await recoveryPassword(publicEvent({body: {token: 'reset-1', password: 'nueva-clave', confirmPassword: 'nueva-clave'}}));
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, OWNER.user.id));
    const tokens = await db.select().from(accountTokensTable);

    expect(response).toBe('Contraseña actualizada exitosamente');
    expect(await isPasswordValid('nueva-clave', user.password)).toBe(true);
    expect(tokens).toEqual([]);
  });

  it('un token caducado o inexistente responde 400', async () => {
    await db.insert(accountTokensTable).values({user: OWNER.user.id, type: 'password_reset', token: 'viejo', expiresAt: new Date('2020-01-01')});

    const expired = publicEvent({body: {token: 'viejo', password: 'nueva-clave', confirmPassword: 'nueva-clave'}});
    const unknown = publicEvent({body: {token: 'nada', password: 'nueva-clave', confirmPassword: 'nueva-clave'}});
    const mismatch = publicEvent({body: {token: 'nada', password: 'nueva-clave', confirmPassword: 'otra'}});

    await recoveryPassword(expired);
    await recoveryPassword(unknown);
    await recoveryPassword(mismatch);

    expect(responseBody(expired).errors).toEqual(['Token caducado']);
    expect(responseBody(unknown).errors).toEqual(['Verificación fallida. Vuelve a intentarlo.']);
    expect(responseBody(mismatch).fields).toEqual(['confirmPassword']);
  });

  it('email-verification confirma el correo', async () => {
    await db.insert(accountTokensTable).values({user: '662e8400-e29b-41d4-a716-446655440003', type: 'email_confirmation', token: 'confirmar-1', expiresAt: new Date('2099-01-01')});

    const {response} = await emailVerification(publicEvent({body: {token: 'confirmar-1'}}));
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, '662e8400-e29b-41d4-a716-446655440003'));

    expect(response).toBe('Correo electrónico verificado exitosamente');
    expect(user.emailConfirmed).toBe(true);
    expect(user.emailConfirmedAt).toBeInstanceOf(Date);
  });
});
