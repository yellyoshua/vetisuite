import baseRoute from '@/core/base-route.js';
import {findOrganizationSchema} from '@/modules/organization/organization.schema.js';
import organizationsRepository from '@/modules/organizations/organizations.repository.js';

export default baseRoute(async (_params, context) => {
  return organizationsRepository.findOne({id: context.profile.organization}, {
    select: {id: true, name: true, timezone: true}
  });
}, findOrganizationSchema, {module: 'organization'});
