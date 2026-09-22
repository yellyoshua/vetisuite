import baseRoute from '@/core/base-route.js';
import {clearSessionCookie} from '@/utils/session-cookie.js';
import {revokeProfileSession} from '@/modules/profile-sessions/profile-sessions.service.js';
import {revokeProfileSessionSchema} from '@/modules/profile-sessions/profile-sessions.schema.js';

export default baseRoute(async ({id}, context) => {
  await revokeProfileSession(id);

  const isCurrent = id === context.session.id;

  if (isCurrent) {
    clearSessionCookie(context.event);
  }

  return {success: true, isCurrent};
}, revokeProfileSessionSchema, {module: 'profile-sessions'});
