import baseRoute from '@/core/base-route.js';
import {dashboardMarketingSchema} from '@/modules/dashboard-marketing/dashboard-marketing.schema.js';
import {getDashboardMarketing} from '@/modules/dashboard-marketing/dashboard-marketing.service.js';

export default baseRoute(async (_params, context) => {
  return getDashboardMarketing(context.profile.organization);
}, dashboardMarketingSchema, {module: 'dashboard-marketing'});
