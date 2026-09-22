import {createHash} from 'node:crypto';
import {beforeEach, describe, expect, it, vi} from 'vitest';
import {getResponseHeader} from 'h3';
import dynamodb from '@/utils/dynamodb.js';
import environment from '@/utils/environment.js';
import responseBody from '@/tests/response-body.js';
import buildRequestEvent from '@/tests/request-event.js';
import rateLimitMiddleware from '@/middleware/03.rate-limit.js';

vi.mock('@/utils/dynamodb.js', () => ({
  default: {
    rateLimits: {enforce: vi.fn()},
    publicRateLimits: {enforce: vi.fn()}
  }
}));

vi.mock('@/utils/environment.js', () => {
  const values = {isLocal: false, apiDomain: 'http://localhost:4000', appDomain: 'http://localhost:5173', landingDomain: 'http://localhost:4321'};

  return {
    default: values,
    get isLocal () {
      return values.isLocal;
    },
    apiDomain: values.apiDomain,
    appDomain: values.appDomain,
    landingDomain: values.landingDomain
  };
});

function privateEvent ({url = '/api/profile', session = null} = {}) {
  const event = buildRequestEvent({url});

  Object.assign(event.context, {isPublic: false, ip: '203.0.113.5', userAgent: 'agent', auth: session ? {session} : null});

  return event;
}

describe('middleware 03.rate-limit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    environment.isLocal = false;
  });

  it('cuenta por sesión cuando hay sesión', async () => {
    await rateLimitMiddleware(privateEvent({session: {id: 'session-1'}}));

    expect(dynamodb.rateLimits.enforce).toHaveBeenCalledWith('session-1');
    expect(dynamodb.publicRateLimits.enforce).not.toHaveBeenCalled();
  });

  it('cuenta por hash de ip y user-agent cuando no hay sesión', async () => {
    await rateLimitMiddleware(privateEvent());

    const expected = createHash('sha256').update('203.0.113.5:agent').digest('hex');

    expect(dynamodb.publicRateLimits.enforce).toHaveBeenCalledWith(expected);
  });

  it('responde 429 con Retry-After cuando el limitador lo rechaza', async () => {
    dynamodb.rateLimits.enforce.mockRejectedValueOnce({error: 'errors.too_many_requests', status: 429, retryAfter: 42});
    const event = privateEvent({session: {id: 'session-1'}});

    await rateLimitMiddleware(event);

    expect(event.node.res.statusCode).toBe(429);
    expect(getResponseHeader(event, 'Retry-After')).toBe('42');
    expect(responseBody(event).errors).toEqual(['Demasiadas solicitudes']);
  });

  it('falla abierto ante un error de DynamoDB', async () => {
    dynamodb.rateLimits.enforce.mockRejectedValueOnce(new Error('ResourceNotFoundException'));
    const event = privateEvent({session: {id: 'session-1'}});

    await rateLimitMiddleware(event);

    expect(event.handled).toBe(false);
  });

  it('no cuenta lo público, los archivos ni la máquina local', async () => {
    const publicEvent = privateEvent();

    publicEvent.context.isPublic = true;
    await rateLimitMiddleware(publicEvent);
    await rateLimitMiddleware(privateEvent({url: '/api/files/images/x.png', session: {id: 'session-1'}}));
    environment.isLocal = true;
    await rateLimitMiddleware(privateEvent({session: {id: 'session-1'}}));

    expect(dynamodb.rateLimits.enforce).not.toHaveBeenCalled();
    expect(dynamodb.publicRateLimits.enforce).not.toHaveBeenCalled();
  });
});
