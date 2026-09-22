import baseRoute from '@/core/base-route.js';
import {createSuperadminSchema} from '@/modules/superadmins/superadmins.schema.js';
import {createSuperadminAccount} from '@/modules/accounts/accounts.service.js';
import superadminsRepository from '@/modules/superadmins/superadmins.repository.js';

export default baseRoute(async (data, context) => {
  const superadmin = await createSuperadminAccount({
    organization: context.profile.organization,
    firstName: data.firstName,
    lastName: data.lastName,
    avatar: data.avatar,
    user: {email: data.email, password: data.password}
  }, {requestId: context.requestId});

  return superadminsRepository.findOne({id: superadmin.id}, {join: {user: 'id email role emailConfirmed lastSignInAt disabled createdAt'}});
}, createSuperadminSchema, {
  module: 'superadmins',
  files: {avatar: {folder: 'images', type: 'photo'}}
});
