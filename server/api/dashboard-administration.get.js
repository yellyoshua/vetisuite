import baseRoute from '@/core/base-route.js';
import {dashboardAdministrationSchema} from '@/modules/dashboard-administration/dashboard-administration.schema.js';
import {getDashboardAdministration} from '@/modules/dashboard-administration/dashboard-administration.service.js';

export default baseRoute(async (_params, context) => {
  return getDashboardAdministration(context.profile.organization);
}, dashboardAdministrationSchema, {module: 'dashboard-administration'});
