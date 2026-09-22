import zod from 'zod';
import baseRoute from '@/core/base-route.js';
import {authorizeUrl, issueCode} from '@/modules/oauth/oauth.service.js';
import {registerOrganization} from '@/modules/organizations/organizations.service.js';

const signupSchema = zod.object({
  organizationName: zod.string().trim().min(2, 'El nombre de la clínica debe tener al menos 2 caracteres'),
  firstName: zod.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: zod.string().trim().min(2, 'El apellido debe tener al menos 2 caracteres'),
  email: zod.email('El email debe ser válido').transform((email) => email.toLowerCase()),
  password: zod.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  redirect_uri: zod.string().optional(),
  state: zod.string().max(255).optional()
});

export default baseRoute(async (data, {event, requestId}) => {
  const {account} = await registerOrganization({
    name: data.organizationName,
    owner: {
      user: {email: data.email, password: data.password},
      firstName: data.firstName,
      lastName: data.lastName
    }
  }, {requestId});

  const code = await issueCode(account.user.id, {redirectUri: data.redirect_uri, context: event});

  return {authorize_url: authorizeUrl(code, {state: data.state})};
}, signupSchema);
