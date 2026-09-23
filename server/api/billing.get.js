import baseRoute from '@/core/base-route.js';
import {listBillingSchema} from '@/modules/billing/billing.schema.js';
import {listBilling} from '@/modules/billing/billing.service.js';

export default baseRoute(async (params, context) => {
  return listBilling(context.profile.organization, {
    ...pickFilters(params),
    search: params.search,
    page: params.page,
    limit: params.limit,
    order: params.order
  });
}, listBillingSchema, {module: 'billing'});

function pickFilters (params) {
  return {
    ...(params.id ? {id: params.id} : {}),
    ...(params.status ? {status: params.status} : {}),
    ...(params.preset ? {preset: params.preset} : {})
  };
}
