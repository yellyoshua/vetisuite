import baseRoute from '@/core/base-route.js';
import {dashboardReceptionSchema} from '@/modules/dashboard-reception/dashboard-reception.schema.js';
import {getDashboardReception} from '@/modules/dashboard-reception/dashboard-reception.service.js';

export default baseRoute(async (_params, context) => {
  return getDashboardReception(context.profile.organization, context.timezone);
}, dashboardReceptionSchema, {module: 'dashboard-reception'});
