import baseRoute from '@/core/base-route.js';
import {listVisitsGroomingSchema} from '@/modules/visits-grooming/visits-grooming.schema.js';
import {listVisitsGrooming} from '@/modules/visits-grooming/visits-grooming.service.js';

export default baseRoute(async (params, context) => {
  return listVisitsGrooming(context.profile.organization, {
    ...pickFilters(params),
    search: params.search,
    page: params.page,
    limit: params.limit,
    order: params.order
  });
}, listVisitsGroomingSchema, {module: 'visits-grooming'});

function pickFilters (params) {
  return {
    ...(params.id ? {id: params.id} : {}),
    ...(params.status ? {status: params.status} : {}),
    ...(params.preset ? {preset: params.preset} : {})
  };
}
