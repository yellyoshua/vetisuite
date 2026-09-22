import baseRoute from '@/core/base-route.js';
import {listParams} from '@/utils/request-params.js';
import ownersRepository from '@/modules/owners/owners.repository.js';

export default baseRoute(async (params) => {
  return ownersRepository.find(pickFilters(params), {
    join: {user: 'id email role emailConfirmed lastSignInAt disabled createdAt', organization: 'id name slug'},
    search: params.search,
    searchFields: ['firstName', 'lastName'],
    page: params.page,
    limit: params.limit,
    orderBy: {createdAt: params.order}
  });
}, listParams, {module: 'owners'});

function pickFilters (params) {
  return params.id ? {id: params.id} : {};
}
