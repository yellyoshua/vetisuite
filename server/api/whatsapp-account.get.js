import baseRoute from '@/core/base-route.js';
import {getWhatsappAccountSchema} from '@/modules/whatsapp-account/whatsapp-account.schema.js';
import whatsappAccountRepository from '@/modules/whatsapp-account/whatsapp-account.repository.js';

export default baseRoute(async (_params, context) => {
  return whatsappAccountRepository.find({organization: context.profile.organization}, {
    select: {id: true, displayPhoneNumber: true, verifiedName: true, status: true, createdAt: true},
    limit: 1
  });
}, getWhatsappAccountSchema, {module: 'whatsapp-account'});
