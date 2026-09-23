import baseRoute from '@/core/base-route.js';
import {dashboardLaboratorySchema} from '@/modules/dashboard-laboratory/dashboard-laboratory.schema.js';
import {getDashboardLaboratory} from '@/modules/dashboard-laboratory/dashboard-laboratory.service.js';

export default baseRoute(async (_params, context) => {
  return getDashboardLaboratory(context.profile.organization);
}, dashboardLaboratorySchema, {module: 'dashboard-laboratory'});
