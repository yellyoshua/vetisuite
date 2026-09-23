import baseRoute from '@/core/base-route.js';
import {countBillingSchema} from '@/modules/billing/billing.schema.js';
import {countBilling} from '@/modules/billing/billing.service.js';

export default baseRoute(async (params, context) => {
  const value = await countBilling(context.profile.organization, {
    ...pickFilters(params),
    search: params.search
  });

  return {value};
}, countBillingSchema, {module: 'billing-count'});

function pickFilters (params) {
  return {
    ...(params.id ? {id: params.id} : {}),
    ...(params.status ? {status: params.status} : {}),
    ...(params.preset ? {preset: params.preset} : {})
  };
}
