import baseRoute from '@/core/base-route.js';
import {listParams} from '@/utils/request-params.js';
import organizationsRepository from '@/modules/organizations/organizations.repository.js';

export default baseRoute(async (params) => {
  return organizationsRepository.find({archivedAt: null, ...pickFilters(params)}, {
    select: {id: true, name: true, slug: true, createdAt: true},
    search: params.search,
    searchFields: ['name', 'slug'],
    page: params.page,
    limit: params.limit,
    orderBy: {createdAt: params.order}
  });
}, listParams, {module: 'organizations'});

function pickFilters (params) {
  return params.id ? {id: params.id} : {};
}
