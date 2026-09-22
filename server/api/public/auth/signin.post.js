import zod from 'zod';
import baseRoute from '@/core/base-route.js';
import authCore from '@/core/auth-core.js';
import {authorizeUrl, issueCode} from '@/modules/oauth/oauth.service.js';

const signinSchema = zod.object({
  email: zod.email('Correo electrónico no válido').transform((email) => email.toLowerCase()),
  password: zod.string('Contraseña no válida'),
  redirect_uri: zod.string().optional(),
  state: zod.string().max(255).optional()
});

export default baseRoute(async (data, {event}) => {
  const user = await authCore.user.verifyCredentials(data.email, data.password);

  if (!user) {
    throw {error: 'Correo o contraseña incorrectos', status: 401};
  }

  const code = await issueCode(user.id, {redirectUri: data.redirect_uri, context: event});

  return {authorize_url: authorizeUrl(code, {state: data.state})};
}, signinSchema);
