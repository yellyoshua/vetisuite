import baseRoute from '@/core/base-route.js';
import {countVisitsGroomingSchema} from '@/modules/visits-grooming/visits-grooming.schema.js';
import {countVisitsGrooming} from '@/modules/visits-grooming/visits-grooming.service.js';

export default baseRoute(async (params, context) => {
  const value = await countVisitsGrooming(context.profile.organization, {
    ...pickFilters(params),
    search: params.search
  });

  return {value};
}, countVisitsGroomingSchema, {module: 'visits-grooming-count'});

function pickFilters (params) {
  return {
    ...(params.status ? {status: params.status} : {}),
    ...(params.preset ? {preset: params.preset} : {})
  };
}
