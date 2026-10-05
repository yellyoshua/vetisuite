import baseRoute from '@/core/base-route.js';
import {syncWhatsappTemplatesSchema} from '@/modules/whatsapp-templates/whatsapp-templates.schema.js';
import {syncWhatsappTemplates} from '@/modules/whatsapp-templates/whatsapp-templates.service.js';

export default baseRoute(async (_data, context) => {
  return {templates: await syncWhatsappTemplates(context.profile.organization)};
}, syncWhatsappTemplatesSchema, {module: 'whatsapp-templates'});
