import baseRoute from '@/core/base-route.js';
import {updateVisitStatusSchema} from '@/modules/visits/visits.schema.js';
import {advanceVisitStatus} from '@/modules/visits/visits.service.js';

export default baseRoute(async (data, context) => {
  const visit = await advanceVisitStatus(data.id, context.profile.organization, data.status);

  return {success: true, visit};
}, updateVisitStatusSchema, {module: 'visits-status'});
