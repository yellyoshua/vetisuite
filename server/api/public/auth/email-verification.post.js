import zod from 'zod';
import baseRoute from '@/core/base-route.js';
import {confirmEmail} from '@/modules/profile/profile.service.js';

const emailVerificationSchema = zod.object({
  token: zod.string().min(1, 'Token requerido')
});

export default baseRoute(async (data) => {
  return confirmEmail({token: data.token});
}, emailVerificationSchema);
