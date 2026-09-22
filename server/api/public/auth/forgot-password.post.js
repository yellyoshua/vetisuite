import zod from 'zod';
import baseRoute from '@/core/base-route.js';
import authCore from '@/core/auth-core.js';
import events from '@/utils/events.js';

const forgotPasswordSchema = zod.object({
  email: zod.email('El email debe ser válido').transform((email) => email.toLowerCase())
});

const resettableRoles = ['owner', 'employee'];

export default baseRoute(async (data, context) => {
  const user = await authCore.user.findByEmail(data.email);

  if (user && resettableRoles.includes(user.role)) {
    await events.emailAccountManager.publish({action: 'password_reset', userId: user.id, email: data.email}, {requestId: context.requestId});
  }

  return {success: true};
}, forgotPasswordSchema);
