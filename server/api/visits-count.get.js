import baseRoute from '@/core/base-route.js';
import {countVisitsSchema} from '@/modules/visits/visits.schema.js';
import {countVisits} from '@/modules/visits/visits.service.js';

export default baseRoute(async (params, context) => {
  const value = await countVisits(context.profile.organization, {
    ...pickFilters(params),
    search: params.search
  });

  return {value};
}, countVisitsSchema, {module: 'visits-count'});

function pickFilters (params) {
  return {
    ...(params.type ? {type: params.type} : {}),
    ...(params.status ? {status: params.status} : {}),
    ...(params.staff ? {staff: params.staff} : {})
  };
}
