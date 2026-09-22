import {randomUUID} from 'node:crypto';
import {defineEventHandler, getRequestHeader, setHeader} from 'h3';
import authCore from '@/core/auth-core.js';
import logger from '@/utils/logger.js';
import {readSessionCookie} from '@/utils/session-cookie.js';

const UUID_SEGMENT = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

export default defineEventHandler((event) => {
  const startedAt = Date.now();

  event.context.requestId = event.node.req.__unenv__?.awsRequestId || randomUUID();

  event.context.ip = requestIp(event);
  event.context.userAgent = getRequestHeader(event, 'user-agent') || 'unknown';
  event.context.token = authCore.session.fromToken(readSessionCookie(event));

  setHeader(event, 'x-request-id', event.context.requestId);

  const {requestId} = event.context;
  const method = event.method;
  const route = normalizeRoute(event.path);

  logger.info('[http] request.started', {event: 'request.started', requestId, method, route});
  event.node.res.once('finish', () => {
    logger.info('[http] request.completed', {
      event: 'request.completed',
      requestId,
      method,
      route,
      status: event.node.res.statusCode,
      durationMs: Date.now() - startedAt
    });
  });
});

function requestIp (event) {
  const forwarded = getRequestHeader(event, 'x-forwarded-for');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return getRequestHeader(event, 'x-real-ip') || 'unknown';
}

function normalizeRoute (path) {
  return path.split('?')[0].replace(UUID_SEGMENT, ':id');
}
