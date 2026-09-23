import baseRoute from '@/core/base-route.js';
import {dashboardCareSchema} from '@/modules/dashboard-care/dashboard-care.schema.js';
import {getDashboardCare} from '@/modules/dashboard-care/dashboard-care.service.js';

export default baseRoute(async (_params, context) => {
  return getDashboardCare(context.profile.organization);
}, dashboardCareSchema, {module: 'dashboard-care'});
