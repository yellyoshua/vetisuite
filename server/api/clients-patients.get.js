import baseRoute from '@/core/base-route.js';
import {listPatientsSchema} from '@/modules/clients-patients/clients-patients.schema.js';
import clientsPatientsRepository from '@/modules/clients-patients/clients-patients.repository.js';

export default baseRoute(async (params, context) => {
  return clientsPatientsRepository.find({organization: context.profile.organization, archivedAt: null, ...pickFilters(params)}, {
    select: {id: true, name: true, species: true, breed: true, sex: true, birthDate: true, createdAt: true, updatedAt: true},
    join: {client: 'id name phone'},
    search: params.search,
    searchFields: ['name', 'breed'],
    page: params.page,
    limit: params.limit,
    orderBy: {createdAt: params.order}
  });
}, listPatientsSchema, {module: 'clients-patients'});

function pickFilters (params) {
  return {
    ...(params.id ? {id: params.id} : {}),
    ...(params.client ? {client: params.client} : {})
  };
}
