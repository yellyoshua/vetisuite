import baseRoute from '@/core/base-route.js';
import {listParams} from '@/utils/request-params.js';
import superadminsRepository from '@/modules/superadmins/superadmins.repository.js';

export default baseRoute(async (params) => {
  return superadminsRepository.find(pickFilters(params), {
    join: {user: 'id email role emailConfirmed lastSignInAt disabled createdAt'},
    search: params.search,
    searchFields: ['firstName', 'lastName'],
    page: params.page,
    limit: params.limit,
    orderBy: {createdAt: params.order}
  });
}, listParams, {module: 'superadmins'});

function pickFilters (params) {
  return params.id ? {id: params.id} : {};
}
