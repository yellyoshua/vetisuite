import zod from 'zod';
import baseRoute from '@/core/base-route.js';
import authCore from '@/core/auth-core.js';
import {clearSessionCookie} from '@/utils/session-cookie.js';

export default baseRoute(async (_data, {event, session}) => {
  await authCore.session.destroy(session.id);

  clearSessionCookie(event);

  return {success: true};
}, zod.object({}).default({}), {module: 'auth-logout'});
