import baseRoute from '@/core/base-route.js';
import {countPortalsSchema} from '@/modules/portals/portals.schema.js';
import {countPortals} from '@/modules/portals/portals.service.js';

export default baseRoute(async (params, context) => {
  const value = await countPortals(context.profile.organization, {
    ...pickFilters(params),
    search: params.search
  });

  return {value};
}, countPortalsSchema, {module: 'portals-count'});

function pickFilters (params) {
  return {
    ...(params.id ? {id: params.id} : {}),
    ...(params.purpose ? {purpose: params.purpose} : {}),
    ...(params.status ? {status: params.status} : {}),
    ...(params.preset ? {preset: params.preset} : {})
  };
}
