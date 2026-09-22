import baseRoute from '@/core/base-route.js';
import {countClientsSchema} from '@/modules/clients/clients.schema.js';
import clientsRepository from '@/modules/clients/clients.repository.js';

export default baseRoute(async (params, context) => {
  const value = await clientsRepository.count({organization: context.profile.organization, archivedAt: null}, {
    search: params.search,
    searchFields: ['name', 'phone', 'email']
  });

  return {value};
}, countClientsSchema, {module: 'clients-count'});
