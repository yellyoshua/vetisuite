import {beforeEach, describe, expect, it} from 'vitest';
import {resetAndLoad} from '@/tests/fixtures.js';
import responseBody from '@/tests/response-body.js';
import buildRequestEvent from '@/tests/request-event.js';
import publicPathMiddleware from '@/middleware/01.public-path.js';
import authContextMiddleware from '@/middleware/02.auth-context.js';
import authGuardMiddleware from '@/middleware/04.auth-guard.js';
import {TEST_USER_AGENT} from '@/api/__tests__/fixtures/sessions.js';

const FIXTURES = [
  'api/__tests__/fixtures/organizations.js',
  'api/__tests__/fixtures/users.js',
  'api/__tests__/fixtures/owners.js',
  'api/__tests__/fixtures/employees.js',
  'api/__tests__/fixtures/permissions.js',
  'api/__tests__/fixtures/sessions.js'
];

const ACTIVE_SESSION = '882e8400-e29b-41d4-a716-446655440001';
const EXPIRED_SESSION = '882e8400-e29b-41d4-a716-446655440002';
const DISABLED_USER_SESSION = '882e8400-e29b-41d4-a716-446655440003';

async function authorize ({url = '/api/profile', session, userAgent = TEST_USER_AGENT}) {
  const event = buildRequestEvent({url});

  Object.assign(event.context, {ip: '203.0.113.5', userAgent, token: session ? {session} : null});
  publicPathMiddleware(event);
  await authContextMiddleware(event);
  await authGuardMiddleware(event);

  return event;
}

describe('middlewares 01.public-path, 02.auth-context y 04.auth-guard', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('marca como públicas solo las rutas de PUBLIC_PREFIXES', async () => {
    const publicEvent = await authorize({url: '/api/public/auth/signin', session: ACTIVE_SESSION});
    const oauthEvent = await authorize({url: '/api/oauth/vetisuite/token'});
    const filesEvent = buildRequestEvent({url: '/api/files/images/x.png'});

    publicPathMiddleware(filesEvent);

    expect(publicEvent.context.isPublic).toBe(true);
    expect(publicEvent.context.auth).toBeUndefined();
    expect(oauthEvent.context.isPublic).toBe(true);
    expect(filesEvent.context.isPublic).toBe(false);
  });

  it('sin sesión responde 401 con el envelope', async () => {
    const event = await authorize({});

    expect(event.node.res.statusCode).toBe(401);
    expect(responseBody(event)).toEqual({response: null, errors: ['No autenticado']});
  });

  it('una sesión vigente arma perfil, organización y permisos', async () => {
    const event = await authorize({session: ACTIVE_SESSION});

    expect(event.handled).toBe(false);
    expect(event.context.auth.session.id).toBe(ACTIVE_SESSION);
    expect(event.context.auth.profile.firstName).toBe('Ana');
    expect(event.context.auth.profile.organization).toBe('552e8400-e29b-41d4-a716-446655440001');
    expect(event.context.auth.profile.user.password).toBeUndefined();
    expect(event.context.auth.permissions).toContain('owner::profile::general');
  });

  it('una sesión vencida o de otro user-agent responde 401', async () => {
    const expired = await authorize({session: EXPIRED_SESSION});
    const otherAgent = await authorize({session: ACTIVE_SESSION, userAgent: 'otro-navegador'});

    expect(expired.node.res.statusCode).toBe(401);
    expect(otherAgent.node.res.statusCode).toBe(401);
  });

  it('una cuenta deshabilitada responde 403', async () => {
    const event = await authorize({session: DISABLED_USER_SESSION});

    expect(event.node.res.statusCode).toBe(403);
    expect(responseBody(event).errors).toEqual(['Cuenta desactivada']);
  });
});
