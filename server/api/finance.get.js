import baseRoute from '@/core/base-route.js';
import {getFinanceSchema} from '@/modules/finance/finance.schema.js';
import {getFinanceReport} from '@/modules/finance/finance.service.js';

export default baseRoute(async (params, context) => {
  return getFinanceReport(context.profile.organization, params);
}, getFinanceSchema, {module: 'finance'});
