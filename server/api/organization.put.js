import baseRoute from '@/core/base-route.js';
import {updateOrganizationSchema} from '@/modules/organization/organization.schema.js';
import {updateOrganization} from '@/modules/organization/organization.service.js';

export default baseRoute(async (data, context) => {
  return updateOrganization(context.profile.organization, data);
}, updateOrganizationSchema, {module: 'organization'});
