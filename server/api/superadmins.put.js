import baseRoute from '@/core/base-route.js';
import {updateSuperadminSchema} from '@/modules/superadmins/superadmins.schema.js';
import {updateSuperadminAccount} from '@/modules/accounts/accounts.service.js';
import superadminsRepository from '@/modules/superadmins/superadmins.repository.js';

export default baseRoute(async ({id, ...profile}, context) => {
  await updateSuperadminAccount({...profile, id, user: {}}, {requestId: context.requestId});

  return superadminsRepository.findOne({id}, {join: {user: 'id email role emailConfirmed lastSignInAt disabled createdAt'}});
}, updateSuperadminSchema, {
  module: 'superadmins',
  files: {avatar: {folder: 'images', type: 'photo'}}
});
