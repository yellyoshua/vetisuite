import baseRoute from '@/core/base-route.js';
import {listWhatsappMessagesSchema} from '@/modules/whatsapp-messages/whatsapp-messages.schema.js';
import whatsappMessagesRepository from '@/modules/whatsapp-messages/whatsapp-messages.repository.js';

export default baseRoute(async (params, context) => {
  return whatsappMessagesRepository.find({organization: context.profile.organization, ...pickFilters(params)}, {
    select: {id: true, direction: true, status: true, phone: true, template: true, errorCode: true, errorMessage: true, createdAt: true},
    join: {client: 'name'},
    page: params.page,
    limit: params.limit,
    orderBy: {createdAt: params.order}
  });
}, listWhatsappMessagesSchema, {module: 'whatsapp-messages'});

function pickFilters (params) {
  return {
    ...(params.id ? {id: params.id} : {}),
    ...(params.direction ? {direction: params.direction} : {}),
    ...(params.status ? {status: params.status} : {})
  };
}
