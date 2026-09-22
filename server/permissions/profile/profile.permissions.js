import {pkit} from '../pkit.config.js';
import validators from '@/utils/validators.js';

function assertOwnAvatar (data, context) {
  if (data.avatar === undefined || data.avatar === null) {
    return;
  }

  if (!validators.isOwnFile(data.avatar, context.profile.user.id, context.profile.avatar)) {
    throw {error: 'La foto no pertenece a esta cuenta', status: 403};
  }
}

const profile = pkit.module('profile').name('general');

profile.role('superadmin').registerActions({
  find: {enabled: true, properties: ['avatar', 'firstName', 'lastName', 'user']},
  update: {enabled: true, properties: ['avatar', 'firstName', 'lastName', 'email']}
})
.hook('update', assertOwnAvatar);

profile.role('owner').registerActions({
  find: {enabled: true, properties: ['avatar', 'firstName', 'lastName', 'phone', 'description', 'position', 'occupation', 'organization', 'createdAt', 'user']},
  update: {enabled: true, properties: ['avatar', 'firstName', 'lastName', 'email', 'phone', 'description', 'position', 'occupation']}
})
.hook('update', assertOwnAvatar);

profile.role('employee').registerActions({
  find: {enabled: true, properties: ['avatar', 'firstName', 'lastName', 'phone', 'position', 'color', 'organization', 'createdAt', 'user']},
  update: {enabled: true, properties: ['avatar', 'firstName', 'lastName', 'email', 'phone']}
})
.hook('update', assertOwnAvatar);
