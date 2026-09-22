import {defineEventHandler} from 'h3';
import authCore from '@/core/auth-core.js';

export default defineEventHandler(async (event) => {
  if (event.context.isPublic) {
    return;
  }

  const token = event.context.token;

  if (!token) {
    return;
  }

  event.context.auth = await authCore.session.claim(token.session, {userAgent: event.context.userAgent});
});
