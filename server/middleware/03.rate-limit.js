import {createHash} from 'node:crypto';
import {defineEventHandler} from 'h3';
import dynamodb from '@/utils/dynamodb.js';
import {errorResponse} from '@/core/error-response.js';
import logger from '@/utils/logger.js';
import {isLocal} from '@/utils/environment.js';

const UNLIMITED_PREFIXES = ['/api/files/'];

export default defineEventHandler(async (event) => {
  if (event.context.isPublic || isLocal || isUnlimitedPath(event.path)) {
    return;
  }

  const session = event.context.auth?.session || null;

  try {
    if (session) {
      await dynamodb.rateLimits.enforce(session.id);

      return;
    }

    await dynamodb.publicRateLimits.enforce(clientHash(event));
  } catch (error) {
    if (error?.status) {
      return errorResponse(error, {event, tag: '[rate-limit]'});
    }

    logger.error('[rate-limit]', {error, requestId: event.context.requestId});
  }
});

function isUnlimitedPath (path) {
  return UNLIMITED_PREFIXES.some((prefix) => path.startsWith(prefix));
}

function clientHash (event) {
  return createHash('sha256').update(`${event.context.ip}:${event.context.userAgent}`).digest('hex');
}
