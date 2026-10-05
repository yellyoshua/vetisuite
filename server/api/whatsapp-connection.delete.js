import baseRoute from '@/core/base-route.js';
import {disconnectWhatsappAccountSchema} from '@/modules/whatsapp-account/whatsapp-account.schema.js';
import {disconnectWhatsappAccount} from '@/modules/whatsapp-account/whatsapp-account.service.js';

export default baseRoute(async (_params, context) => {
  return disconnectWhatsappAccount(context.profile.organization);
}, disconnectWhatsappAccountSchema, {module: 'whatsapp-connection'});
