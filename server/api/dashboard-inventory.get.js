import baseRoute from '@/core/base-route.js';
import {dashboardInventorySchema} from '@/modules/dashboard-inventory/dashboard-inventory.schema.js';
import {getDashboardInventory} from '@/modules/dashboard-inventory/dashboard-inventory.service.js';

export default baseRoute(async (_params, context) => {
  return getDashboardInventory(context.profile.organization);
}, dashboardInventorySchema, {module: 'dashboard-inventory'});
