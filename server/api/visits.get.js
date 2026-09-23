import baseRoute from '@/core/base-route.js';
import {listVisitsSchema} from '@/modules/visits/visits.schema.js';
import {listVisits} from '@/modules/visits/visits.service.js';

export default baseRoute(async (params, context) => {
  return listVisits(context.profile.organization, {
    ...pickFilters(params),
    search: params.search,
    page: params.page,
    limit: params.limit,
    order: params.order
  });
}, listVisitsSchema, {module: 'visits'});

function pickFilters (params) {
  return {
    ...(params.id ? {id: params.id} : {}),
    ...(params.type ? {type: params.type} : {}),
    ...(params.status ? {status: params.status} : {}),
    ...(params.staff ? {staff: params.staff} : {})
  };
}
