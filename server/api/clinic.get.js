import baseRoute from '@/core/base-route.js';
import {listClinicSchema} from '@/modules/clinic/clinic.schema.js';
import {listClinic} from '@/modules/clinic/clinic.service.js';

export default baseRoute(async (params, context) => {
  return listClinic(context.profile.organization, context.timezone, {
    ...pickFilters(params),
    search: params.search,
    page: params.page,
    limit: params.limit,
    order: params.order
  });
}, listClinicSchema, {module: 'clinic'});

function pickFilters (params) {
  return {
    ...(params.id ? {id: params.id} : {}),
    ...(params.kind ? {kind: params.kind} : {}),
    ...(params.status ? {status: params.status} : {}),
    ...(params.preset ? {preset: params.preset} : {})
  };
}
