import baseRoute from '@/core/base-route.js';
import {listPortalsSchema} from '@/modules/portals/portals.schema.js';
import {listPortals} from '@/modules/portals/portals.service.js';

export default baseRoute(async (params, context) => {
  return listPortals(context.profile.organization, {
    ...pickFilters(params),
    search: params.search,
    page: params.page,
    limit: params.limit,
    order: params.order
  });
}, listPortalsSchema, {module: 'portals'});

function pickFilters (params) {
  return {
    ...(params.id ? {id: params.id} : {}),
    ...(params.purpose ? {purpose: params.purpose} : {}),
    ...(params.status ? {status: params.status} : {}),
    ...(params.preset ? {preset: params.preset} : {})
  };
}
