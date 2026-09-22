import {defineEventHandler} from 'h3';
import {isAccountBlocked} from '@/core/auth-core.js';
import {errorResponse} from '@/core/error-response.js';

export default defineEventHandler((event) => {
  if (event.context.isPublic) {
    return;
  }

  const current = event.context.auth || null;

  if (!current) {
    return errorResponse({error: 'errors.unauthenticated', status: 401}, {event, tag: '[auth-guard]'});
  }

  if (isAccountBlocked(current.profile.user)) {
    return errorResponse({error: 'errors.account_disabled', status: 403}, {event, tag: '[auth-guard]'});
  }
});
