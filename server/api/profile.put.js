import baseRoute from '@/core/base-route.js';
import {updateEmployeeAccount, updateOwnerAccount, updateSuperadminAccount} from '@/modules/accounts/accounts.service.js';
import {profileSchema} from '@/modules/profile/profile.schema.js';

export default baseRoute(async (data, context) => {
  const {profile, requestId} = context;
  const user = {id: profile.user.id, email: data.email};
  const changes = {...data, id: profile.id, user};

  if (profile.user.role === 'superadmin') {
    await updateSuperadminAccount(changes, {requestId});
  }

  if (profile.user.role === 'owner') {
    await updateOwnerAccount(changes, {requestId});
  }

  if (profile.user.role === 'employee') {
    await updateEmployeeAccount(changes, {requestId});
  }

  return {success: true, avatar: data.avatar ?? null};
}, null, {
  module: 'profile',
  schemaBuilder: (_data, context) => profileSchema(context.profile),
  files: {avatar: {folder: 'images', type: 'photo'}}
});
