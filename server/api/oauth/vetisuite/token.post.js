import zod from 'zod';
import baseRoute from '@/core/base-route.js';
import {claimCode} from '@/modules/oauth/oauth.service.js';
import {setSessionCookie} from '@/utils/session-cookie.js';

const tokenSchema = zod.object({
  grant_type: zod.literal('authorization_code'),
  code: zod.string().min(1),
  redirect_uri: zod.string().optional()
});

export default baseRoute(async (data, {event}) => {
  const {token, ...session} = await claimCode(data.code, {redirectUri: data.redirect_uri, context: event});

  setSessionCookie(event, token);

  return session;
}, tokenSchema);
