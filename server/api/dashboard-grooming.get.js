import baseRoute from '@/core/base-route.js';
import {dashboardGroomingSchema} from '@/modules/dashboard-grooming/dashboard-grooming.schema.js';
import {getDashboardGrooming} from '@/modules/dashboard-grooming/dashboard-grooming.service.js';

export default baseRoute(async (_params, context) => {
  return getDashboardGrooming(context.profile.organization);
}, dashboardGroomingSchema, {module: 'dashboard-grooming'});
