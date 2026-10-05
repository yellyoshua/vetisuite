import baseRoute from '@/core/base-route.js';
import {sendWhatsappMessageSchema} from '@/modules/whatsapp-messages/whatsapp-messages.schema.js';
import {sendWhatsappMessage} from '@/modules/whatsapp-messages/whatsapp-messages.service.js';

export default baseRoute(async (data, context) => {
  return sendWhatsappMessage(context.profile.organization, data, {requestId: context.requestId});
}, sendWhatsappMessageSchema, {module: 'whatsapp-messages'});
