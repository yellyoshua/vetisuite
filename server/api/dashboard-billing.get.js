import baseRoute from '@/core/base-route.js';
import {dashboardBillingSchema} from '@/modules/dashboard-billing/dashboard-billing.schema.js';
import {getDashboardBilling} from '@/modules/dashboard-billing/dashboard-billing.service.js';

export default baseRoute(async (_params, context) => {
  return getDashboardBilling(context.profile.organization);
}, dashboardBillingSchema, {module: 'dashboard-billing'});
