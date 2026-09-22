import baseRoute from '@/core/base-route.js';
import {changePasswordSchema} from '@/modules/profile/profile.schema.js';
import {changePassword} from '@/modules/profile/profile.service.js';

export default baseRoute((data, context) => changePassword({
  userId: context.profile.user.id,
  currentPassword: data.currentPassword,
  password: data.password
}), changePasswordSchema, {module: 'profile-password'});
