import baseRoute from '@/core/base-route.js';
import {connectWhatsappAccountSchema} from '@/modules/whatsapp-account/whatsapp-account.schema.js';
import {connectWhatsappAccount} from '@/modules/whatsapp-account/whatsapp-account.service.js';

export default baseRoute(async (data, context) => {
  return connectWhatsappAccount(context.profile.organization, data);
}, connectWhatsappAccountSchema, {module: 'whatsapp-connection'});
