import baseRoute from '@/core/base-route.js';
import {whatsappAnalyticsSchema} from '@/modules/whatsapp-analytics/whatsapp-analytics.schema.js';
import {getWhatsappAnalytics} from '@/modules/whatsapp-analytics/whatsapp-analytics.service.js';

export default baseRoute(async (params, context) => {
  return getWhatsappAnalytics(context.profile.organization, params, context.timezone);
}, whatsappAnalyticsSchema, {module: 'whatsapp-analytics'});
