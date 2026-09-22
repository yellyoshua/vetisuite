import baseRoute from '@/core/base-route.js';
import events from '@/utils/events.js';
import {emptyBodySchema} from '@/modules/profile/profile.schema.js';

export default baseRoute(async (_data, context) => {
  const {user} = context.profile;

  if (user.emailConfirmed) {
    throw {error: 'El correo electrónico ya fue verificado', status: 400};
  }

  await events.emailAccountManager.publish({action: 'email_verification', userId: user.id, email: user.email}, {requestId: context.requestId});

  return 'Correo de verificación enviado';
}, emptyBodySchema, {module: 'profile-email-verification'});
