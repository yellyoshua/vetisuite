import {beforeEach, describe, expect, it} from 'vitest';
import {getResponseHeader} from 'h3';
import authCore from '@/core/auth-core.js';
import {resetAndLoad} from '@/tests/fixtures.js';
import buildRequestEvent from '@/tests/request-event.js';
import requestIdMiddleware from '@/middleware/00.request-id.js';

const FIXTURES = [
  'api/__tests__/fixtures/organizations.js',
  'api/__tests__/fixtures/users.js'
];

const OWNER_USER = '662e8400-e29b-41d4-a716-446655440001';

describe('middleware 00.request-id', () => {
  beforeEach(async () => {
    await resetAndLoad(FIXTURES);
  });

  it('toma la IP del primer salto de x-forwarded-for', () => {
    const event = buildRequestEvent({url: '/api/profile', headers: {'x-forwarded-for': '198.51.100.7, 10.0.0.1', 'user-agent': 'agent'}});

    requestIdMiddleware(event);

    expect(event.context.ip).toBe('198.51.100.7');
    expect(event.context.userAgent).toBe('agent');
  });

  it('usa x-real-ip y después unknown cuando no hay x-forwarded-for', () => {
    const withRealIp = buildRequestEvent({url: '/api/profile', headers: {'x-real-ip': '198.51.100.8'}});
    const withoutHeaders = buildRequestEvent({url: '/api/profile'});

    requestIdMiddleware(withRealIp);
    requestIdMiddleware(withoutHeaders);

    expect(withRealIp.context.ip).toBe('198.51.100.8');
    expect(withoutHeaders.context.ip).toBe('unknown');
    expect(withoutHeaders.context.userAgent).toBe('unknown');
  });

  it('expone el requestId en la cabecera de respuesta', () => {
    const event = buildRequestEvent({url: '/api/profile'});

    requestIdMiddleware(event);

    expect(getResponseHeader(event, 'x-request-id')).toBe(event.context.requestId);
  });

  it('decodifica la cookie firmada y descarta una manipulada', async () => {
    const {session, token} = await authCore.session.create(OWNER_USER, {ip: '203.0.113.5', userAgent: 'agent'});
    const [payload, signature] = token.split('.');
    const forged = `${Buffer.from(JSON.stringify({session: '882e8400-e29b-41d4-a716-446655440099'})).toString('base64url')}.${signature}`;

    const valid = buildRequestEvent({url: '/api/profile', headers: {cookie: `vetisuite_session=${token}`}});
    const tampered = buildRequestEvent({url: '/api/profile', headers: {cookie: `vetisuite_session=${forged}`}});
    const truncated = buildRequestEvent({url: '/api/profile', headers: {cookie: `vetisuite_session=${payload}`}});

    requestIdMiddleware(valid);
    requestIdMiddleware(tampered);
    requestIdMiddleware(truncated);

    expect(valid.context.token).toEqual({session: session.id});
    expect(tampered.context.token).toBeNull();
    expect(truncated.context.token).toBeNull();
  });
});
