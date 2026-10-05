import baseRoute from '@/core/base-route.js';
import {listWhatsappTemplatesSchema} from '@/modules/whatsapp-templates/whatsapp-templates.schema.js';
import whatsappTemplatesRepository from '@/modules/whatsapp-templates/whatsapp-templates.repository.js';

export default baseRoute(async (params, context) => {
  return whatsappTemplatesRepository.find({organization: context.profile.organization}, {
    select: {name: true, language: true, category: true, status: true, rejectedReason: true, updatedAt: true},
    page: params.page,
    limit: params.limit,
    orderBy: {name: 'asc'}
  });
}, listWhatsappTemplatesSchema, {module: 'whatsapp-templates'});
