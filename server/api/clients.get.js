import baseRoute from '@/core/base-route.js';
import {listClientsSchema} from '@/modules/clients/clients.schema.js';
import clientsRepository from '@/modules/clients/clients.repository.js';

export default baseRoute(async (params, context) => {
  return clientsRepository.find({organization: context.profile.organization, archivedAt: null, ...pickFilters(params)}, {
    select: {id: true, name: true, phone: true, email: true, debt: true, createdAt: true, updatedAt: true},
    search: params.search,
    searchFields: ['name', 'phone', 'email'],
    page: params.page,
    limit: params.limit,
    orderBy: {createdAt: params.order}
  });
}, listClientsSchema, {module: 'clients'});

function pickFilters (params) {
  return params.id ? {id: params.id} : {};
}
