import baseRoute from '@/core/base-route.js';
import {countClinicSchema} from '@/modules/clinic/clinic.schema.js';
import {countClinic} from '@/modules/clinic/clinic.service.js';

export default baseRoute(async (params, context) => {
  const value = await countClinic(context.profile.organization, context.timezone, {
    ...pickFilters(params),
    search: params.search
  });

  return {value};
}, countClinicSchema, {module: 'clinic-count'});

function pickFilters (params) {
  return {
    ...(params.id ? {id: params.id} : {}),
    ...(params.kind ? {kind: params.kind} : {}),
    ...(params.status ? {status: params.status} : {}),
    ...(params.preset ? {preset: params.preset} : {})
  };
}
