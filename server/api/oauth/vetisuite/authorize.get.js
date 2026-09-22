import {sendRedirect} from 'h3';
import zod from 'zod';
import baseRoute from '@/core/base-route.js';
import {peekCode} from '@/modules/oauth/oauth.service.js';

const authorizeSchema = zod.object({
  code: zod.string().min(1),
  state: zod.string().max(255).optional()
});

export default baseRoute(async ({code, state}, {event}) => {
  const authorization = await peekCode(code, {context: event});
  const target = new URL(authorization.redirectUri);

  target.searchParams.set('code', code);

  if (state) {
    target.searchParams.set('state', state);
  }

  return sendRedirect(event, target.toString(), 302);
}, authorizeSchema);
